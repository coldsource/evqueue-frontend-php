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
	protected $private_node;
	protected $notices_node;
	protected $errors_node;
	protected $metas_node;
	protected $parameters;
	
	
	public function __construct()
	{	
		$this->xmldoc = new DOMDocument();
		
		$this->root_node = $this->xmldoc->createElement('page');
		foreach ($_GET as $param => $value) {
			if (!is_array($value))
				$this->root_node->setAttribute($param, $value);
		}
		
		
		$this->get_node = $this->xmldoc->createElement('get');
		$this->root_node->appendChild($this->get_node);
		foreach ($_GET as $param => $value) {
			if (!is_array($value)){
				$this->get_node->setAttribute($param, $value);
			}else{
				$this->get_array_node_list = $this->xmldoc->createElement('list');
				$this->get_array_node_list->setAttribute("name", $param);
				foreach($value as $key=>$val){
					if (!is_array($val)){
						$this->get_array_node = $this->xmldoc->createElement('value', $val);
						$this->get_array_node_list->appendChild($this->get_array_node);
					}
				}
				$this->get_node->appendChild($this->get_array_node_list);
			}
		}		
		
		
		$this->post_node = $this->xmldoc->createElement('post');
		$this->root_node->appendChild($this->post_node);
		foreach ($_POST as $param => $value) {
			if (!is_array($value)){
				$this->post_node->setAttribute($param, $value);
			}else{
				$this->post_array_node_list = $this->xmldoc->createElement('list');
				$this->post_array_node_list->setAttribute("name", $param);
				foreach($value as $key=>$val){
					if (!is_array($val)){
						$this->post_array_node = $this->xmldoc->createElement('value', $val);
						$this->post_array_node_list->appendChild($this->post_array_node);
					}
				}
				$this->post_node->appendChild($this->post_array_node_list);
			}
		}
		
		$this->root_node->setAttribute('url', $_SERVER['SCRIPT_NAME']);
		$this->xmldoc->appendChild($this->root_node);
		
		$this->errors_node = $this->xmldoc->createElement('errors');
		$this->root_node->appendChild($this->errors_node);
		
		$this->metas_node = $this->xmldoc->createElement('metas');
		$this->root_node->appendChild($this->metas_node);
		
		$this->notices_node = $this->xmldoc->createElement('notices');
		$this->root_node->appendChild($this->notices_node);
		
		$this->private_node = $this->xmldoc->createElement('private');
		$this->root_node->appendChild($this->private_node);
		
		$this->SetParameter('NOW', date('Y-m-d H:i:s'));
		$this->SetParameter('EDITION', '0');
		
		@session_start();
		
		if (isset($_SESSION['user_login'])) {
			$user = new User($_SESSION['user_login']);
			$this->AddPrivateFragment($user->getXML('logged-in-user'));
		}
		
		if (isset($_SESSION['edition']['workflow'])) {
			$this->AddFragment("<session><workflow id='session' name='session' original-id='{$_SESSION['edition']['original_workflow_id']}'>{$_SESSION['edition']['workflow']}</workflow></session>");
		}
	}
	
	public function SetParameter($name,$value)
	{
		$this->parameters[$name] = $value;
	}
	
	public function GetParameter($name)
	{
		return isset($this->parameters[$name])?$this->parameters[$name]:false;
	}	
	
	public function AddError($id,$message='',$param=null)
	{
		$fragment = $this->xmldoc->createDocumentFragment();
		$param = $param ? " param='$param'" : '';
		$xml = "<error id='$id'$param>$message</error>";
		if(!@$fragment->appendXML($xml))
		{
			Logger::GetInstance()->Log(LOG_ERR,'XSLEngine',"Error importing PrivateFragment : ".htmlspecialchars($xml));
		}
		
		$this->errors_node->appendChild($fragment);
	}
	
	public function AddMeta($name,$content)
	{
		$fragment = $this->xmldoc->createDocumentFragment();
		$xml = "<meta name='$name' content='$content' />";
		if(!@$fragment->appendXML($xml))
		{
			Logger::GetInstance()->Log(LOG_ERR,'XSLEngine',"Error importing PrivateFragment : ".htmlspecialchars($xml));
		}
		
		$this->metas_node->appendChild($fragment);
	}
	
	public function AddNotice($message,$type=null)
	{
		$fragment = $this->xmldoc->createDocumentFragment();
		$type = $type ? " type='$type'" : '';
		$xml = "<notice$type>$message</notice>";
		if(!@$fragment->appendXML($xml))
			Logger::GetInstance()->Log(LOG_ERR,'XSLEngine',"Error importing PrivateFragment : ".htmlspecialchars($xml));
		
		$this->notices_node->appendChild($fragment);
	}
	
	public function AddWebserviceResult(WebserviceWrapper $ws)
	{
		$fragment = $ws->FetchResult();

		$node = $this->xmldoc->importNode($fragment->firstChild,true);
		$this->root_node->appendChild($node);
	}

	public function AddBulkWebserviceResult(WebserviceWrapper $ws)
	{
		$fragment = $ws->FetchResult();
		$bulknode = $this->xmldoc->importNode($fragment->firstChild,true);
		$children = array();
		foreach ($bulknode->childNodes as $child)
			$children[] = $child;  // it is necessary to have a separate, temporary array to store nodes; the PHP DOMNodeList class does not allow to iterate over ->childNodes properly (see http://www.php.net/manual/en/class.domnodelist.php#83178)
		foreach ($children as $child)
			$this->root_node->appendChild($child);
	}

	//TODO : utiliser le meme principe que AddFragment pour ne pas tenir compte de l'entete xml
	public function AddPrivateFragment($xml)
	{
		$fragment = $this->xmldoc->createDocumentFragment();
		if(!@$fragment->appendXML($xml))
		{
			Logger::GetInstance()->Log(LOG_ERR,'XSLEngine',"Error importing PrivateFragment : ".htmlspecialchars($xml));
		}

		$this->private_node->appendChild($fragment);
	}
	
	public function AddPrivateDOMFragment($xmldoc)
	{
		$fragment = $this->xmldoc->importNode($xmldoc,true);
		if($fragment===false)
		{
			Logger::GetInstance()->Log(LOG_ERR,'XSLEngine',"Error importing Fragment");
		}
		$this->private_node->appendChild($fragment);
	}
	
	public function AddFragment($xml)
	{
		$fragment = $this->xmldoc->createDocumentFragment();
		if (stripos($xml, '<?xml') === 0) {
			$dom = new DomDocument();
			$dom->loadXML($xml);
			$xml = $dom->saveXML($dom->documentElement);
		}
		if(!@$fragment->appendXML($xml))
		{
			Logger::GetInstance()->Log(LOG_ERR,'XSLEngine',"Error importing Fragment : ".htmlspecialchars($xml));
		}
		
		$this->root_node->appendChild($fragment);
	}
	
	public function AddDOMFragment($xmldoc)
	{
		$fragment = $this->xmldoc->importNode($xmldoc,true);
		if($fragment===false)
		{
			Logger::GetInstance()->Log(LOG_ERR,'XSLEngine',"Error importing Fragment");
		}
		
		$this->root_node->appendChild($fragment);
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
		$xsltproc = new XSLTProcessor();
		$xsltproc->registerPHPFunctions('strtolower');
		$xsltproc->registerPHPFunctions('sprintf');
		$xsltproc->registerPHPFunctions('addslashes');
		$xsltproc->registerPHPFunctions('strtotime');
		$xsltproc->registerPHPFunctions(array('sumExecTimes','sumRetryTimes'));

		// Set static parameters
		foreach($this->parameters as $name=>$value)
			$xsltproc->setParameter('',$name,$value);
		
		$xsldoc = new DOMDocument();
		$xsldoc->load($xsl_filename);
		$xsltproc->importStylesheet($xsldoc);

		return $xsltproc->transformToXML($this->xmldoc);
	}
	
	public function DisplayXHTML($xsl_filename)
	{
		if(isset($_GET['display_xml'])) // Debugging tool
			return $this->DisplayXML();

		header('Content-type: text/html');
		echo $this->GetXHTML($xsl_filename);
	}
}
?>