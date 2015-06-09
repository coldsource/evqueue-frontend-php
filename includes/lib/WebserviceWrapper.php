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

require_once 'conf/sites_base.php';
require_once 'lib/Logger.php';

class WebserviceWrapper
{
	protected $ws_name;
	protected $ws_parameters;
	protected $post;
	protected $node_name;
	protected $xmldoc;
	protected $log_level = null;
	protected $errors = null;
	
	public function __construct($node_name,$ws_name,$ws_parameters = array(),$post=false)
	{
		$this->node_name = $node_name;
		$this->ws_name = $ws_name;
		$this->ws_parameters = $ws_parameters;
		$this->post = $post;
		$this->xmldoc = null;
		
		$this->ws_parameters = array_merge($this->ws_parameters, array('form_id'=>$this->ws_name, 'setVals'=>'1'));
	}
	
	public function SetLogLevel ($level) {
		$this->log_level = $level;
	}

	public function FetchResult()
	{
		if($this->xmldoc!==null)
			return $this->xmldoc;
		
		$this->ws_parameters['user_login'] = $_SESSION['user_login'];
		
		$url = SITE_BASE.'ajax/send_datas.php';
		
		$cr = curl_init();
		
		if ($this->log_level !== null)
			curl_setopt($cr, CURLOPT_HTTPHEADER, array("X-Logger-Filter: $this->log_level"));
		
		curl_setopt($cr, CURLOPT_POST, $this->post);
		
		if(sizeof($this->ws_parameters)>0)
		{
			if ($this->post)
				curl_setopt($cr, CURLOPT_POSTFIELDS, http_build_query($this->ws_parameters));
			else
				$url .= '?'.http_build_query($this->ws_parameters);
		}
		
		curl_setopt($cr, CURLOPT_URL, $url);
		curl_setopt($cr, CURLOPT_RETURNTRANSFER, true);
		
		if(Logger::GetInstance()->GetFilterPriority()>=LOG_INFO)
			$t1 = microtime(true);
		
		$result = curl_exec($cr);
		
		if(Logger::GetInstance()->GetFilterPriority()>=LOG_INFO)
		{
			$t = number_format((microtime(true) - $t1)*1000,1);
			Logger::GetInstance()->Log(LOG_INFO,'WebserviceWrapper',"Called $url in $t ms");
		}
		
		$result = trim($result);
		if($result=='')
			Logger::GetInstance()->Log(LOG_ERR,'WebserviceWrapper',"Empty result while calling {$this->ws_name}");
		
		$this->xmldoc = new DOMDocument();
		if (!@$this->xmldoc->loadXML($result))
			Logger::GetInstance()->Log(LOG_ERR,'WebserviceWrapper',"Invalid xml returned while calling {$this->ws_name}: ".htmlspecialchars($result));
		
		return $this->xmldoc;
	}

	public function GetWSName() { return $this->ws_name; }
	public function GetRootName() { return $this->node_name; }
	
	public function HasErrors() {
		if($this->xmldoc===null)
			$this->FetchResult();
		
		$xpath = new DOMXPath($this->xmldoc);
		$errors = $xpath->evaluate('//error');
		if ($errors->length == 0)
			return false;
		
		$xml = '<errors>';
		foreach ($errors as $error)
			$xml .= $this->xmldoc->saveXML($error);
		return "$xml</errors>";
	}
	
	public function GetErrors() {
		if ($this->errors === null)
			$this->get_errors();
		
		return $this->errors;
	}
	
	private function get_errors () {
		if($this->xmldoc===null)
			$this->FetchResult();
		
		if ($this->errors !== null)
			return;
		
		$xpath = new DOMXpath($this->xmldoc);
		$error_nodes = $xpath->evaluate("/{$this->node_name}/errors/error");
		
		$this->errors = array();
		foreach ($error_nodes as $error_node)
			$this->errors[] = array(
					'id' => $error_node->getAttribute('id'),
					'error-node' => $error_node,
			);
		
		if (count($this->errors) > 0)
			Logger::GetInstance()->Log(LOG_NOTICE,'WebserviceWrapper.php',"Webservice $this->ws_name has errors: ".htmlspecialchars ($this->xmldoc->saveXML()));
	}
}
?>
