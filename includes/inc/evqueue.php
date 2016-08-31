<?php

require_once 'lib/evQueue.php';
require_once 'utils/utils.php';
require 'conf/queueing.php';

if(!isset($_POST['node']) || $_POST['node'] == "")
	$node = array_keys($QUEUEING)[0];
elseif(!isset($QUEUEING[$_POST['node']]))
	die("node ".$_POST['node']." doesn't exist");
else
	$node = $_POST['node'];
	
$evqueue = getevQueue($node);
?>