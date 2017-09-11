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
	protected $version = false;

	protected $parser;
	protected $parser_level ;
	protected $parser_ready;
	protected $parser_root_tag;
	protected $parser_root_attributes;
	protected $user_login;
	protected $user_pwd;
	protected $authentified = false;
	protected $profile;

	const ERROR_AUTH_REQUIRED = 1;
	const ERROR_AUTH_FAILED = 2;
	const ERROR_RESPONSE_KO = 3;
	const ERROR_ENGINE_NAME = 4;
	const ERROR_ENGINE = 5;


	public function __construct($cnx_string, $user_login = null, $user_pwd = null, $user_pwd_hashed = false) {
		if(substr($cnx_string, 0 ,7) == 'unix://'){
			$this->evqueue_ip =substr($cnx_string, 6);
			$this->evqueue_port = 0;
			$this->socket = socket_create(AF_UNIX, SOCK_STREAM, 0);
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
		$this->SetUserPwd($user_pwd, $user_pwd_hashed);
	}

	public function __destruct() {
		if($this->authentified)
		{
			try {
				$xml = $this->Api('quit');
			}
			catch(Exception $e) {}
		}
		$this->disconnect();
	}

	public function __sleep()
	{
		$this->socket = false;
		return array('evqueue_ip', 'evqueue_port', 'socket');
	}

	public function SetUserLogin($login){
		$this->user_login = $login;
	}

	public function SetUserPwd($pwd, $user_pwd_hashed = false){
		if($user_pwd_hashed)
			$this->user_pwd = $pwd;
		else
			$this->user_pwd = sha1($pwd, true);
	}

	protected function connect()
	{
		if($this->socket!==false && $this->connected !== false)
			return; // Already connected

		socket_set_nonblock($this->socket);
		@socket_connect($this->socket, $this->evqueue_ip,$this->evqueue_port);

		$read_fd = [];
		$write_fd = [$this->socket];
		$excpt_fd = [];
		if(socket_select($read_fd,$write_fd,$excpt_fd,2)==0)
			throw new Exception("evQueue : unable to connect to core engine with IP $this->evqueue_ip and port $this->evqueue_port");

		socket_set_block($this->socket);

		$this->connected = true;

		$xml = $this->recv();
		if($this->parser_root_tag == "READY"){
			$this->authentified = true;
			$this->profile = $this->parser_root_attributes['PROFILE'];
		}
	}

	protected function authentication(){
		$hmac = hash_hmac("sha1",hex2bin($this->parser_root_attributes['CHALLENGE']),$this->user_pwd);
		$dom = $this->build_query('auth', false, ["response" => $hmac, "user" => $this->user_login]);
		$xml = $this->exec($dom->saveXML());

		if($this->parser_root_tag == "READY"){
			$this->authentified = true;
			$this->profile = $this->parser_root_attributes['PROFILE'];

			$this->version = $this->parser_root_attributes['VERSION'];

			return true;
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
		$written = @socket_write($this->socket,$data);
		if($written===false)
			throw new Exception("evQueue : could not write data to socket");

		if(strlen($data)!=$written)
			throw new Exception("evQueue : tried to write ".strlen($data)." but only wrote $written");
	}

	protected function recv()
	{
		$xml = "";
		$data = false;

		$this->ParserInit();
		while($recv = @socket_recv($this->socket, $data, 1600, 0)){
			$xml .= $data;
			$this->ParserParse($data);
			if($this->parser_ready === true )
				break;
		}
		if($data===false || $data === NULL)
			throw new Exception("evQueue : error reading data", evQueue::ERROR_ENGINE);

		return $xml	;
	}

	protected function exec($cmd, $return_dom=false)
	{
		$this->send("$cmd\n");
		do{
			$out = $this->recv();
		}
		while($this->parser_root_tag == "PING");

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
		$this->Api('instance', 'launch', $attributes, $parameters);
		return (int)$this->parser_root_attributes['WORKFLOW-INSTANCE-ID'];
	}


	/*
	 * Gives the status of a workflow instance determined by $workflow_instance_id.
	 * @return the status as a string, or raises an Exception if the workflow
	 * instance wasn't found.
	 */
	public function GetWorkflowStatus( $workflow_instance_id ) {

		$xml = $this->Api('instance', 'query', [ 'id' => $workflow_instance_id]);
		$sxml = simplexml_load_string($xml);
		return (string)($sxml->workflow['status']);
	}

	/*
	 * Gets the complete XML output of a workflow instance determined by $workflow_instance_id.
	 * Useful if your code has to fetch some information that was generated by the
	 * workflow, like a filename or result.
	 * @return the XML output as a string, or raises an Exception if the workflow
	 * instance wasn't found.
	 */
	public function GetWorkflowOutput( $workflow_instance_id ) {
		$xml = $this->Api('instance', 'query', [ 'id' => $workflow_instance_id]);
		$dom = new DOMDocument();
		if (!@$dom->loadXML($xml))
			throw new Exception('Invalid XML returned by API.');

		return $dom->saveXML($dom->documentElement->childNodes->item(0));  // discard the <response> tag, simply return the <workflow> XML
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
			throw new Exception("evQueue error returned from engine : {$this->parser_root_attributes['ERROR']}", evQueue::ERROR_RESPONSE_KO);

		return trim($xml);
	}

	public function GetVersion() {
		return $this->version;
	}

	public function GetProfile(){
		return $this->profile;
	}

  public function GetConfigurationEntry($name) {
		$xml = $this->Api('status','query',[ 'type' => 'configuration' ]);
    return self::ParseConfigurationEntry($xml,$name);
  }
  
  public static function ParseConfigurationEntry($xml,$name)
  {
    $dom = new DOMDocument();
		$dom->loadXML($xml);

		$xpath = new DOMXpath($dom);
		$nodes = $xpath->query('/response/configuration/entry[@name = "'.htmlspecialchars($name).'"]');
		if($nodes->length==0)
			return false;
		return $nodes->item(0)->getAttribute('value');
  }

	protected function ParserInit() {
		$this->parser_level = 0;
		$this->parser_ready = false;
		$this->parser = xml_parser_create();

		$this->parser_root_tag = "";
		$this->parser_root_attributes = [];


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

	public function GetParserRootAttributes(){
		return $this->parser_root_attributes;
	}
}

?>
