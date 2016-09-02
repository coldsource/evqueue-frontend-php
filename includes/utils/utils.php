<?php

function getevQueue($node){
	global $QUEUEING;
	$scheme = $QUEUEING[$node];
		
	if(isset($_SESSION['user_login']) && isset($_SESSION['user_pwd']))
		$evqueue = new evQueue($scheme, $_SESSION['user_login'], $_SESSION['user_pwd']);
	else
		$evqueue = new evQueue($scheme);
		
	return $evqueue;
}

function getAllGroup(){
	global $evqueue;
	$groups = [];
	$xml = $evqueue->Api("workflows", "list");
	$dom = new DOMDocument();
	$dom->loadXML($xml);
	$xpath = new DOMXPath($dom);
	$groupsDOM = $xpath->evaluate('/response/workflow/@group');
	foreach($groupsDOM as $groupDOM){
		isset($groups[$groupDOM->nodeValue]) ? $groups[$groupDOM->nodeValue]++:$groups[$groupDOM->nodeValue]=1;
	}
	ksort($groups, SORT_STRING | SORT_FLAG_CASE );
	return $groups;
}

function getAllGroupXml(){
	$res = getAllGroup();
	$xml = '<groups>';
	foreach ($res as $key => $value) {
		if($value != '')
			$xml .= "<group>$key</group>";
	}
	$xml .= '</groups>';
	
	return $xml;
}


function getAllTaskGroup(){
	global $evqueue;
	$groups = [];
	$xml = $evqueue->Api("tasks", "list");
	$dom = new DOMDocument();
	$dom->loadXML($xml);
	$xpath = new DOMXPath($dom);
	$groupsDOM = $xpath->evaluate('/response/task/@group');
	foreach($groupsDOM as $groupDOM){
		isset($groups[$groupDOM->nodeValue]) ? $groups[$groupDOM->nodeValue]++:$groups[$groupDOM->nodeValue]=1;
	}
	ksort($groups, SORT_STRING | SORT_FLAG_CASE );
	return $groups;
}

function getAllTaskGroupXml(){
	$res = getAllTaskGroup();
	$xml = '<tasks-groups>';
	foreach ($res as $key => $value) {
		if($value != '')
			$xml .= "<group>$key</group>";
	}
	$xml .= '</tasks-groups>';
	
	return $xml;
}

?>