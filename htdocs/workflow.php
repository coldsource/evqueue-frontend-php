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

require_once __DIR__ . '/includes/inc/auth_check.php';

if(isset($_GET['cancel'])){
	if ($_GET["cancel"] != ''){
		unset($_SESSION['edition'][$_GET["cancel"]]);
	}
	else{
		unset($_SESSION['edition']['new']);
	}
}
$xsl = new XSLEngine();


// INSTALL WORKFLOW
if(isset($_FILES['workflow_zip_file']))
{
	try
	{

		if(!$_FILES['workflow_zip_file']['tmp_name'])
			throw new Exception('No zip file was uploaded');

		$zip = new ZipArchive();
		if($zip->open($_FILES['workflow_zip_file']['tmp_name'])!==true)
			throw new Exception('Uploaded file is not a valid workflow archive');

		$workflow_xml = $zip->getFromName('workflow.xml');
		if($workflow_xml===false)
			throw new Exception('Uploaded file is not a valid workflow archive : could not read workflow.xml');

		$workflow_dom = new DOMDocument();
		$workflow_dom->loadXML($workflow_xml);

		$attributes = [];
		foreach($workflow_dom->documentElement->attributes as $attribute)
			$attributes[$attribute->name] = $attribute->value;

		$attributes['content'] = base64_encode($workflow_dom->saveXML($workflow_dom->documentElement->firstChild));

		$xsl->Api('workflow','create',$attributes);

		$workflow_xpath = new DOMXPath($workflow_dom);
		$tasks = $workflow_xpath->query('//task');
		foreach($tasks as $task)
		{
			$task_xml = $zip->getFromName('tasks/'.$task->getAttribute('name').'.xml');
			if($task_xml===false)
				throw new Exception('Uploaded file is not a valid workflow archive : could not read '.$task->getAttribute('name').'.xml');

			$task_dom = new DOMDocument();
			$task_dom->loadXML($task_xml);

			$attributes = [];
			foreach($task_dom->documentElement->attributes as $attribute)
				$attributes[$attribute->name] = $attribute->value;

			$xsl->Api('task','create',$attributes);
		}
	}
	catch(Exception $e)
	{
		$xsl->AddError($e->getMessage());
	}
}

if($_SESSION['git_enabled'])
	$xsl->Api("git", "pull");

$xsl->DisplayXHTML('xsl/workflow.xsl');

?>