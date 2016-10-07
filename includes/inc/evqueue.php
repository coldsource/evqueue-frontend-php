<?php
require_once 'lib/evQueue.php';
require_once 'utils/utils.php';
require 'conf/queueing.php';

if(!isset($_POST['node']) || $_POST['node'] == ""){
	$count = count($QUEUEING);
	$i = 0;
	do{
		try{
			$evqueue = getevQueue($QUEUEING[$i]);
			$evqueue->Api('ping');
		}
		catch(Exception $e){
			if($e->getCode() != evQueue::ERROR_AUTH_REQUIRED) //it's ok if engine require auth
				$evqueue = false;
			$i++;
		}
	}
	while($i < $count  && $evqueue == false);
}
elseif(!isset($_SESSION['nodes'][$_POST['node']]))
	die("Node ".$_POST['node']." doesn't exist");
else
	$evqueue = getevQueue($_SESSION['nodes'][$_POST['node']]);
	

?>