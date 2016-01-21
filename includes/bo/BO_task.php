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
  * Authors: Nicolas Jean, Christophe Marti 
  */

require_once 'inc/logger.php';
require_once 'lib/DatabaseMySQL.php';
require_once 'lib/workflow_instance.php';
require_once 'bo/BO_workflow.php';

class Task{
	
	private $db;
	
	private $id;
	private $name;
	private $binary_path;
	private $parameters_mode;
	private $output_method;
	private $xsd=null;
	private $user=null;
	private $host=null;
	private $wd;
	private $group;
	private $workflow_id = null;  // bounds a task to a particular, simple workflow (e.g. the task needs to be deleted with it)
	private $binary_content;
	
	function __construct($id = false){
		
		$this->connectDB();
		
		if ($id === false or $id == ""){
			$this->id = false;
			return;
		}

		$this->db->QueryPrintf("SELECT * FROM t_task WHERE task_id = %i", $id);
		$row = $this->db->FetchAssoc();
		if(!$row)
			return false;
		
		$this->id = $row['task_id'];
		$this->name = $row['task_name'];
		$this->binary_path = $row['task_binary'];
		$this->parameters_mode = $row['task_parameters_mode'];
		$this->output_method = $row['task_output_method'];
		$this->xsd = $row['task_xsd'];
		$this->user = $row['task_user'];
		$this->host = $row['task_host'];
		$this->wd = $row['task_wd'];
		$this->group = $row['task_group'];

	}
	
	private function connectDB ($mode = null) {
		if ($mode === null)
			$mode = DatabaseMySQL::$MODE_RDONLY;
			
			$this->db = new DatabaseMySQL ('queueing', $mode);

		return $this->db;
	}	

	public function set_id($id){
		$this->id = $id; 
	}
	
	public function get_id(){
		return $this->id;
	}
	
	public function set_name($name){
		$this->name = $name;
	}
	
	public function get_name(){
		return $this->name;
	}
	
	public function set_binary_path($binary_path){
		$this->binary_path = $binary_path;
	}
	
	public function get_binary_path(){
		return $this->binary_path;
	}
	
	public function set_parameters_mode($parameters_mode){
		$this->parameters_mode = $parameters_mode;
	}
	
	public function get_parameters_mode(){
		return $this->parameters_mode;
	}
	
	public function set_output_method ($output_method) {
		$this->output_method = $output_method;
	}
	
	public function get_output_method (){
		return $this->output_method;
	}
	
	public function set_xsd($xsd){
		$this->xsd = $xsd ? $xsd : null;
	}
	
	public function get_xsd(){
		return $this->xsd;
	}
	
	public function set_user($user){
		$this->user = $user ? $user : null;
	}
	
	public function get_user(){
		return $this->user;
	}
	
	public function set_host($host){
		$this->host = $host ? $host : null;
	}
	
	public function get_host(){
		return $this->host;
	}
	
	public function set_wd($wd){
		$this->wd = $wd ? $wd : null;
	}
	
	public function get_wd(){
		return $this->wd;
	}
	
	public function set_group($group){
		$this->group = $group;
	}
	
	public function get_group(){
		return $this->group;
	}
	
	public function set_workflow_id ($workflow_id) {
		$this->workflow_id = $workflow_id;
	}
	
	public function get_workflow_id () {
		return $this->workflow_id;
	}
	
	public function set_binary_content ($binary_content) {
		$this->binary_content = $binary_content;
	}
	
	public function CommitObject()
	{
		$this->connectDB(DatabaseMySQL::$MODE_RDRW);
		
		if ($this->id === false) {
			
			if ($this->binary_content && !WorkflowInstance::PutTaskFile($this->binary_path, $this->binary_content))
				return array('cant-put-task' => "The binary '$this->binary_path' could not be saved by evqueue (evqueue not running? binary with same name already exists?)");
			
			$this->db->QueryPrintf("
					INSERT INTO t_task (
					task_name, task_binary, task_user, task_host, task_parameters_mode, task_output_method, task_xsd, task_wd, task_group, workflow_id
			) VALUES (
					%s,%s,%s,%s,%s,%s,%s,%s,%s,%i
			)",	$this->name, $this->binary_path, $this->user, $this->host, $this->parameters_mode, $this->output_method, $this->xsd, $this->wd, $this->group, $this->workflow_id);
			
			$this->id = $this->db->GetInsertID();
			
		}else{
			$this->db->QueryPrintf("
					UPDATE t_task
					SET
						task_name = %s,
						task_binary = %s,
						task_user = %s,
						task_host = %s,
						task_parameters_mode = %s,
						task_output_method = %s,
						task_xsd = %s,
						task_wd = %s,
						task_group = %s
					WHERE task_id = %i
					",
					$this->name,
					$this->binary_path,
					$this->user,
					$this->host,
					$this->parameters_mode,
					$this->output_method,
					$this->xsd,
					$this->wd,
					$this->group,
					$this->id);
		}
		
		WorkflowInstance::ReloadEvqueue();
		return true;
	}
	
	public static function existsTaskName($name, $id=null){
		$db = new DatabaseMySQL('queueing');
		
		if ($id == null){
			$db->QueryPrintf("SELECT * FROM t_task WHERE task_name = %s ;",$name);
		}else{
			$db->QueryPrintf("SELECT * FROM t_task WHERE task_name = %s and task_id != %i  ;",$name,$id);
		}
		
		if ($db->NumRows() > 0){
			$task = $db->FetchAssoc();
			return $task['task_id'];
		}else{
			return false;
		}
	}
	
	public static function TaskExists($params) {
		$db = new DatabaseMySQL('queueing');
		
		$db->QueryPrintf('SELECT * FROM t_task WHERE task_name = %s', $params['task_name']);
		if ($db->NumRows() == 0)
			return false;
		
		$task = $db->FetchAssoc();
		
		$db_params_ok =
			$task['task_binary']          == $params['task_binary_path'] &&
			$task['task_wd']              == $params['task_wd'] &&
			$task['task_host']            == $params['task_host'] &&
			$task['task_user']            == $params['task_user'] &&
			$task['task_parameters_mode'] == $params['task_parameters_mode'] &&
			$task['task_output_method']   == $params['task_output_method'];
//			$task['task_xsd']             == $params['task_xsd'] &&   // (2015-06-24) not really used yet, let's not block on this
//			$task['task_group']           == $params['task_group'];   // the group of a task is just a plain text comment, it does not matter while comparing two tasks
		
		if (!$db_params_ok)
			return false;
		
		// also check the binary stored by evQueue
		if (isset($params['binary_content'])) {
			$evqueue_bin = WorkflowInstance::GetTaskFile($task['task_binary']);
			if ($evqueue_bin != $params['binary_content'])
				return false;
		}
		
		return true;
	}
	
	public function check_values($vals, $setvals=false, $confirmed=false){
		$errors = array();
		
		if (isset($vals["task_id"]) && $vals["task_id"] != ""){
			$taskid = $vals["task_id"];
		}else{
			$taskid = null;
		}
		
		if (isset($vals["task_id"]) && $vals["task_id"] != "" && $setvals === true){
			$this->set_id($vals["task_id"]);
		}

		if (!isset($vals["task_name"]) || $vals["task_name"] == ""){
			$errors["task_name"]="Please fill the task name field";
			
		}else if(self::existsTaskName($vals["task_name"],$taskid)){
			$errors["task_name"]="Another task already has the same name '{$vals["task_name"]}'. Please change your task's name.";
			
		}else if (!preg_match('/^[0-9a-zA-Z-_]+$/',$vals["task_name"])){
			$errors["task_name"]="The task name can only have letters, numbers and dashes. Please change your task's name.";
			
		}else if (!$confirmed && $vals["task_name"] != $this->name) {  // ask user confirmation if task is used in (running/available) workflows
			$wfs = $this->GetLinkedWorkflows();
			if (count($wfs) > 0)
				return array('confirm'=>"Following workflows use this task and will error if you delete it: [".join(', ',array_map(function ($wf) {return $wf->get_name();}, $wfs)).']');
			
			$wfs = $this->GetLinkedWorkflowInstances();
			if (count($wfs) > 0)
				return array('confirm'=>"Following RUNNING workflows use this task and will error if you delete it: [".join(', ',array_map(function ($wf) {return $wf->get_workflow_instance_id().':'.$wf->getWorkflowName();}, $wfs)).']');
			
			if ($setvals === true)
				$this->set_name($vals["task_name"]);
			
		}else if ($setvals === true){
				$this->set_name($vals["task_name"]);
		}
		
		if (isset($vals["task_user"])){
			if (!preg_match('/^[0-9a-zA-Z-_]+$/',$vals["task_user"]) && !empty($vals["task_user"])){
				$errors["task_user"]="The task user can only have letters, numbers and dashes. Please change your task's user.";
			}else if ($setvals === true){
				$this->set_user($vals["task_user"]);
			}
		}
		
		if (isset($vals["task_host"])){
			if (!preg_match('/^[0-9a-zA-Z-_.]+$/',$vals["task_host"]) && !empty($vals["task_host"])){
				$errors["task_host"]="The task host can only have letters, numbers and dashes. Please change your task's host.";
			}else if ($setvals === true){
				$this->set_host($vals["task_host"]);
			}
		}
		
		if (!isset($vals["task_binary_path"]) || $vals["task_binary_path"] == ""){
			$errors["task_binary_path"]="Please define a binary path";
		}else{
			if ($this->id === false or ($this->binary_path != $vals["task_binary_path"]) && $setvals === true){
				$this->set_binary_path($vals["task_binary_path"]);
			}

		}
		
		if (!isset($vals["task_parameters_mode"]) || $vals["task_parameters_mode"] == ""){
			$errors["task_parameters_mode"]="Please choose the task parameters mode";
		}else{
			if ($setvals === true){
				$this->set_parameters_mode($vals["task_parameters_mode"]);
			}
		}
		
		$this->set_output_method($vals["task_output_method"]);
		
		if (isset($vals["task_xsd"])){
			if ($setvals === true){
				$this->set_xsd($vals["task_xsd"]);
			}
		}
		
		if (isset($vals["task_wd"])){
			if ($setvals === true){
				$this->set_wd($vals["task_wd"]);
			}
		}
		
		if (isset($vals["task_group"])){
			if ($setvals === true){
				$this->set_group($vals["task_group"]);
			}
		}
		
		if (isset($vals['workflow_id']))
			$this->set_workflow_id($vals['workflow_id']);
		
		if (isset($vals["binary_content"])){
			$this->set_binary_content($vals["binary_content"]);
		}
		
		if (count($errors)>0)
			return $errors;

		if ($setvals === true){
			$this->CommitObject();
		}
		
		return true;
	}
	
	public function getGeneratedXml(){
		$xml = '<task id="'.$this->get_id().'">';
		$xml .= '<task_name>'.htmlspecialchars($this->get_name()).'</task_name>';
		$xml .= '<task_binary>'.htmlspecialchars($this->get_binary_path()).'</task_binary>';
		$xml .= '<task_parameters_mode>'.$this->get_parameters_mode().'</task_parameters_mode>';
		$xml .= '<task_output_method>'.$this->get_output_method().'</task_output_method>';
		$xml .= '<task_xsd>'.$this->get_xsd().'</task_xsd>';
		$xml .= '<task_user>'.$this->user.'</task_user>';
		$xml .= '<task_host>'.$this->host.'</task_host>';
		$xml .= '<task_wd>'.$this->wd.'</task_wd>';
		$xml .= '<task_group>'.htmlspecialchars($this->group).'</task_group>';
		$xml .= '<workflow_id>'.$this->get_workflow_id().'</workflow_id>';
		$xml .= '</task>';
		return $xml;
	}
	
	public static function getAll($filter=null){
		$res = array();
		$db = new DatabaseMySQL('queueing');
		
		$query = "SELECT * FROM t_task";
		
		switch ($filter) {
			case 'no-tied-task':
				$query .= ' WHERE workflow_id IS NULL';
				break;
			case 'only-tied-task':
				$query .= ' WHERE workflow_id IS NOT NULL';
				break;
		}
		$query .= " ORDER BY CASE WHEN task_group = '' THEN 2 ELSE 1 END, task_name ASC";
		
		$db->Query($query);
		
		while(($row = $db->FetchAssoc()) !== false){
			$res[]=$row;
		}
		return $res;
	}
	
	// TODO: use getGeneratedXml()!
	public static function getAllXml($filter=null){
		$res = Task::getAll($filter);
		
		$xml = "<tasks>";
		for($i=0;$i<count($res);$i++){
			$xml .= '<task id="'.$res[$i]["task_id"].'">';
			$xml .= '<task_name>'.htmlspecialchars($res[$i]["task_name"]).'</task_name>';
			$xml .= '<task_binary>'.htmlspecialchars($res[$i]["task_binary"]).'</task_binary>';
			$xml .= '<task_parameters_mode>'.$res[$i]["task_parameters_mode"].'</task_parameters_mode>';
			$xml .= '<task_output_method>'.$res[$i]["task_output_method"].'</task_output_method>';
			$xml .= '<task_xsd>'.$res[$i]["task_xsd"].'</task_xsd>';
			$xml .= '<task_user>'.$res[$i]["task_user"].'</task_user>';
			$xml .= '<task_host>'.$res[$i]["task_host"].'</task_host>';
			$xml .= '<task_wd>'.$res[$i]["task_wd"].'</task_wd>';
			$xml .= '<task_group>'.htmlspecialchars($res[$i]["task_group"]).'</task_group>';
			$xml .= '<workflow_id>'.$res[$i]["workflow_id"].'</workflow_id>';
			$xml .= '</task>';
		}
		$xml .= "</tasks>";
		return $xml;
	}
	
	public function delete($confirmed=false,$delete_binary=false){
		
		if ($this->id !== false) {
			
			if (!$confirmed) {  // ask user confirmation if task is used in (running/available) workflows
				$wfs = $this->GetLinkedWorkflows();
				if (count($wfs) > 0)
					return array('confirm'=>"Following workflows use this task and will error if you delete it: [".join(', ',array_map(function ($wf) {return $wf->get_name();}, $wfs)).']');
					
				$wfs = $this->GetLinkedWorkflowInstances();
				if (count($wfs) > 0)
					return array('confirm'=>"Following RUNNING workflows use this task and will error if you delete it: [".join(', ',array_map(function ($wf) {return $wf->get_workflow_instance_id().':'.$wf->getWorkflowName();}, $wfs)).']');
			}
			
			if ($delete_binary)
				WorkflowInstance::DeleteTaskFile($this->binary_path);
			
			$this->connectDB(DatabaseMySQL::$MODE_RDRW);
			$this->db->QueryPrintf("
					DELETE FROM t_task
					WHERE task_id = %i
					",
					$this->id);
			
			WorkflowInstance::ReloadEvqueue();
			
			return true;
		}else{
			return false;
		}
	}
	
	public static function getAllGroup(){
		$res = array();
		$db = new DatabaseMySQL('queueing');
		$db->Query("SELECT DISTINCT task_group FROM t_task ORDER BY task_group ASC;");
		
		while(($row = $db->FetchAssoc()) !== false)
			$res[] = $row['task_group'];
		return $res;
	}
	
	public static function getAllGroupXml(){
		$res = Task::getAllGroup();
		$xml = '<tasks-groups>';
		foreach ($res as $value) {
			if($value != '')
				$xml .= "<group>$value</group>";
		}
		$xml .= "<group></group>";
		$xml .= '</tasks-groups>';
		
		return $xml;
	}
	
	/*
	 * Return workflows that make use of this task.
	 */
	public function GetLinkedWorkflows(){
		$wfs = array();
		
		$xml = Workflow::getAllXml(false,'workflows',false);
		$dom = new DOMDocument();
		$dom->loadXML($xml);
		$xpath = new DOMXPath($dom);
		$DOMwfs = $xpath->evaluate("//tasks/task[@name='{$this->name}']/ancestor::workflow/@id");
		foreach ($DOMwfs as $DOMwf) {
			$wfs[] = new Workflow($DOMwf->nodeValue);
		}
		return $wfs;
	}
	
	/*
	 * Return workflow instances (running workflows) that make use of this task.
	 */
	public function GetLinkedWorkflowInstances(){
		$wfs = array();
		
		$dom = new DOMDocument();
		$wfi = new WorkflowInstance();
		$running = $wfi->GetRunningWorkflows();
		if (!$running)  // evqueue not running?
			return array();
		
		$dom->loadXML($running);
		$xpath = new DOMXPath($dom);
		$DOMwfs = $xpath->evaluate("//tasks/task[@name='{$this->name}']/ancestor::workflow/@id");
		foreach ($DOMwfs as $DOMwf) {
			$wfs[] = new WorkflowInst($DOMwf->nodeValue);
		}
		return $wfs;
	}
	
}

?>