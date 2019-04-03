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

require_once __DIR__ . '/includes/inc/auth_check.php';

$xsl = new XSLEngine();

$list = $xsl->Api("workflows", "list");
$dom = new \DOMDocument();
$dom->loadXML($list);
$xp = new \DOMXPath($dom);

foreach ($xp->query('/*/workflow/@id') as $wfid) {
	$dom = new \DOMDocument();
	$dom->loadXML($xsl->Api("workflow", "get", ["id" => $wfid->nodeValue]));
	$dom->documentElement->childNodes[0]->setAttribute('id',$wfid->nodeValue);
	$xsl->AddFragment(["workflows" => $dom]);
}

$xsl->DisplayXHTML('xsl/workflows-statistics.xsl');

?>