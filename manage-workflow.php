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
require_once 'lib/workflow_instance.php';
require_once 'lib/save_workflow.php';
require_once 'utils/xml_utils.php';

$xml_error = "";
if (isset($_POST) && (count($_POST)>1)){
	try{
		if (isset($_GET["workflow_id"]) && ($_GET["workflow_id"] != '')){
			$xml =  $evqueue->Api('workflow', 'edit', [
				'id' => $_GET["workflow_id"],
				'name' => $_POST['workflow_name'],
				'content' => base64_encode($_POST['workflow_xml']),
				'group' => $_POST['workflow_group'],
				'comment' => $_POST['workflow_comment'],
			]);
		}
		else{
			$xml = $evqueue->Api('workflow', 'create', [
				'name' => $_POST['workflow_name'],
				'content' => base64_encode($_POST['workflow_xml']),
				'group' => $_POST['workflow_group'],
				'comment' => $_POST['workflow_comment'],
			]);
		}
	}
	catch(Exception $e){
		echo $e->getMessage();
		die();
	}

	header("location:list-workflows.php");
	die();
}


$xsl = new XSLEngine();

if (isset($_GET["workflow_id"]) && ($_GET["workflow_id"] != '')){
	$xsl->AddFragment(['response-workflow' => $evqueue->Api('workflow', 'get', ['id' => $_GET["workflow_id"]])]);
}

if ($xml_error)
	$xsl->AddFragment($xml_error);

$xsl->AddFragment(getAllGroupXml());
$xsl->AddFragment(['notifications' => $evqueue->Api('notifications', 'list')]);
$xsl->AddFragment(['notification_types' => $evqueue->Api('notification_types', 'list')]);
/*
$xsl->AddFragment(Notification::getAllXml());
$xsl->AddFragment(NotificationType::getAllXml());
*/
$xsl->DisplayXHTML('xsl/manage_workflow.xsl');

?>