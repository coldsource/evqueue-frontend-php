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

if (isset($_POST) && (count($_POST)>1)){
	if (isset($_GET["workflow_id"]) && ($_GET["workflow_id"] != '')){
		$xsl->Api('workflow', 'clear_notifications', [
			'id' => $_GET["workflow_id"]
		]);
		
		$xml =  $xsl->Api('workflow', 'edit', [
			'id' => $_GET["workflow_id"],
			'name' => $_POST['workflow_name'],
			'content' => base64_encode($_POST['workflow_xml']),
			'group' => $_POST['workflow_group'],
			'comment' => $_POST['workflow_comment'],
		]);
	}
	else{
		$xml = $xsl->Api('workflow', 'create', [
			'name' => $_POST['workflow_name'],
			'content' => base64_encode($_POST['workflow_xml']),
			'group' => $_POST['workflow_group'],
			'comment' => $_POST['workflow_comment'],
		]);
		$id = $evqueue->GetParserRootAttributes()['WORKFLOW-ID'];
	}
	
	if(count($_POST['notification']) > 0){
		foreach($_POST['notification'] as $notification){
			$xml = $xsl->Api('workflow', 'subscribe_notification', [
				'id' => $_GET["workflow_id"],
				'notification_id' => $notification,
			]);
		}
	}
	
	if(!$xsl->HasError()){
		header("location:list-workflows.php");
		die();
	}
}


if (isset($_GET["workflow_id"]) && ($_GET["workflow_id"] != '')){
	$xsl->AddFragment(['response-workflow' => $xsl->Api('workflow', 'get', ['id' => $_GET["workflow_id"]])]);
	$xsl->AddFragment(['workflow-notifications' => $xsl->Api('workflow', 'list_notifications', ['id' => $_GET["workflow_id"]])]);
}

$xsl->AddFragment(getAllGroupXml());

$xsl->AddFragment(['notifications' => $xsl->Api('notifications', 'list')]);
$xsl->AddFragment(['notification_types' => $xsl->Api('notification_types', 'list')]);

$xsl->DisplayXHTML('xsl/manage_workflow.xsl');

?>