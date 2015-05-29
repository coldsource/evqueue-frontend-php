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
require_once 'bo/BO_workflow.php';
require_once 'bo/BO_notification.php';
require_once 'bo/BO_notificationType.php';
require_once 'utils/xml_utils.php';

$xml_error = "";
if (isset($_POST) && (count($_POST)>1)){
	
	$errors = saveWorkflow($_POST);
	
	if ($errors !== false) {
		$xml_error = $errors;
	} else {
		header("location:list-workflows.php");
		die();
	}
}


$xsl = new XSLEngine();

if (isset($_GET["workflow_id"]) && ($_GET["workflow_id"] != '')){
	$wk = new Workflow($_GET["workflow_id"]);
	$xsl->AddFragment($wk->getGeneratedXml());
}

if ($xml_error)
	$xsl->AddFragment($xml_error);


$xsl->AddFragment(Workflow::getAllGroupXml());
$xsl->AddFragment(Notification::getAllXml());
$xsl->AddFragment(NotificationType::getAllXml());

$xsl->DisplayXHTML('xsl/manage_workflow.xsl');

?>