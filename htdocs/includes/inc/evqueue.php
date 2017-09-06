<?php
require_once __DIR__ . '/../lib/evQueueCluster.php';

if(is_file('/etc/evqueue/conf/queueing.php'))
	require '/etc/evqueue/conf/queueing.php';
else if(is_file(__DIR__ . '/../conf/queueing.php'))
	require __DIR__ . '/../conf/queueing.php';
else
	die("No configuration file found");

@session_start();
$user_login = isset($_SESSION['user_login']) ? $_SESSION['user_login'] : false;
$user_pwd = isset($_SESSION['user_pwd']) ? $_SESSION['user_pwd'] : false;

$cluster = new evQueueCluster($QUEUEING, $user_login, $user_pwd, true);

?>