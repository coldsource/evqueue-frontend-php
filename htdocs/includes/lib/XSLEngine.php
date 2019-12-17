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

function timeDiff ($dt1,$dt2=null) {
	if (!$dt2)
		$dt2 = date('Y-m-d H:i:s');
	return strtotime($dt2) - strtotime($dt1);
}

function timeSpan ($dt1, $dt2=null) {
	$duration = strtotime($dt2) - strtotime($dt1);

	if (explode(' ',$dt1)[0] == explode(' ',$dt2)[0])
		$dt2 = preg_replace('/^\d{4}-\d{2}-\d{2}/','',$dt2);  // don't display same date twice

	$dts = [$dt1,$dt2];
	foreach ($dts as &$dt) {
		$dt = preg_replace('/^'.date('Y-m-d').'/','',$dt);  // don't display today's date
		$dt = preg_replace('/^'.date('Y-m-d', strtotime('yesterday')).'/','yesterday',$dt);  // 'yesterday' instead of date
		$dt = preg_replace('/^'.date('Y-m-d', strtotime('tomorrow')).'/','tomorrow',$dt);  // 'tomorrow' instead of date
		$dt = preg_replace('/:\d+$/','',$dt);  // don't display seconds
	}

	if ($duration < 60)
		$dts[1] = null;

	return $dts[1] ? "{$dts[0]} → {$dts[1]}" : $dts[0];
}

function humanTime ($seconds) {
	return
		($seconds/86400 >= 1 ? floor($seconds/86400).'days, ' : '') .
		($seconds/3600 >= 1 ? (floor($seconds/3600)%24).'h ' : '') .
		($seconds/60 >= 1 ? (floor($seconds/60)%60).'m ' : '') .
		($seconds%60).'s';
}

function taskPart ($task_path,$part) {
	
	$split = preg_split('/\s/', $task_path, 2);
	$command = $split[0];
	$parameters = count($split) > 1 ? $split[1] : '';
	$filename = preg_replace('_.*/_', '', $command);
	
	switch ($part) {
		case 'COMMAND':    return $command;
		case 'FILENAME':   return $filename;
		case 'PARAMETERS': return $parameters;
	}
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
		] as $infos) {
			
			list($params,$node) = $infos;
			
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
		 $nodes = $this->xmldoc->createElement('evqueue-nodes');
		$this->root_node->appendChild($nodes);
		if(isset($_SESSION['nodes']) && is_array($_SESSION['nodes'])){
			foreach ($_SESSION['nodes'] as $node_name) {
				$node = $this->xmldoc->createElement('node');
				$node->setAttribute('name', $node_name);
				$nodes->appendChild($node);
			}
		}
		$this->SetParameter('NOW', date('Y-m-d H:i:s'));
		$this->SetParameter('PROFILE', isset($_SESSION['user_profile']) ? $_SESSION['user_profile']:'');
		$this->SetParameter('LOGIN', isset($_SESSION['user_login']) ? $_SESSION['user_login']:'');
		$this->SetParameter('USE_GIT', isset($_SESSION['git_enabled'])?$_SESSION['git_enabled']:'');
		$this->SetParameter('USER', isset($_SESSION['user_login']) ? $_SESSION['user_login'] : '');
		$this->SetParameter('PASSWORD', isset($_SESSION['user_pwd']) ? bin2hex($_SESSION['user_pwd']) : '');

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
	 * @param $fragment is either an XML string or a DOMDocument.
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

		} else {
			Logger::Log(LOG_ERR, 'XSLEngine.php', '$xml is neither an XML string or a DOMDocument');
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
		$xsltproc->registerPHPFunctions(['urlencode', 'timeSpan', 'timeDiff', 'humanTime', 'taskPart']);
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

	public function Api($name, $action = false, $attributes = [], $parameters = [], $node_name = false)
	{
		global $cluster;
		try
		{
			return $cluster->API($name, $action, $attributes, $parameters, $node_name);
		}
		catch(Exception $e)
		{
			$this->AddError($e->getMessage());
			return "<response status='KO' error='".htmlspecialchars($e->getMessage())."' />";
		}
	}

	public function HasError(){
		$xpath = new DOMXpath($this->xmldoc);
		if($xpath->evaluate("count(/page/errors/error)"))
		   return true;
		return false;
	}
}
?>
