<?php

require_once 'lib/evQueue.php';
require_once 'utils/utils.php';
require 'conf/queueing.php';

if(!isset($_POST['node']) || $_POST['node'] == "")
	$scheme = $QUEUEING[0];
elseif(!isset($_SESSION['nodes'][$_POST['node']]))
	die("node ".$_POST['node']." doesn't exist");
else
	$scheme = $_SESSION['nodes'][$_POST['node']];
	
$evqueue = getevQueue($scheme);
?>