<?php
require_once __DIR__ . '/../lib/evQueue.php';
require_once __DIR__ . '/../utils/utils.php';

if(is_file('/etc/evqueue/conf/queueing.php'))
	require '/etc/evqueue/conf/queueing.php';
else if(is_file(__DIR__ . '/../conf/queueing.php'))
	require __DIR__ . '/../conf/queueing.php';
else
	die("No configuration file found");

if(!isset($_REQUEST['node']) || $_REQUEST['node'] == ""){
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
elseif(!isset($_SESSION['nodes'][$_REQUEST['node']]))
	die("Node ".$_REQUEST['node']." doesn't exist");
else
	$evqueue = getevQueue($_SESSION['nodes'][$_REQUEST['node']]);
	

?>