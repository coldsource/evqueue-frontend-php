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
		$xml .= "<value index='$index' label='$value' />";
	}
	
	$xml .= "</unit>";
}
$xml .= '</units>';
$xsl->AddFragment($xml);
	
$xsl->DisplayXHTML('xsl/workflow-schedules.xsl');

?>