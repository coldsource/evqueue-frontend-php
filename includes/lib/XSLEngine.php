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

function sumExecTimes ($nodes) {
	$total_time = 0;
	foreach ($nodes as $node)
		$total_time += strtotime($node->getAttribute('exit_time')) - strtotime($node->getAttribute('execution_time'));
	return $total_time;
}


function sumRetryTimes ($nodes) {
	$total_time = 0;
	$prev_exit_time = null;
	foreach ($nodes as $node) {
		if (!$prev_exit_time)
			$prev_exit_time = $node->getAttribute('execution_time');  // initialise prev_exec_time at the beginning, *and* when we move on to another task (previous node was output[@retval=0])
		
		$total_time += strtotime($node->getAttribute('execution_time')) - strtotime($prev_exit_time);
		$prev_exit_time = ($node->getAttribute('retval') == 0) ? null : $node->getAttribute('exit_time');  // reset prev_exit_time on retval=0 since we're moving to another task after that
	}
	return $total_time;
}
  
class XSLEngine
{
	protected $xmldoc;
	protected $root_node;
	protected $errors_node;
	protected $notices_node;
	protected $parameters = [];
	protected $display_xml;
	protected $instruction = "<!doctype html>"; //doctype, xml...


	public function __construct()
	{
		$this->xmldoc = new \DOMDocument();

		$this->root_node = $this->xmldoc->createElement('page');
		foreach ($_GET as $param => $value) {
			if (!is_array($value) && preg_match('/^[a-zA-Z0-9-_]+$/',$param))
				$this->root_node->setAttribute($param, $value);
		}
		
		// Errors
		$this->errors_node = $this->xmldoc->createElement('errors');
		$this->root_node->appendChild($this->errors_node);
		
		// Notices
		$this->notices_node = $this->xmldoc->createElement('notices');
		$this->root_node->appendChild($this->notices_node);

		// GET et POST
		$get_node = $this->xmldoc->createElement('get');
		$this->root_node->appendChild($get_node);
		$post_node = $this->xmldoc->createElement('post');
		$this->root_node->appendChild($post_node);

		foreach ([
				[$_GET,  $this->root_node],
				[$_GET,  $get_node],
				[$_POST, $post_node]
		] as list($params,$node)) {

			foreach ($params as $param => $value) {
				if (!is_array($value)){
					if(preg_match('/^[a-zA-Z0-9-_]+$/',$param))
						$node->setAttribute($param, $value);
				}else if ($node !== $this->root_node) {
					$list = $this->xmldoc->createElement('list');
					$list->setAttribute('name', $param);
					foreach($value as $val)
						if (!is_array($val))
							$list->appendChild($this->xmldoc->createElement('value'))->appendChild($this->xmldoc->createTextNode($val));
					$node->appendChild($list);
				}
			}
		}

		$this->xmldoc->appendChild($this->root_node);

		 // Add node(s) information
		require 'conf/queueing.php';
		$nodes = $this->xmldoc->createElement('evqueue-nodes');
		$this->root_node->appendChild($nodes);
		foreach ($_SESSION['nodes'] as $node_name => $conf) {
			$node = $this->xmldoc->createElement('node');
			$node->setAttribute('name', $node_name);
			$node->appendChild($this->xmldoc->createTextNode($conf));
			$nodes->appendChild($node);
		}
		$this->SetParameter('NOW', date('Y-m-d H:i:s'));
		$this->SetParameter('EDITION', '0');
		$this->SetParameter('PROFILE', isset($_SESSION['user_profile']) ? $_SESSION['user_profile']:'');
		$this->SetParameter('LOGIN', isset($_SESSION['user_login']) ? $_SESSION['user_login']:'');
		$this->SetParameter('USE_GIT', 1); //TODO

		$this->display_xml = isset($_GET['display_xml']);
	}

	

	public function SetParameter($name,$value)
	{
		$this->parameters[$name] = $value;
	}

	public function GetParameter($name)
	{
		return isset($this->parameters[$name])?$this->parameters[$name]:false;
	}
	
	public function AddError($error)
	{
		$error_node = $this->xmldoc->createElement('error',$error);
		$this->errors_node->appendChild($error_node);
	}
	
	public function AddNotice($error)
	{
		$notice_node = $this->xmldoc->createElement('notice',$error);
		$this->notices_node->appendChild($notice_node);
	}

	/*
	 * @param $fragment is either an XML string, a DOMDocument, or a WebserviceWrapperGeneric.
	 */
	public function AddFragment($xml, $parent_node = false)
	{
		$rootName = false;
		if(is_array($xml))
		{
			$rootName = key($xml);
			$xml = $xml[$rootName];
		}

		if($parent_node===false)
			$parent_node = $this->root_node;

		$added_node = false;

		if (is_string($xml)) {
			$fragment = $this->xmldoc->createDocumentFragment();
			if (stripos($xml, '<?xml') === 0) {
				$dom = new \DomDocument();
				$dom->loadXML($xml);
				$xml = $dom->saveXML($dom->documentElement);
			}
			if(!@$fragment->appendXML($xml))
				Logger::Log(LOG_ERR,'XSLEngine',"Error importing Fragment : ".htmlspecialchars($xml));

			$added_node = $parent_node->appendChild($fragment);

		} else if ($xml instanceof \DOMDocument) {
			$node = $this->xmldoc->importNode($xml->firstChild,true);
			$added_node = $parent_node->appendChild($node);

		} else if ($xml instanceof WebserviceWrapperGeneric) {

			$dom = $xml->FetchResult();
			$node = $this->xmldoc->importNode($dom->firstChild,true);
			$added_node = $parent_node->appendChild($node);

		} else {
			Logger::Log(LOG_ERR, 'XSLEngine.php', '$xml is neither an XML string, a DOMDocument nor a WebserviceWrapper');
		}

		if($added_node !== false && $rootName !== false && $added_node->nodeName != $rootName){
			$added_node = XSLEngine::RenameElement($added_node,$rootName);
		}

		return $added_node;
	}


	public function GetXML () {
		return $this->xmldoc;
	}

	public function DisplayXML()
	{
		header('Content-type: text/xml');
		echo $this->xmldoc->saveXML();
	}

	public function GetXHTML($xsl_filename)
	{
		$xsltproc = new \XSLTProcessor();
		$xsltproc->registerPHPFunctions(['urlencode','strtotime','ucfirst', 'sumExecTimes', 'sumRetryTimes', 'addslashes']);
		// Set static parameters
		foreach($this->parameters as $name=>$value)
			$xsltproc->setParameter('',$name,$value);

		$xsldoc = new \DOMDocument();
		$xsldoc->load($xsl_filename);
		$xsltproc->importStylesheet($xsldoc);

		if(Logger::GetFilterPriority()>=LOG_INFO)
			$t1 = microtime(true);

		$dom = $xsltproc->transformToDoc($this->xmldoc);
		if ($dom === false)
			Logger::Log(LOG_ERR,'XSLEngine.php',"Transformation XSL en échec");

		if(Logger::GetFilterPriority()>=LOG_INFO)
			Logger::Log(LOG_INFO,'WebserviceWrapper',"XSL transformation took ".number_format((microtime(true)-$t1)*1000,1)."ms");

		$dom->formatOutput = false;
		
		return $this->instruction.$dom->saveXML($dom->documentElement);
	}

	public function DisplayXHTML($xsl_filename, $content_type = 'text/html')
	{
		if($this->display_xml) // Debugging tool
			return $this->DisplayXML();

		header('Content-type: '.$content_type);

		echo $this->GetXHTML($xsl_filename);
	}

	public static function RenameElement(\DOMElement $node, $name) {
		$renamed = $node->ownerDocument->createElement($name);
		foreach ($node->attributes as $attribute) {
			$renamed->setAttribute($attribute->nodeName, $attribute->nodeValue);
		}
		while ($node->firstChild) {
			$renamed->appendChild($node->firstChild);
		}
		$node->parentNode->replaceChild($renamed, $node);
		return $renamed;
	}

	public function SetInstruction($instruction){
		$this->instruction = $instruction;
	}
	
	public function Api($name, $action = false, $attributes = [], $parameters = [], $evqueue_node = false)
	{
		global $evqueue;
		if($evqueue_node === false)
			$evqueue_node = $evqueue;
		
		try
		{
			return $evqueue_node->API($name, $action, $attributes, $parameters);
		}
		catch(Exception $e)
		{
			$this->AddError($e->getMessage());
			return "<response status='KO' error='".htmlspecialchars($e->getMessage())."' />";
		}
		
		return "<response />";
	}
	
	public function HasError(){
		$xpath = new DOMXpath($this->xmldoc);
		if($xpath->evaluate("count(/page/errors/error)"))
		   return true;
		return false;
	}
}
?>
