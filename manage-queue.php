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
require_once 'lib/WebserviceWrapper.php';
require_once 'bo/BO_queue.php';
require_once 'utils/xml_utils.php';


$xsl = new XSLEngine();


$xml_error = "";
if (isset($_POST) && (count($_POST)>1)){
	$ws = new WebserviceWrapper('create-queue', 'formQueue', $_POST, true);
	$ws->FetchResult();
	
	$xml_error = $ws->HasErrors();
	if ($xml_error === false){
		header("location:list-queues.php");
		die();
	}
}

if (isset($_GET["queue_id"]) && ($_GET["queue_id"] != '')){
	$wk = new Queue($_GET["queue_id"]);
	$xsl->AddFragment($wk->getGeneratedXml());
}

if ($xml_error)
	$xsl->AddFragment($xml_error);

$xsl->DisplayXHTML('xsl/manage_queue.xsl');

?>
