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
require_once 'bo/BO_schedule.php';
require_once 'lib/WebserviceWrapper.php';


$xml_error = $post_schedule_xml = "";
if (!empty($_POST)){
	
	$id = htmlspecialchars($_POST['schedule_id']);
	$name = htmlspecialchars($_POST['schedule_name']);
	
	$xml = "<schedule name='$name'>";
	for ($i=0; $i<count($_POST['retry_delay']); $i++) {
		$delay = htmlspecialchars($_POST['retry_delay'][$i]);
		$times = htmlspecialchars($_POST['retry_times'][$i]);
		$xml .= "<level retry_delay='$delay' retry_times='$times' />";
	}
	$xml .= '</schedule>';
	
	$ws = new WebserviceWrapper('save-schedule', 'formSchedule', array(
			'schedule_id' => $id,
			'schedule_name' => $name,
			'schedule_xml' => $xml,
	), true);
	$ws->FetchResult();
	
	$errors = $ws->HasErrors();
	if ($errors !== false) {
		$xml_error = $errors;
		$post_schedule_xml = "<schedule id='$id'>$xml</schedule>";
	} else {
		header("location:list-schedules.php");
		die();
	}
}


$xsl = new XSLEngine();

if (isset($_GET["schedule_id"]) && ($_GET["schedule_id"] != '')){
	$wk = new Schedule($_GET["schedule_id"]);
	$xsl->AddFragment($wk->getGeneratedXml());
}

if ($xml_error)
	$xsl->AddFragment($xml_error);

if ($post_schedule_xml)
	$xsl->AddFragment($post_schedule_xml);

$xsl->DisplayXHTML('xsl/manage_schedule.xsl');

?>