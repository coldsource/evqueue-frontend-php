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

require_once __DIR__ . '/../includes/inc/auth_check.php';

$xsl = new XSLEngine();

if($_GET['status']=='executing')
{
	$_SESSION['nodes'] = [];
	foreach ($QUEUEING as $scheme) {
		try{
			$evqueue_node = getevQueue($scheme);
			$evqueue_node->Api('ping');
			$node_name = $evqueue_node->GetParserRootAttributes()['NODE'];
			$xml = $evqueue_node->Api('status', 'query', ['type' => "workflows"]);
			$dom = new DOMDocument();
			$dom->loadXML($xml);
			$dom->documentElement->setAttribute("node", $node_name);
			$xsl->AddFragment(["instances" => $dom]);
			$_SESSION['nodes'][$node_name] = $scheme;
		}
		catch(Exception $e) {
			$xsl->AddFragment('<error id="evqueue-not-running" node="'.$scheme.'">'.$e->getMessage().'</error>');
		}
	}
	
	$xsl->SetParameter('STATUS','EXECUTING');
}
else if($_GET['status']=='terminated')
{
	$limit = 30;
	$offset = 0;
	$page = 1;
	if(isset($_GET['p']))
	{
		$page = $_GET['p'];
		$offset = ($_GET['p']-1)*$limit;
		unset($_GET['p']);
	}

	$filters = [
		"limit"  => $limit,
		"offset" => $offset,
		"filter_status" => "TERMINATED"
	];
	
	$parameters = [];
	
	foreach($_GET as $filter_name=>$filter_value)
	{
		if(substr($filter_name,0,10)=='parameter_')
			$parameters[substr($filter_name,10)] = $filter_value;
		else
		$filters[$filter_name] = $filter_value;
	}
	

	$xsl = new XSLEngine();
	$xsl->SetParameter('LIMIT', $limit);
	$xsl->SetParameter('PAGE', $page);
	$xsl->SetParameter('STATUS','TERMINATED');
	$xsl->AddFragment(["instances" => $xsl->Api('instances', 'list', $filters, $parameters)]);
}

$xsl->DisplayXHTML('../xsl/ajax/list-instances.xsl');
?>
