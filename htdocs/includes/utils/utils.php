<?php

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
