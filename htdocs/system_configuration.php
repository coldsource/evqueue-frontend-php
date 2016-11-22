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
foreach ($_SESSION['nodes'] as $node_name => $conf) {
	try{
		$evqueue_node = getevQueue($conf);
		$xml = $evqueue_node->Api('status', 'query', ['type' => "configuration"]);
		$dom = new DOMDocument();
		$dom->loadXML($xml);
		$dom->documentElement->setAttribute("node_name", $node_name);
		$xsl->AddFragment(["global" => $dom]);
	}
	catch(Exception $e) {
		$xsl->Adderror($e->getMessage());
	}
}
$xsl->DisplayXHTML('xsl/system_configuration.xsl');

?>