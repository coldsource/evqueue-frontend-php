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

$limit = 30;
$page = ((isset($_GET['p']) && $_GET['p'] > 0) ? $_GET['p']:1);
$offset = ($page-1) * $limit;

$filters = [
	"limit"  => $limit,
	"offset" => $offset,
];

if(isset($_GET['wf_name'])){
	$filters = [
		"filter_node" => $_GET['node'],
		"filter_workflow" => $_GET['wf_name'],
		"filter_launched_from" => trim($_GET['dt_inf']." ".$_GET['hr_inf']),
		"filter_launched_until" => trim($_GET['dt_sup']." ".$_GET['hr_sup']),
		"filter_status" => "",
	];
}
elseif(isset($_GET['workflow_schedule_id']))
	$filters['filter_schedule_id'] = $_GET['workflow_schedule_id'];
elseif(isset($_GET['filter']) && $_GET['filter'] == 'errors')
	$filters['filter_error'] = 'yes';


if(isset($_GET['searchParams'])){
	$getParams = json_decode($_GET['searchParams'], 1);
	$parameters = [];
	foreach($getParams as $value){
		$parameters[$value['name']] = $value['value'];
	}
}
else
	$parameters = [];

$xsl = new XSLEngine();
$xsl->SetParameter('LIMIT', $limit);
$xsl->SetParameter('PAGE', $page);
$xml = $xsl->Api('instances', 'list', $filters, $parameters);
$xsl->AddFragment(["instances" => $xml]);

$xsl->DisplayXHTML('../xsl/ajax/terminated-workflows.xsl');

?>
