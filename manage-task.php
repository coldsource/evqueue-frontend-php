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

require_once 'inc/auth_check.php';
require_once 'inc/logger.php';
require_once 'lib/XSLEngine.php';

$xsl = new XSLEngine();

$xml_error = "";
if (isset($_POST) && (count($_POST)>1)){
	if (isset($_POST["id"]) && ($_POST["id"] != ''))
		$xsl->Api('task', 'edit', $_POST);
	else{
		unset($_POST["id"]);
		$xsl->Api('task', 'create', $_POST);
	}
	
	if (!$xsl->HasError()){
		header("location:list-tasks.php");
		die();
	}
}


if (isset($_GET["task_id"]) && ($_GET["task_id"] != '')){
	$xsl->AddFragment(['task' => $xsl->Api('task', 'get', ['id' => $_GET["task_id"]])]);
	/*$wfs = $task->GetLinkedWorkflows();
	$linkedWF = '<linked-workflows>';
	foreach ($wfs as $wf) {
		$linkedWF .= "<workflow>{$wf->get_name()}</workflow>";
	}
	$linkedWF .= '</linked-workflows>';
	$xsl->AddFragment($linkedWF);*/
	$xsl->SetParameter('creation', 0);
}
else
	$xsl->SetParameter('creation', 1);

if ($xml_error)
	$xsl->AddFragment($xml_error);

$xsl->AddFragment(getAllTaskGroupXml());
$xsl->AddFragment(getAllGroupXml());

$xsl->DisplayXHTML('xsl/manage_task.xsl');


?>