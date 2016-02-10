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
require_once 'bo/BO_workflow.php';
require_once 'bo/BO_workflowSchedule.php';

$xsl = new XSLEngine();
if(isset($_GET['display']) && $_GET['display'] == 'state') {
	$xsl->AddFragment(WorkflowSchedule::getAllXml(array('active'=>1)));
	$xsl->SetParameter('DISPLAY', 'state');
}
else{
	$xsl->AddFragment(WorkflowSchedule::getAllXml());
	$xsl->SetParameter('DISPLAY', 'settings');
}
$xsl->AddFragment(WorkflowSchedule::GetAllLastExecution());

$xsl->AddFragment(Workflow::getAllXml());

require 'conf/queueing.php';
foreach ($QUEUEING as $node_name => $conf) {
	$wfi = new WorkflowInstance($node_name);
	$next_exec_time = $wfi->GetNextExecutionTime();
	if ($next_exec_time)
		$xsl->AddFragment($next_exec_time);
}

$xsl->DisplayXHTML('xsl/list_workflow_schedules.xsl');

?>