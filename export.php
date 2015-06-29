<?php
require_once 'bo/BO_workflow.php';

// TODO: check rights!

$filename = '/tmp/wf.zip';

if (is_file($filename))
	unlink($filename);  // TODO: error?

$wf = new Workflow($_GET['workflow_id']);
$ret = $wf->Export($filename);

if ($ret !== true)
	die('Export failed: '.print_r($ret,true));  // TODO: better display on error

header("Content-Type: application/zip");
header("Content-Disposition: attachment; filename=".$wf->get_name().".zip");

readfile($filename);


?>