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
require_once 'bo/BO_workflow.php';
require_once 'bo/BO_task.php';
require_once 'inc/logger.php';
require_once 'lib/WebserviceWrapper.php';
require_once 'lib/XSLEngine.php';
require_once 'lib/save_workflow.php';
require_once 'bo/BO_workflowSchedule.php';

$xsl = new XSLEngine();


$units_checks = null;
if (isset($_GET['id'])) {
	$ws = new WorkflowSchedule($_GET['id']);
	$xsl->AddFragment($ws->getGeneratedXml());
	
	$wfid = $ws->get_workflow_id();
	$wf = new Workflow($wfid);
	$xsl->AddFragment($wf->getGeneratedXml());
	
	$xsl->AddFragment(Task::getAllXml($filter='only-tied-task'));
	
	list(
		$units_checks['Seconds'],$units_checks['Minutes'],$units_checks['Hours'],
		$units_checks['Days'],$units_checks['Months'],$units_checks['Weekdays']
	) = split(';',$ws->get_schedule());
	foreach ($units_checks as $key => $arr)
		$units_checks[$key] = $arr !== '' ? split(',',$arr) : array();
}


$xml_error = "";
if (!empty($_POST)) {
	
	$errors = false;
	switch ($_POST['whatSelectMode']) {
		case 'Workflow':
			$_POST['workflow_id'] = $_POST['workflow_id_select'];
			break;
		
		case 'Script':
			$params = $_POST;
			$params['bound'] = true;
			$errors = edit_simple_workflow($params);
			
			if ($errors !== false)
				$xml_error = $errors;
			else
				$_POST['workflow_id'] = $ws->FetchResult()->documentElement->attributes->getNamedItem('id')->nodeValue;
			break;
		
		default:
			Logger::GetInstance()->Log(LOG_ERR,'plan-workflow.php',"Unknown tab for workflow selection: '{$_POST['whatSelectMode']}'");
	}
	unset($_POST['workflow_id_select']);
	
	if (is_numeric($_POST['workflow_id'])) {
		$ws = new WebserviceWrapper('workflow-schedule-save', 'formWorkflowSchedule', array(
				'workflow_schedule_id' => $_POST['workflow_schedule_id'],
				'workflow_id' => $_POST['workflow_id'],
				'schedule' => $_POST['schedule'],
				'onfailure' => $_POST['onfailure'],
				'schedule_user' => $_POST['schedule_user'],
				'schedule_host' => $_POST['schedule_host'],
				'active' => (isset($_POST['active']) && $_POST['active'] == 'on') ? 1 : 0,
				'schedule_comment' => $_POST['schedule_comment'],
				'schedule_parameters' => $_POST['schedule_parameters'],
				'bind' => 'yes',
		), true);
		$ws->FetchResult();

		$errors = $ws->HasErrors();
		if ($errors !== false) {
			$xml_error = $errors;
		} else {
			header("location:list-workflow-schedules.php");
			die();
		}
	}
}

if ($xml_error)
	$xsl->AddFragment($xml_error);



$days = $months = array();
for ($d=0; $d<31; $d++)
	$days[$d] = $d+1;

for ($m=0; $m<12; $m++)
	$months[$m] = date("F", mktime(0, 0, 0, $m+1, 10));

$dates = array(
	'Seconds'	 => range(0,59),
	'Minutes'	 => range(0,59),
	'Hours'	   => range(0,23),
	'Days'	   => $days,
	'Months'	 => $months,
	'Weekdays' => array(0=>'Sunday', 1=>'Monday', 2=>'Tuesday', 3=>'Wednesday', 4=>'Thursday', 5=>'Friday', 6=>'Saturday',),
);

$xml = '<units>';
foreach ($dates as $label => $unit) {
	
	$xml .= "<unit label='$label' input_name='".strtolower($label)."'>";
	
	foreach ($unit as $index => $value) {
		$checked = $units_checks && in_array($index, $units_checks[$label]) ? 'true' : 'false';
		$xml .= "<value index='$index' label='$value' checked='$checked' />";
	}
	
	$xml .= "</unit>";
}
$xml .= '</units>';
$xsl->AddFragment($xml);

$xsl->AddFragment(Workflow::getAllGroupXml());
$xsl->AddFragment(Workflow::getAllXml());

$xsl->DisplayXHTML('xsl/plan-workflow.xsl');

?>