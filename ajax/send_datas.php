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

//require_once 'inc/auth_check.php';
require_once 'inc/logger.php';

require_once 'bo/BO_workflow.php';
require_once 'bo/BO_workflowInstance.php';
require_once 'bo/BO_task.php';
require_once 'bo/BO_queue.php';
require_once 'bo/BO_schedule.php';
require_once 'bo/BO_workflowSchedule.php';
require_once 'bo/BO_notification.php';
require_once 'bo/BO_notificationType.php';


/*
 * This PHP should never be called directly, but rather through the use of WebserviceWrapper.
 * WebserviceWrapper will for example add the 'user_login' parameter that is needed
 * for access control checks.
 */


if (isset($_POST) && !empty($_POST)){
	if (!isset($_POST['form_id']) || $_POST['form_id']=='')
		die("<error>Technical error</error>");
	
	if (!isset($_POST['user_login']))
		die("<error>No user</error>");
	
	$user = new User($_POST['user_login']);
	if (!is_object($user))
		die("<error>Wrong user</error>");
	
	unset($_POST['user_login']);
	
	$setVals=false;
	if (isset($_POST['setVals']) && $_POST['setVals']==="1")
		$setVals=true;
	unset($_POST['setVals']);
	
	$confirmed = isset($_POST['confirm']) && $_POST['confirm'] == 'yes';
	
	if(!$user->CheckRights($_POST)) {
		writeEnd(array('no-right' => ''));
		die();
	}
	
	switch ($_POST['form_id']){
		case "formWorkflow":
			$WorkFlow = new Workflow($_POST['workflow_id']);
			writeEnd($WorkFlow->check_values($_POST,$setVals), $WorkFlow);
			break;
		case "formTask":
			$Task = new Task($_POST['task_id']);
			writeEnd($Task->check_values($_POST,$setVals,$confirmed));
			break;
		case "formQueue":
			$Queue = new Queue($_POST['queue_id']);
			writeEnd($Queue->check_values($_POST,$setVals));
			break;
		case "formSchedule":
			$Schedule = new Schedule($_POST['schedule_id']);
			writeEnd($Schedule->check_values($_POST,$setVals));
			break;
		case 'formWorkflowSchedule':
			$schedule = new WorkflowSchedule($_POST['workflow_schedule_id']);
			writeEnd($schedule->check_values($_POST,$setVals));
			break;
		
		case "deleteTask":
			$Task = new Task($_POST['id']);
			writeEnd($Task->delete($confirmed,$_POST['deleteBinary']==1));
			break;
		case "deleteWorkflow":
			$WorkFlow = new WorkFlow($_POST['id']);
			writeEnd($WorkFlow->delete());
			break;
		case "deleteQueue":
			$Queue = new Queue($_POST['id']);
			writeEnd($Queue->delete());
			break;
		case "deleteSchedule":
			$schedule = new Schedule($_POST['id']);
			writeEnd($schedule->delete());
			break;
		case "deleteWorkflowSchedule":
			$schedule = new WorkflowSchedule($_POST['id']);
			writeEnd($schedule->delete());
			break;
		
		case "deleteWFI":
			$wfi = new WorkflowInst($_POST['id']);
			writeEnd($wfi->delete());
			break;
		
		case "stopWFI":
			$wfi = new WorkflowInst($_POST['id']);
			writeEnd($wfi->stop($_POST['node_name']));
			break;
		
		case 'killTask':
			$wfi = new WorkflowInstance();
			$wfi->KillTask($_POST['id'], $_POST['task_pid']);
			writeEnd(true);
			break;
		
		case 'resetStats':
			$wfi = new WorkflowInstance($_POST['node_name']);
			$wfi->ResetStatistics();
			writeEnd(true);
			break;
		
		case 'launchWorkflow':
			$id = $_POST["id"];
			
			if (is_numeric($id)) {
				$wfi_bo = new WorkflowInst($id);
				$name = $wfi_bo->getWorkflowName();
			} else {
				$name = $id;
			}
			
			$user_host = false;
			if (trim($_POST['user'].$_POST['host'] != ''))
				$user_host = $_POST['user'].'@'.$_POST['host'];
			
			$wfi = new WorkflowInstance($_POST['node']);
			$id = $wfi->LaunchWorkflowInstance($name, isset($_POST['wfparams']) ? $_POST['wfparams'] : [], 'asynchronous', $user_host);
			
			if ($id === false){
				$xml = "<error>Could not launch workflow: the queueing engine is likely not running, or workflow has been deleted/modified?</error>";
			}else{
				$xml = "<success wfid='$id'></success>";
			}
			
			echo $xml;
			break;
		
		case 'saveNotif':
			$notif = new Notification($_POST['id']);
			
			if (!isset($_POST['type_id']))
				$_POST['type_id'] = $notif->getTypeID();
			$type = new NotificationType($_POST['type_id']);
			
			$params = $_POST;
			unset($params['id'],$params['type_id'],$params['name'],$params['form_id']);
			require_once '../plugins/notifications/'.$type->getName().'/notification-parameters.php';
			$_POST['parameters'] = NotificationParameters::serialise($params);
			
			$errors = NotificationParameters::check_parameters($params);
			$errorz = $notif->check_values($_POST,false);  // just check the parameters
			$errors = array_merge($errorz!==true?$errorz:array(), $errors!==true?$errors:array());
			
			if (empty($errors)) {
				$errors = true;
				$notif->check_values($_POST,$setVals);  // actually commit the object
			}
			
			writeEnd($errors,$notif);
			break;
		
		case 'deleteNotif':
			$notif = new Notification($_POST['id']);
			writeEnd($notif->delete());
			break;
		
		default:
			Logger::GetInstance()->Log(LOG_WARNING,'send_datas.php',"Dunno any webservice named '{$_POST['form_id']}'");
	}
	
}

function writeEnd($ret,$obj=null){
	
	if ($ret !== true){
		$retour = "<errors>";
		if (is_array($ret)){
			foreach($ret as $key=>$val){
				$retour .= "<error id='$key'>$val</error>";
			}
		}else{
			$retour .= "<error>Technical Error</error>";
		}
		$retour .= "</errors>";
	}else{
		$retour = $obj ? $obj->getGeneratedXml() : "<ok/>";
	}
	
	echo $retour;
}


?>