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
  * Authors: Nicolas Jean, Christophe Marti, Thibault Kummer
  */

require_once "lib/evQueue.php";
require_once "lib/Logger.php";
require_once 'conf/queueing.php';

// This is a wrapper class to evQueue
// It is used to handle Logger() and nodes configuration
class WorkflowInstance {
	private $node_name;
	private $evqueue;
	
	public function __construct($node_name) {
		global $QUEUEING;
		
		if (!isset($QUEUEING[$node_name]))
			Logger::GetInstance()->Log(LOG_ERR,'WorkflowInstance',"Unknown evqueue node '$node_name'");
		
		$this->node_name = $node_name;
		
		$this->evqueue = new evQueue($QUEUEING[$node_name]);
	}
	
	public function LaunchWorkflowInstance($workflow_name, $parameters = array(), $mode = 'asynchronous', $user_host = false) {
		try
		{
			return $this->evqueue->LaunchWorkflowInstance($workflow_name,$parameters,$mode,$user_host);
		}
		catch(Exception $e)
		{
			Logger::GetInstance()->Log(LOG_ERR,'WorkflowInstance ',$e->getMessage());
		}
	}
	
	
	public function GetWorkflowStatus($workflow_instance_id) {
		try
		{
			return $this->evqueue->GetWorkflowStatus($workflow_instance_id);
		}
		catch(Exception $e)
		{
			Logger::GetInstance()->Log(LOG_ERR,'WorkflowInstance ',$e->getMessage());
		}
	}
	
	
	public function StopWorkflow ($workflow_instance_id) {
		try
		{
			return $this->evqueue->StopWorkflow($workflow_instance_id);
		}
		catch(Exception $e)
		{
			Logger::GetInstance()->Log(LOG_ERR,'WorkflowInstance ',$e->getMessage());
		}
	}
	
	
	public function GetWorkflowOutput($workflow_instance_id)
	{
		try
		{
			return $this->evqueue->GetWorkflowOutput($workflow_instance_id);
		}
		catch(Exception $e)
		{
			Logger::GetInstance()->Log(LOG_ERR,'WorkflowInstance ',$e->getMessage());
		}
	}
	
	
	public function GetStatistics($type)
	{
		try
		{
			return $this->evqueue->GetStatistics($type);
		}
		catch(Exception $e)
		{
			Logger::GetInstance()->Log(LOG_ERR,'WorkflowInstance ',$e->getMessage());
		}
	}
	
	public function GetConfiguration()
	{
		try
		{
			return $this->evqueue->GetConfiguration();
		}
		catch(Exception $e)
		{
			Logger::GetInstance()->Log(LOG_ERR,'WorkflowInstance ',$e->getMessage());
		}
	}
	
	
	public function ResetStatistics()
	{
		try
		{
			return $this->evqueue->ResetStatistics();
		}
		catch(Exception $e)
		{
			Logger::GetInstance()->Log(LOG_ERR,'WorkflowInstance ',$e->getMessage());
		}
	}
	
	
	public static function ReloadEvqueue () {
		try
		{
			global $QUEUEING;
			foreach($QUEUEING as $node_name=>$cnx)
			{
				$evq = new evQueue($cnx);
				$evq->ReloadEvqueue();
			}
		}
		catch(Exception $e)
		{
			Logger::GetInstance()->Log(LOG_WARNING,'WorkflowInstance ',$e->getMessage());
			return false;
		}
		
		return true;
	}
	
	public static function SyncTasks () {
		try
		{
			global $QUEUEING;
			foreach($QUEUEING as $node_name=>$cnx)
			{
				$evq = new evQueue($cnx);
				$evq->SyncTasks();
			}
		}
		catch(Exception $e)
		{
			Logger::GetInstance()->Log(LOG_WARNING,'WorkflowInstance ',$e->getMessage());
			return false;
		}
		
		return  true;
	}
	
	public static function SyncNotifications () {
		try
		{
			global $QUEUEING;
			foreach($QUEUEING as $node_name=>$cnx)
			{
				$evq = new evQueue($cnx);
				$evq->SyncNotifications();
			}
		}
		catch(Exception $e)
		{
			Logger::GetInstance()->Log(LOG_WARNING,'WorkflowInstance ',$e->getMessage());
			return  false;
		}
		
		return true;
	}
	
	public static function RetryAll () {
		try
		{
			return $this->evqueue->RetryAll();
		}
		catch(Exception $e)
		{
			Logger::GetInstance()->Log(LOG_ERR,'WorkflowInstance ',$e->getMessage());
		}
	}
	
	public function KillTask ($workflow_instance_id, $task_pid) {
		try
		{
			return $this->evqueue->KillTask($workflow_instance_id,$task_pid);
		}
		catch(Exception $e)
		{
			Logger::GetInstance()->Log(LOG_ERR,'WorkflowInstance ',$e->getMessage());
		}
	}
	
	
	public function GetNextExecutionTime() {
		try
		{
			return $this->evqueue->GetNextExecutionTime();
		}
		catch(Exception $e)
		{
			Logger::GetInstance()->Log(LOG_ERR,'WorkflowInstance ',$e->getMessage());
		}
	}
	
	
	public function GetRunningWorkflows($limit=null) {
		try
		{
			$xml = $this->evqueue->GetRunningWorkflows();
		}
		catch(Exception $e)
		{
			Logger::GetInstance()->Log(LOG_WARNING,'WorkflowInstance ',$e->getMessage());
			return;
		}
		
		$dom = new DOMDocument();
		$dom->loadXML($xml);
		$dom->documentElement->setAttribute('node_name', $this->node_name);  // Temporary: not necessary any more when evqueue returns the node_name itself.
		
		if ($limit) {
			$xp = new DOMXPath($dom);
			
			$dom->documentElement->setAttribute('total-running', $xp->query('/workflows/workflow')->length);
			$l = (int)$limit + 1;
			$wf = $xp->query("/workflows/workflow[position()=$l]");  // delete workflows from limit+1
			if ($wf->length > 0) {
				$wf = $wf->item(0);
				while ($wf) {
					$nextwf = $wf->nextSibling;
					$wf->parentNode->removeChild($wf);
					$wf = $nextwf;
				}
			}
		}
		
		return $dom->saveXML();
	}
	
	public static function StoreFile ($filename,$data) {
		global $QUEUEING;
		$wfi = new WorkflowInstance(array_keys($QUEUEING)[0]);
		try
		{
			$wfi->evqueue->StoreFile($filename,$data);
		}
		catch(Exception $e)
		{
			Logger::GetInstance()->Log(LOG_WARNING,'WorkflowInstance ',$e->getMessage());
			return  false;
		}
		
		return true;
	}
	
	public static function DeleteFile ($filename) {
		global $QUEUEING;
		$wfi = new WorkflowInstance(array_keys($QUEUEING)[0]);
		try
		{
			$wfi->evqueue->DeleteFile($filename);
		}
		catch(Exception $e)
		{
			Logger::GetInstance()->Log(LOG_WARNING,'WorkflowInstance ',$e->getMessage());
			return false;
		}
		
		return  true;
	}
	
	public static function StoreConfFile ($filename,$data) {
		global $QUEUEING;
		$wfi = new WorkflowInstance(array_keys($QUEUEING)[0]);
		try
		{
			return $wfi->evqueue->StoreConfFile($filename,$data);
		}
		catch(Exception $e)
		{
			Logger::GetInstance()->Log(LOG_ERR,'WorkflowInstance ',$e->getMessage());
		}
	}
	
	public static function DeleteConfFile ($filename) {
		global $QUEUEING;
		$wfi = new WorkflowInstance(array_keys($QUEUEING)[0]);
		try
		{
			return $wfi->evqueue->DeleteConfFile($filename);
		}
		catch(Exception $e)
		{
			Logger::GetInstance()->Log(LOG_ERR,'WorkflowInstance ',$e->getMessage());
		}
	}
	
	public static function GetConfFile ($filename) {
		global $QUEUEING;
		$wfi = new WorkflowInstance(array_keys($QUEUEING)[0]);
		try
		{
			return $wfi->evqueue->GetConfFile($filename);
		}
		catch(Exception $e)
		{
			Logger::GetInstance()->Log(LOG_ERR,'WorkflowInstance ',$e->getMessage());
		}
	}
	
	public static function GetTaskFile ($filename) {
		global $QUEUEING;
		$wfi = new WorkflowInstance(array_keys($QUEUEING)[0]);
		try
		{
			return $wfi->evqueue->GetTaskFile($filename);
		}
		catch(Exception $e)
		{
			Logger::GetInstance()->Log(LOG_ERR,'WorkflowInstance ',$e->getMessage());
		}
	}
	
	public static function PutTaskFile ($filename,$data) {
		global $QUEUEING;
		$wfi = new WorkflowInstance(array_keys($QUEUEING)[0]);
		try
		{
			return $wfi->evqueue->PutTaskFile($filename,$data);
		}
		catch(Exception $e)
		{
			Logger::GetInstance()->Log(LOG_ERR,'WorkflowInstance ',$e->getMessage());
		}
	}
	
	public static function DeleteTaskFile ($filename) {
		global $QUEUEING;
		$wfi = new WorkflowInstance(array_keys($QUEUEING)[0]);
		try
		{
			return $wfi->evqueue->DeleteTaskFile($filename);
		}
		catch(Exception $e)
		{
			Logger::GetInstance()->Log(LOG_ERR,'WorkflowInstance ',$e->getMessage());
		}
	}
	
}
?>