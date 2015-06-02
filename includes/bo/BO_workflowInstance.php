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

require_once 'inc/logger.php';
require_once 'lib/DatabaseMySQL.php';
require_once 'lib/workflow_instance.php';
require_once 'bo/BO_workflow.php';
require_once 'bo/BO_user.php';


class WorkflowInst{
	
	public static $PAGESIZE = 30;
	
	private $db;
	
	private $workflow_instance_id; 
	private $workflow_id;
	private $workflow_instance_start;
	private $workflow_instance_end;
	private $workflow_instance_status;
	private $workflow_instance_errors;
	private $workflow_instance_savepoint;
	
	function __construct($id = false){
		
		$this->connectDB();
		
		if ($id === false or $id == ""){
			$this->workflow_instance_id = false;
			return;
		}

		$this->db->QueryPrintf("SELECT * FROM t_workflow_instance WHERE workflow_instance_id = %i", $id);
		$row = $this->db->FetchAssoc();
		if(!$row)
			return false;
		
		
		$this->workflow_instance_id = $row['workflow_instance_id'];
		$this->workflow_id = $row['workflow_id'];
		$this->workflow_instance_start = $row['workflow_instance_start'];
		$this->workflow_instance_end = $row['workflow_instance_end'];
		$this->workflow_instance_status = $row['workflow_instance_status'];
		$this->workflow_instance_errors = $row['workflow_instance_errors'];
		$this->workflow_instance_savepoint = $row['workflow_instance_savepoint'];
		
	}
	
	private function connectDB ($mode = null) {
		if ($mode === null)
			$mode = DatabaseMySQL::$MODE_RDONLY;
			
			$this->db = new DatabaseMySQL ('queueing', $mode);

		return $this->db;
	}	

	public function get_workflow_instance_id(){
		return $this->workflow_instance_id;
	}
	
	public function get_workflow_id(){
		return $this->workflow_id;
	}

	public function get_workflow_instance_start(){
		return $this->workflow_instance_start;
	}

	public function get_workflow_instance_end(){
		return $this->workflow_instance_end;
	}
	
	public function get_workflow_instance_status(){
		return $this->workflow_instance_status;
	}
	
	public function get_workflow_instance_errors(){
		return $this->workflow_instance_errors;
	}
	
	public function get_workflow_instance_savepoint(){
		return $this->workflow_instance_savepoint;
	}
	
	public function getGeneratedXml(){
		$xml = '<workflow_instance id="'.$this->get_workflow_instance_id().'">';
		$xml .= '<workflow_id>'.$this->get_workflow_id().'</workflow_id>';
		$xml .= '<workflow_instance_start>'.$this->get_workflow_instance_start().'</workflow_instance_start>';
		$xml .= '<workflow_instance_end>'.$this->get_workflow_instance_end().'</workflow_instance_end>';
		$xml .= '<workflow_instance_status>'.$this->get_workflow_instance_status().'</workflow_instance_status>';
		$xml .= '<workflow_instance_errors>'.$this->get_workflow_instance_errors().'</workflow_instance_errors>';
		$xml .= '<workflow_instance_savepoint>'.htmlspecialchars($this->get_workflow_instance_savepoint()).'</workflow_instance_savepoint>';
		$xml .= '</workflow_instance>';
		return $xml;
	}
	
	public function delete(){
	
		if ($this->workflow_instance_id !== false) {
	
			$this->connectDB(DatabaseMySQL::$MODE_RDRW);
			$this->db->QueryPrintf("
					DELETE FROM t_workflow_instance
					WHERE workflow_instance_id = %i
					",
					$this->workflow_instance_id);
			return true;
		}else{
			return false;
		}
	}
	
	public function stop(){
		if ($this->workflow_instance_id === false)
			return false;
		
		$wfi = new WorkflowInstance();
		return $wfi->StopWorkflow($this->workflow_instance_id);
	}
	
	public function getArrayParams(){
		
		if ($this->workflow_instance_id === false){
			return;
		}
		
		$doc = new DOMDocument();
		$doc->loadXML($this->get_workflow_instance_savepoint());
		$xpath = new DOMXpath($doc);
		$elements = $xpath->query("/workflow/parameters/parameter");
		$arr = array();
		if (!is_null($elements)) {
			foreach ($elements as $element) {
				$arr[$element->getAttribute("name")]=$element->nodeValue;
			}
		}
		return $arr;
	}
	
	public function getWorkflowName(){
		
		if ($this->workflow_instance_id === false){
			return;
		}
		
		$wk = new Workflow($this->get_workflow_id());
		return $wk->get_name(); 

	}
	
	
	public static function GetNbErroredWorkflows () {
		$db = new DatabaseMySQL('queueing');
		$db->Query("
			SELECT COUNT(*)
			FROM t_workflow_instance
			WHERE workflow_instance_end != '0000-00-00 00:00:00'
			  AND workflow_instance_errors > 0
		");
		$row = $db->FetchArray();
		return $row[0];
	}
	
	
	public static function GetTerminatedWorkflows($params, $user_mgmt=true) {
		// TERMINATED workflows
		$query = "
			SELECT SQL_CALC_FOUND_ROWS workflow_name,workflow_instance_id,workflow_instance_host,workflow_instance_start,workflow_instance_end,workflow_instance_status,workflow_instance_errors
			FROM t_workflow_instance wfi
			LEFT JOIN t_workflow wf ON(wf.workflow_id=wfi.workflow_id)
		";
		$values = array();
		
		// user rights
		if ($user_mgmt) {
			$filter = User::FilterWorkflowsForUser($_SESSION['user_login']);
			$query .= $filter['query'];
			$values = $filter['values'];
		}
		
		$query .= " WHERE workflow_instance_end != '0000-00-00 00:00:00'";
		
		$get = array_filter($params);
		
		if (isset($get['filter'])) {
			switch ($get['filter']) {
				case 'errors':
					$query .= " AND workflow_instance_errors > 0";
					break;
			}
		}
		
		if (isset($get['dt_inf'])) {
			$query .= " AND workflow_instance_start >= %d";
			$values[] = date('Y-m-d H:i:s', strtotime($get['dt_inf'].' '.$params['hr_inf']));
		}
		
		if (isset($get['dt_sup'])) {
			$query .= " AND workflow_instance_start <= %d";
			$hr_sup = $params['hr_sup'] ? $params['hr_sup'] : '23:59:59';
			$values[] = date('Y-m-d H:i:s', strtotime($get['dt_sup']." $hr_sup"));
		}
		
		if(isset($get['wf_name'])) {
			$query .= " AND wf.workflow_name = %s";
			$values[] = $get['wf_name'];
		}
		
		if (isset($get['workflow_schedule_id'])) {
			$query .= ' AND workflow_schedule_id = %i';
			$values[] = $get['workflow_schedule_id'];
		}
		
		if (isset($get['workflow_instance_id'])) {
			$query .= ' AND wfi.workflow_instance_id = %i';
			$values[] = $get['workflow_instance_id'];
		}
		
		if (isset($get['searchParams'])) {
			$searchParams = json_decode($get['searchParams'],true);
			if ($searchParams !== null) {
				$condition = array();
				foreach ($searchParams as $param) {
					$condition[] = "workflow_instance_parameter = %s AND workflow_instance_parameter_value = %s";
					$values[] = $param['name'];
					$values[] = $param['value'];
				}
				if (sizeof($condition)>0)
					$query .= ' AND EXISTS (
						SELECT *
						FROM t_workflow_instance_parameters wp
						WHERE wp.workflow_instance_id = wfi.workflow_instance_id
							AND '.join(' OR ', $condition).')';
			}
		}
		
		$page = 1;
		if (isset($_GET['p']))
			$page = max(1,(int)$_GET['p']);
		$first = ($page-1)*WorkflowInst::$PAGESIZE+1;
		$last = $first+WorkflowInst::$PAGESIZE-1;
		
		$query .= "
			ORDER BY workflow_instance_end DESC, workflow_instance_id DESC
			LIMIT ".WorkflowInst::$PAGESIZE." OFFSET %i;
		";
		$values[] = $first-1;
		
		$db = new DatabaseMySQL('queueing');
		$db->QueryVsPrintf($query, $values);
		$n = $db->GetFoundRows();
		
		$xml = "<workflows status='TERMINATED' first='$first' last='$last' page='$page' total='$n'>";
		while ( ($row = $db->FetchAssoc()) !== false )
			$xml .= '<workflow id="'.$row['workflow_instance_id'].'" errors="'.$row['workflow_instance_errors'].'" start_time="'.$row['workflow_instance_start'].'" end_time="'.$row['workflow_instance_end'].'" name="'.htmlspecialchars($row['workflow_name']).'" status="'.$row['workflow_instance_status'].'" host="'.htmlspecialchars($row['workflow_instance_host']).'"/>';
		$xml .= '</workflows>';
		
		return $xml;
	}
	
	
}

?>