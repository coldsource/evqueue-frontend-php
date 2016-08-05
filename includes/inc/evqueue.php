<?php

require_once 'lib/evQueue.php';
require 'conf/queueing.php';
$evqueue = new evQueue(array_values($QUEUEING)[0]);

?>