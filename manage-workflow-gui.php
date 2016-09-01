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
require_once 'lib/XSLEngine.php';
require_once 'inc/logger.php';


$xml = null;
if (isset($_GET["workflow_id"]) && ($_GET["workflow_id"] != '')) {
	$wk = new Workflow($_GET["workflow_id"]);
	$xml = $wk->getGeneratedXml();
	
	// push workflow in session if there isn't one yet
	if (!isset($_SESSION['edition']['workflow']) || !isset($_SESSION['edition']['original_workflow_id']) || $_SESSION['edition']['original_workflow_id'] != $_GET['workflow_id']) {
		$_SESSION['edition']['original_workflow_id'] = $wk->get_id();
		$_SESSION['edition']['workflow'] = $wk->getXmlOnly();
		session_write_close();
	}
}


// [creation] push minimal, void workflow in session if there isn't one yet
if (!isset($_SESSION['edition']['workflow']) || !isset($_GET['workflow_id']) && $_SESSION['edition']['original_workflow_id'] != 'new') {
	$_SESSION['edition']['original_workflow_id'] = 'new';
	$_SESSION['edition']['workflow'] = '<workflow><parameters/></workflow>';
	session_write_close();
}

if(isset($_SESSION['edition']['vars']['workflow_name']))
	$_POST['workflow_name'] = $_SESSION['edition']['vars']['workflow_name'];
if(isset($_SESSION['edition']['vars']['workflow_group']))
	$_POST['workflow_group'] = $_SESSION['edition']['vars']['workflow_group'];
if(isset($_SESSION['edition']['vars']['workflow_comment']))
	$_POST['workflow_comment'] = $_SESSION['edition']['vars']['workflow_comment'];

$xsl = new XSLEngine();
$xsl->SetParameter('EDITION', '1');

if ($xml)
	$xsl->AddFragment($xml);

$xsl->AddFragment(Schedule::getAllXml());
$xsl->AddFragment(Queue::getAllXml());
$xsl->AddFragment(Task::getAllXml($filter='no-tied-task'));
$xsl->AddFragment(Task::getAllGroupXml());
$xsl->AddFragment(getAllGroupXml());
$xsl->AddFragment(Notification::getAllXml());
$xsl->AddFragment(NotificationType::getAllXml());

$xsl->DisplayXHTML('xsl/manage_workflow_gui.xsl');

?>