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
require_once 'lib/WebserviceWrapper.php';
require_once 'lib/XSLEngine.php';
require_once 'lib/workflow_instance.php';
require_once 'bo/BO_workflow.php';
require_once 'utils/xml_utils.php';

$xml_error = "";
if (isset($_POST) && (count($_POST)>1)){
	$ws = new WebserviceWrapper('save-workflow', 'formWorkflow', array(
			'workflow_id' => $_POST['workflow_id'],
			'workflow_name' => $_POST['workflow_name'],
			'workflow_xml' => $_POST['workflow_xml'],
			'workflow_group' => $_POST['workflow_group'],
			'workflow_comment' => $_POST['workflow_comment']
	), true);
	$ws->FetchResult();
	
	$errors = $ws->HasErrors();
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

$xsl->DisplayXHTML('xsl/manage_workflow.xsl');

?>