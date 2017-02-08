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

$units_checks = null;
if (isset($_GET['id'])) {
	$xml = $xsl->Api('workflow_schedule', 'get', ['id' => $_GET['id']]);
	$xsl->AddFragment(['schedule' => $xml]);
	
	$dom = new DOMDocument();
	$dom->loadXML($xml);
	$xpath = new DOMXPath($dom);
	//echo $xml;die();
	$workflow_id = $xpath->evaluate('string(/response/workflow_schedule/@workflow_id)');
	$schedule = $xpath->evaluate('string(/response/workflow_schedule/@schedule)');
	$xsl->AddFragment(['workflow' => $xsl->Api('workflow', 'get', ['id' => $workflow_id])]);
	
	list(
		$units_checks['Seconds'],$units_checks['Minutes'],$units_checks['Hours'],
		$units_checks['Days'],$units_checks['Months'],$units_checks['Weekdays']
	) = explode(';',$schedule);
	foreach ($units_checks as $key => $arr)
		$units_checks[$key] = $arr !== '' ? explode(',',$arr) : array();
}

if (!empty($_POST)) {

	if($_POST['whatSelectMode'] == 'Script'){
		$_POST['create_workflow'] = 'yes';
		$xsl->Api('task', 'create', $_POST);
		if(isset($evqueue->GetParserRootAttributes()['WORKFLOW-ID']))
			$_POST['workflow_id_select'] = $evqueue->GetParserRootAttributes()['WORKFLOW-ID'];
		
	}
	
	if(!$xsl->HasError()){
		parse_str($_POST['schedule_parameters'], $params);
		$attr = [
			'workflow_id'      => $_POST['workflow_id_select'],
			'schedule'         => $_POST['schedule'],
			'onfailure'        => $_POST['onfailure'],
			'user'             => $_POST['schedule_user'],
			'host'             => $_POST['schedule_host'],
			'active'           => (isset($_POST['active']) && $_POST['active'] == 'on') ? 'yes' : 'no',
			'comment'          => $_POST['schedule_comment'],
			'node'             => $_POST['node_name'],
		];
		
		$evqueue_node = getevQueue($_SESSION['nodes'][$_POST['node_name']]);
		
		if($_POST['workflow_schedule_id'] != ''){
			$attr['id'] = $_POST['workflow_schedule_id'];
			$xml = $xsl->Api('workflow_schedule', 'edit', $attr, $params, $evqueue_node);
		}
		else
			$xsl->Api('workflow_schedule', 'create', $attr, $params, $evqueue_node);
		
		if (!$xsl->HasError()) {
			header("location:list-workflow-schedules.php");
			die();
		}
	}
}


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

$xsl->AddFragment(getAllGroupXml());
$xsl->AddFragment(["workflows" => $xsl->Api("workflows", "list")]);

$xsl->DisplayXHTML('xsl/plan-workflow.xsl');

?>
