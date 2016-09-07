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


/*
if (!isset($_POST['action']) || !isset($_POST['location']))
	pie('ko','action or location not set');

if (!preg_match('_^(/\w+\[\d+\])*$_',$_POST['location']))
	pie('ko','location not valid');


if (!isset($_SESSION['edition']['workflow']))
	pie('ko','no workflow in set in session');


$dom = new DOMDocument();
if (!@$dom->loadXML($_SESSION['edition']['workflow'])) {
	unset($_SESSION['edition']['workflow']);
	unset($_SESSION['edition']['vars']);
	session_write_close();
	pie('ko','invalid workflow set in session (it has just been completely deleted)');
}


// get the location where the action is supposed to take place
$location = null;
$xpath = new DOMXPath($dom);

if ($_POST['location'] != '') {
	$nodes = $xpath->evaluate($_POST['location']);
	if ($nodes->length != 1)
		pie('ko',"no node at xpath {$_POST['location']}");
	
	$location = $nodes->item(0);
}*/


switch ($_POST['action']) {
	
	case 'addTask':
		$workflow = $xpath->evaluate('/workflow');
		if ($workflow->length != 1)
			pie('ko',"there is no 'workflow' root tag in this workflow");
		
		$workflow = $workflow->item(0);
		$subjobs = $xpath->evaluate('subjobs', $workflow);
		
		if ($subjobs->length == 0) {
			$subjobs = $dom->createElement('subjobs');
			$workflow->appendChild($subjobs);
		} else {
			$subjobs = $subjobs->item(0);
		}
		
		$job = $dom->createElement('job');
		$tasks = $dom->createElement('tasks');
		$task = $dom->createElement('task');
		$task->setAttribute('name', 'new task');
		
		$subjobs->appendChild($job);
		$job->appendChild($tasks);
		$tasks->appendChild($task);
		break;
	
	case 'addParallelTask':
		$newtask = $dom->createElement('task');
		$newtask->setAttribute('name', 'new task');
		$location->parentNode->appendChild($newtask);
		break;
	
	case 'addChildTask':
		$location = $location->parentNode->parentNode;  // 'job' node
		
		$nodes = $xpath->evaluate('subjobs', $location);
		if ($nodes->length > 0) {
			$location = $nodes->item(0);
		} else {
			$node = $dom->createElement('subjobs');
			$location->appendChild($node);
			$location = $node;
		}
		
		$newjob = $dom->createElement('job');
		$newtasks = $dom->createElement('tasks');
		$newtask = $dom->createElement('task');
		$newtask->setAttribute('name', 'new task');
		
		$newtasks->appendChild($newtask);
		$newjob->appendChild($newtasks);
		$location->appendChild($newjob);
		break;
	
	case 'addParentTask':
		$job = $location->parentNode->parentNode;  // 'job' node (will need to be relocated in my subjobs)
		$location = $job->parentNode;
		
		$newjob = $dom->createElement('job');
		$newsubjobs = $dom->createElement('subjobs');
		$newtasks = $dom->createElement('tasks');
		$newtask = $dom->createElement('task');
		$newtask->setAttribute('name', 'new task');
		
		$newtasks->appendChild($newtask);
		$newjob->appendChild($newtasks);
		$newjob->appendChild($newsubjobs);
		$newsubjobs->appendChild($job);  // previous job becomes a subjob of the new job
		$location->appendChild($newjob);
		break;
	
	case 'editTask':
		if (!isset($_POST['task_name']) || !isset($_POST['queue_name']) || !isset($_POST['retry_schedule']))
			pie('ko','[editTask] task_name, queue_name or retry_schedule not set');
		
		// TODO: check values for all three parameters (or postpone this verification to a big parse'n'check afterwards)
		
		$location->setAttribute('name', $_POST['task_name']);
		$location->setAttribute('queue', $_POST['queue_name']);
		
		if ($_POST['retry_schedule'] != '')
			$location->setAttribute('retry_schedule', $_POST['retry_schedule']);
		else
			$location->removeAttribute ('retry_schedule');
		
		if ($_POST['loop'] != '')
			$location->setAttribute('loop', $_POST['loop']);
		else
			$location->removeAttribute ('loop');
		
		if ($_POST['condition'] != '')
			$location->setAttribute('condition', $_POST['condition']);
		else
			$location->removeAttribute ('condition');
		
		break;
	
	case 'editTaskInput':
		
		switch ($_POST['type']) {
			case 'input':  // location is input node
				if ($_POST['name'] != '')
					$location->setAttribute('name', $_POST['name']);
				else
					$location->removeAttribute('name');
				break;
			
			case 'stdin':  // location is parent 'task' node if stdin does not exist yet, or the stdin node otherwise
				if ($location->nodeName == 'task') {
					$stdin = $dom->createElement('stdin');
					$location->appendChild($stdin);  // we add a new stdin node
					$location = $stdin;  // and switch to it
				}
				$location->setAttribute('mode', $_POST['mode']);  // mode 'text' or 'xml'
				break;
		}
		
		// first, remove all children (backwards, because this is classy (and it also does not work forwards e.g. using foreach))
		for ($i = $location->childNodes->length-1; $i>=0; $i--)
			$location->removeChild($location->childNodes->item($i));
		
		// then add as many children (<value>, <copy>, text nodes) as necessary
		for ($i=0; $i<count($_POST['value_type']); $i++) {
			switch ($_POST['value_type'][$i]) {
				case 'xpath':
					$node = $dom->createElement('value');
					$node->setAttribute('select', $_POST['value'][$i]);
					$location->appendChild($node);
					break;
				
				case 'copy':
					$node = $dom->createElement('copy');
					$node->setAttribute('select', $_POST['value'][$i]);
					$location->appendChild($node);
					break;
				
				case 'text':
					$node = $dom->createTextNode($_POST['value'][$i]);
					$location->appendChild($node);
					break;
				
				default:
					pie('ko',"[editTaskInput] unknown value_type '{$_POST['value_type'][$i]}'");
			}
		}
		break;
	
	case 'deleteTaskInput':
		// be very careful not to delete a <task> (case where the stdin is already missing, although the interface should not display the delete button in that case)
		if ($location->nodeName == 'input' || $location->nodeName == 'stdin')
			$location->parentNode->removeChild($location);
		break;
	
	case 'addTaskInput':
		$node = $dom->createElement('input');
		$node->setAttribute('name', 'new_input');
		
		$stdin = $location->childNodes->length ? $location->childNodes->item($location->childNodes->length-1) : null;
		if (!$stdin || $stdin->nodeName != 'stdin')
			$stdin = null;
		
		if ($stdin)
			$location->insertBefore($node, $stdin);
		else
			$location->appendChild($node);
		break;
		
	case 'deleteTask':
		$nbdel = 1;
		$parent = $location->parentNode;
		$location->parentNode->removeChild($location);
		$location = $parent;
		
		// 'recursively' remove nodes above me that don't have children any more, and remove 'job' tags with no 'tasks' tag inside
		while (!hasChildren($location) || $location->nodeName == 'job' && !hasChildren($location,'tasks')) {
			
			switch ($location->nodeName) {
				case 'task':
					$nbdel++;
					break;
				
				case 'job':
					$nbdel += $xpath->evaluate('.//task', $location)->length;
					break;
			}
			
			$parent = $location->parentNode;
			$location->parentNode->removeChild($location);
			$location = $parent;
		}
		
		// TODO: if parent job becomes empty, delete all his sons
		
		if ($nbdel == 1)
			pie('confirm',"Are you sure you want to delete this task?");
		else
			pie('confirm',"Are you sure you want to delete this task? This will delete ALL subsequent tasks ($nbdel in total)");
		break;
	
	
	case 'editJob':
		
		foreach (array('name','condition','loop') as $p)
			if ($_POST[$p])
				$location->setAttribute($p, $_POST[$p]);
			else
				$location->removeAttribute($p);
		
		break;
	
	
	case 'addParameter':
		$nodes = $xpath->evaluate('/workflow/parameters');
		if ($nodes->length != 1)
			pie('ko',"there is no 'parameters' (or more than one) tag in this workflow");
		
		$newparam = $dom->createElement('parameter');
		$newparam->setAttribute('name', $_POST['parameter_name']);
		$nodes->item(0)->appendChild($newparam);
		break;
	
	case 'deleteParameter':
		$location->parentNode->removeChild($location);
		break;
	
	case 'cancel':
		unset($_SESSION['edition']['workflow']);
		unset($_SESSION['edition']['vars']);
		session_write_close();
		pie('ok-redirect','list-workflows.php');  // redirect to workflow list
	
	case 'saveWorkflow':
		
		// EDITION
		$_POST['workflow_xml'] = $_SESSION['edition']['workflow'];
		$errors = saveWorkflow($_POST);
		
		if ($errors !== false)
			pie('ko',$errors);
		
		unset($_SESSION['edition']['workflow']);
		unset($_SESSION['edition']['vars']);
		session_write_close();
		pie('ok-redirect','list-workflows.php');  // redirect to workflow list
		break;
	
	case 'updateXml':
		$_SESSION['edition'][$_POST['id']]['workflow'] = $_POST['xml'];
		break;
	
	default:
		pie('ko',"undefined action {$_POST['action']}");
}

/*
$_SESSION['edition']['workflow'] = $dom->saveXML($dom->documentElement);

if(isset($_POST['workflow_name']) && isset($_POST['workflow_group'])){
	$_SESSION['edition']['vars']['workflow_name'] = $_POST['workflow_name'];
	$_SESSION['edition']['vars']['workflow_group'] = $_POST['workflow_group'];
	$_SESSION['edition']['vars']['workflow_comment'] = $_POST['workflow_comment'];
}
session_write_close();
pie('ok');
*/
?>