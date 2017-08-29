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


if($_POST['mode'] == "xml"){
	echo $_SESSION['edition'][$_POST['id']]['workflow'];
	die();
}


$xsl = new XSLEngine();
$dom = new DOMDocument();
$dom->loadXML($_SESSION['edition'][$_POST['id']]['workflow']);

$xpath = new DOMXPath($dom);
$rootJob = $xpath->evaluate('/workflow')->item(0);
countdJobs($rootJob, $xpath);
$xsl->AddFragment($dom);

$xsl->AddFragment(getAllTaskGroupXml());
$xsl->AddFragment(["tasks" => $xsl->Api("tasks", "list")]);
$xsl->AddFragment(['queues' => $xsl->Api('queuepool', 'list')]);
$xsl->AddFragment(['schedules' => $xsl->Api('retry_schedules', 'list')]);

$xsl->DisplayXHTML('../xsl/ajax/get-workflow-tree.xsl');

function countdJobs($currentJob, $xpath){
	$jobs = $xpath->evaluate('subjobs/job', $currentJob);

	$nb = 0;
	foreach($jobs as $job){
		$nb += countdJobs($job, $xpath);
	}
	if($nb==0)
		$nb = 1;

	$currentJob->setAttribute('data-size', $nb);
	return $nb;
}

?>
