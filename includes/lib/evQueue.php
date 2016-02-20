<?php
 /*
  * This file is part of evQueue
  * 
  * evQueue is free software: you can redistribute it and/or modify
  * it under the terms of the GNU General Public License as published by
  * the Free Software Foundation, either version 3 of the License, or
  * (at your option) any later version.
  * 
  * evQueue is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  * GNU General Public License for more details.
  *
  * You should have received a copy of the GNU General Public License
  * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
  * 
  * Author: Thibault Kummer
  */

class evQueue {
	protected $evqueue_ip;
	protected $evqueue_port;
	protected $socket = false;
	
	public function __construct($cnx_string) {
		if(substr($cnx_string, 0 ,7) == 'unix://'){
			$this->evqueue_ip =$cnx_string;
			$this->evqueue_port = -1;
		}
		elseif(substr($cnx_string, 0 ,6) == 'tcp://'){
			list($this->evqueue_ip,$this->evqueue_port) = explode(':', substr($cnx_string, 6));
		}
		else
			throw new Exception("evQueue : Unknown scheme '$cnx_string'");
	}
	
	protected function connect()
	{
		if($this->socket!==false)
			return; // Already connected
		
		$this->socket = @fsockopen($this->evqueue_ip,$this->evqueue_port);
		if ($this->socket === false)
 			throw new Exception("evQueue : unable to conect to core engine with IP $this->evqueue_ip and port $this->evqueue_port");
	}
	
	protected function disconnect()
	{
		fclose($this->socket);
		$this->socket=false;
	}
	
	protected function send($data)
	{
		$written = @fwrite($this->socket,$data);
		
		if($written===false)
			throw new Exception("evQueue : could not write data to socket");
		
		if(strlen($data)!=$written)
			throw new Exception("evQueue : tried to write ".strlen($data)." but only wrote $written");
	}
	
	protected function recv()
	{
		$data = stream_get_contents($this->socket);
		
		if($data===false)
			throw new Exception("evQueue : error reading data");
		
		return $data	;
	}
	
	protected function exec($cmd)
	{
		$this->connect();
		$this->send($cmd);
		$out = $this->recv();
		$this->disconnect();
		
		$dom = new DOMDocument();
		if (!@$dom->loadXML($out))
			throw new Exception("evQueue : invalid XML returned from engine : $out");
		
		$xpath = new DOMXPath($dom);
		$status = $xpath->evaluate("string(/return/@status)");
		$error = $xpath->evaluate("string(/return/@error)");
		
		if($status=='KO')
			throw new Exception("evQueue : error executing command $cmd. Got error $error from engine.");
		
		return $out;
	}
	
	/**
	 * 
	 * @param type $workflow_name
	 * @param array $parameters (<string> => </string>)
	 * @param type $mode 'synchronous'/'asynchronous'
	 * @return boolean
	 */
	public function LaunchWorkflowInstance($workflow_name, $parameters = array(), $mode = 'asynchronous', $user_host = false) {
		$params_xml = '';
		foreach ($parameters as $param => $value) {
			$param = htmlspecialchars($param);
			$value = htmlspecialchars($value);
			$params_xml .= "<parameter name=\"$param\" value=\"$value\" />";
		}
		
		$workflow_name = htmlspecialchars($workflow_name);
		if ($user_host) {
			list($user,$host) = split('@', $user_host);
			$user = htmlspecialchars($user);
			$host = htmlspecialchars($host);
			$user_host = $user ? "user='$user' host='$host'" : "host='$host'";
		} else {
			$user_host = '';
		}
		
		$wf = "<workflow name='$workflow_name' action='info' mode='$mode' $user_host>$params_xml</workflow>\n";
		
		$xml_str = $this->exec($wf);
		
		$xml = simplexml_load_string($xml_str);
		
		return (int)$xml->attributes()->{'workflow-instance-id'};
	}
	
	
	/*
	 * Gives the status of a workflow instance determined by $workflow_instance_id.
	 * @return the status as a string, or false if the workflow instance was not
	 * found.
	 */
	public function GetWorkflowStatus( $workflow_instance_id ) {
		$output = $this->exec("<workflow id='$workflow_instance_id' />");
		
		$xml = simplexml_load_string($output);
		$workflow_instance_status = (string)$xml['status'];
		
		if (in_array($workflow_instance_status, array('EXECUTING','TERMINATED','ABORTED')))
			return $workflow_instance_status;
		
		return false;
	}
	
	public function GetWorkflowOutput($workflow_instance_id) {
		return $this->exec("<workflow id='$workflow_instance_id' />");
	}
	
	
	public function StopWorkflow ($workflow_instance_id) {
		
		$this->exec("<workflow id='$workflow_instance_id' action='cancel' />");
	}
	
	
	public function GetStatistics($type)
	{
		return $this->exec("<statistics type='$type' />");
	}
	
	public function GetConfiguration()
	{
		return $this->exec("<status type='configuration' />");
	}
	
	
	public function ResetStatistics()
	{
		return $this->exec("<statistics type='global' action='reset' />");
	}
	
	
	/*
	 * Reloads the lists of tasks, workflows and workflow schedules.
	 */
	public function ReloadEvqueue ()
	{
		$this->exec("<control action='reload' />");
	}
	
	
	/*
	 * Write all tasks stored in database to disk
	 */
	public function SyncTasks ()
	{
		$this->exec("<control action='synctasks' />");
	}
	
	/*
	 * Asks all tasks having a retry schedule, and that failed, to try again immediately.
	 */
	public function RetryAll () {
		$this->exec("<control action='retry' />");
	}
	
	/*
	 * Immediately stops the execution of a task.
	 */
	public function KillTask ($workflow_instance_id, $task_pid) {
		$this->exec("<workflow id='$workflow_instance_id' action='killtask' pid='$task_pid' />");
	}
	
	
	public function GetNextExecutionTime() {
		return $this->exec('<status type="scheduler" />');
	}
	
	
	public function GetRunningWorkflows() {
		return $this->exec('<status type="workflows" />');
	}
	
	private function put_or_remove_file ($type,$action,$filename,$data='') {
		$filename = htmlspecialchars($filename);
		$data = base64_encode($data);
		
		$this->exec("<$type action='$action' filename='$filename' data='$data' />");
	}
	
	/*
	 * Asks evqueue to store a notification binary on its machine.
	 */
	public function StoreFile ($filename,$data) {
		$this->put_or_remove_file('notification','put',$filename,$data);
	}
	
	/*
	 * Asks evqueue to delete a notification binary, previously stored via StoreFile, on its machine.
	 */
	public function DeleteFile ($filename) {
		$this->put_or_remove_file('notification','remove',$filename);
	}
	
	/*
	 * Asks evqueue to store a notification configuration file on its machine.
	 */
	public function StoreConfFile ($filename,$data) {
		$this->put_or_remove_file('notification','putconf',$filename,$data);
	}
	
	/*
	 * Asks evqueue to delete a file configuration, previously stored via StoreConfFile, on its machine.
	 */
	public function DeleteConfFile ($filename) {
		$this->put_or_remove_file('notification','removeconf',$filename);
	}
	
	/*
	 * Asks evqueue to return the content of a file configuration, previously stored via StoreConfFile.
	 */
	public function GetConfFile ($filename) {
		$filename = htmlspecialchars($filename);
		
		$out = $this->exec("<notification action='getconf' filename='$filename' />");
		$dom = new DOMDocument();
		$dom->loadXML($out);
		$xpath = new DOMXPath($dom);
		$data = $xpath->evaluate("string(/return/@data)");
		
		return $data===false ? false : base64_decode($data);
	}
	
	/*
	 * Asks evqueue to return the content of a task file.
	 */
	public function GetTaskFile ($filename) {
		$filename = htmlspecialchars($filename);
		
		$out = $this->exec("<task action='get' filename='$filename' />");
		$dom = new DOMDocument();
		$dom->loadXML($out);
		$xpath = new DOMXPath($dom);
		
		$data = $xpath->evaluate("string(/return/@data)");
		
		return $data===false ? false : base64_decode($data);
	}
	
	/*
	 * Asks evqueue to store given task file.
	 */
	public function PutTaskFile ($filename,$data) {
		$this->put_or_remove_file('task','put',$filename,$data);
	}
	
	/*
	 * Asks evqueue to delete a task file.
	 */
	public function DeleteTaskFile ($filename) {
		$this->put_or_remove_file('task','remove',$filename);
	}
	
}

?>