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

use \Exception as Exception;
use \DOMDocument as DOMDocument;
use \DOMXPath as DOMXPath;

class evQueue {
	protected $evqueue_ip;
	protected $evqueue_port;
	protected $socket = false;
	protected $connected = false;
	
	protected $parser;
	protected $parser_level ;
	protected $parser_ready;
	protected $parser_root_tag;
	protected $parser_root_attributes;
	protected $user_login;
	protected $user_pwd;
	protected $authentified = false;
	
	const ERROR_AUTH_REQUIRED = 1;
	const ERROR_AUTH_FAILED = 2;
	const ERROR_RESPONSE_KO = 3;
	
	
	public function __construct($cnx_string, $user_login = null, $user_pwd = null) {
		if(substr($cnx_string, 0 ,7) == 'unix://'){
			$this->evqueue_ip =$cnx_string;
			$this->evqueue_port = -1;
			$this->socket = socket_create(AF_UNIX, SOCK_STREAM, SOL_TCP);
		}
		elseif(substr($cnx_string, 0 ,6) == 'tcp://'){
			list($this->evqueue_ip,$this->evqueue_port) = explode(':', substr($cnx_string, 6));
			$this->socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
		}
		else
			throw new Exception("evQueue : Unknown scheme '$cnx_string'");
		
		socket_set_option($this->socket, SOL_SOCKET, SO_RCVTIMEO, ['sec' => 10, 'usec' => 0]);
		socket_set_option($this->socket, SOL_SOCKET, SO_SNDTIMEO, ['sec' => 10, 'usec' => 0]);
		
		$this->user_login = $user_login;
		$this->user_pwd = $user_pwd;
	}
	
	public function __destruct() {
		if($this->authentified)
			$xml = $this->Api('quit');
		$this->disconnect(); 
	}
	
	public function __sleep()
	{
		$this->socket = false;
		return array('evqueue_ip', 'evqueue_port', 'socket');
	}
	
	public function setUserLogin($login){
		$this->user_login = $login;
	}
	
	public function setUserPwd($pwd){
		$this->user_pwd = $pwd;
	}
	
	protected function connect()
	{
		if($this->socket!==false && $this->connected !== false)
			return; // Already connected
		
		socket_set_nonblock($this->socket);
		socket_connect($this->socket, $this->evqueue_ip,$this->evqueue_port);
		
		$read_fd = [];
		$write_fd = [$this->socket];
		$excpt_fd = [];
		if(socket_select($read_fd,$write_fd,$excpt_fd,2)==0)
			throw new Exception("evQueue : unable to connect to core engine with IP $this->evqueue_ip and port $this->evqueue_port");
		
		socket_set_block($this->socket);
 			
		$this->connected = true;
		
		$xml = $this->recv();
		if($this->parser_root_tag == "READY")
			$this->authentified = true;
	}
	
	protected function authentication(){
		$hmac = hash_hmac("sha1",hex2bin($this->parser_root_attributes['CHALLENGE']),$this->user_pwd);
		$dom = $this->build_query('auth', false, ["response" => $hmac, "user" => $this->user_login]);
		$xml = $this->exec($dom->saveXML());
		
		if($this->parser_root_tag == "READY"){
			$this->authentified = true;
			return true;
		}
		else{
			var_dump($this->parser_root_attributes);
			//die("ss".$this->parser_root_tag);
		}
		return false;
	}
	
	protected function disconnect()
	{
		if($this->socket!==false){
			socket_close($this->socket);
			$this->socket=false;
			$this->connected=false;
		}
	}
	
	protected function send($data)
	{
		$written = socket_write($this->socket,$data);
		if($written===false)
			throw new Exception("evQueue : could not write data to socket");
		
		if(strlen($data)!=$written)
			throw new Exception("evQueue : tried to write ".strlen($data)." but only wrote $written");
	}
	
	protected function recv()
	{
		$xml = "";
		$this->ParserInit();
		while(socket_recv($this->socket, $data, 1600, 0)){
			$xml .= $data;
			$this->ParserParse($data);
			if($this->parser_ready === true )
				break;
		}

		if($data===false)
			throw new Exception("evQueue : error reading data");

		return $xml	;
	}
	
	protected function exec($cmd, $return_dom=false)
	{
		$this->send("$cmd\n");
		$out = $this->recv();
		
		return $out;
	}
	
	protected function build_query($name, $action = false, $attributes = [], $parameters = []){
		$dom = new \DOMDocument("1.0", "utf-8");
		$root = $dom->createElement($name);
		if($action)
			$root->setAttribute('action', $action);
		
		foreach ($attributes as $key => $value) {
			$root->setAttribute($key, $value);
		}
		foreach ($parameters as $parameter => $value) {
			$param = $dom->createElement('parameter');
			$param->setAttribute('name', $parameter);
			$param->setAttribute('value', $value);
			$root->appendChild($param);
		}
		$dom->appendChild($root);
		
		return $dom;
	}
	
	public function Launch($name, $attributes=[], $parameters=[]) {
		$attributes['name'] = $name;
		$xml = $this->Api('instance', 'launch', $attributes, $parameters);
		
		return (int)$this->parser_root_attributes['WORKFLOW-INSTANCE-ID'];
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

	
	public  function GetRunningTasks($workflow_instance_id) {
		$dom = $this->exec("<workflow id='$workflow_instance_id' />",true);
		$xpath = new DOMXpath($dom);
		
		$nodes = $xpath->query("//task[@status='EXECUTING']/@name");
		$tasks = array();
		foreach($nodes as $node)
			$tasks[] = $node->nodeValue;
		
		return $tasks;
	}

		
	public function Api($name, $action = false, $attributes = [], $parameters = []){
		if(!$this->connected)
			$this->connect();
			
		if(!$this->authentified){
			if($this->user_login === null)
				throw new Exception("evQueue : login and password required", evQueue::ERROR_AUTH_REQUIRED);
			
			if(!$this->authentication())
				throw new Exception("evQueue : authentication failed", evQueue::ERROR_AUTH_FAILED);
		}
		
		$dom = $this->build_query($name,$action,$attributes,$parameters);
		
		$xml = $this->exec($dom->saveXML());
		
		if(!isset($this->parser_root_attributes['STATUS']) || $this->parser_root_attributes['STATUS']!='OK')
			throw new Exception("evQueue : error returned from engine : {$this->parser_root_attributes['ERROR']}", evQueue::ERROR_RESPONSE_KO);
		
		return trim($xml);		
	}
	
	
	protected function ParserInit()	{
		$this->parser_level = 0;
		$this->parser_ready = false;
		$this->parser = xml_parser_create();
	
		xml_set_object($this->parser, $this);
		xml_set_element_handler($this->parser, "ParserOpen", "ParserClose");
	}
	
	protected function ParserParse($data) 
	{
		xml_parse($this->parser, $data);
	}
	
	protected function ParserOpen($parser, $tag, $attributes) 
	{
		if($this->parser_level == 0){
			$this->parser_root_tag = $tag;
			$this->parser_root_attributes = $attributes;
		}
		$this->parser_level++;
	}
	
	protected function ParserClose($parser, $tag) 
	{
		$this->parser_level--;
		if($this->parser_level == 0)
			$this->parser_ready = true;
	}
}



//fonction pour ecrire dans les logs
// fonction pour augmenter le %

?>
