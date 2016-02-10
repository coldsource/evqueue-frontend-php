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


class WorkflowSchedule {
	
	private $db;
	
	private $id;
	private $workflow_id;
	private $schedule;
	private $onfailure;
	private $active;
	private $node_name;
	private $host;
	private $user;
	private $parameters = array();
	private $comment;
	
	
	function __construct($id = false){
		$this->connectDB();
		
		if ($id === false or $id == ""){
			$this->id = false;
			return;
		}
		
		$this->db->QueryPrintf("SELECT * FROM t_workflow_schedule WHERE workflow_schedule_id = %i", $id);
		$row = $this->db->FetchAssoc();
		if(!$row)
			return false;
		
		$this->id = $id;
		$this->workflow_id = $row['workflow_id'];
		$this->schedule = $row['workflow_schedule'];
		$this->onfailure = $row['workflow_schedule_onfailure'];
		$this->active = $row['workflow_schedule_active'];
		$this->node_name = $row['node_name'];
		$this->host = $row['workflow_schedule_host'];
		$this->user = $row['workflow_schedule_user'];
		$this->comment = $row['workflow_schedule_comment'];
		
		$this->parameters = array();
		$this->db->QueryPrintf("SELECT * FROM t_workflow_schedule_parameters WHERE workflow_schedule_id = %i", $id);
		while($row = $this->db->FetchAssoc()){
			$this->parameters[$row['workflow_schedule_parameter']] = $row['workflow_schedule_parameter_value'];
		}
	}
	
	private function connectDB ($mode = null) {
		if ($mode === null)
			$mode = DatabaseMySQL::$MODE_RDONLY;
		
		$this->db = new DatabaseMySQL ('queueing', $mode);
		return $this->db;
	}	

	public function set_id($id){
		$this->id = $id; 
	}
	
	public function get_id(){
		return $this->id;
	}
	
	public function set_workflow_id($workflow_id){
		// TODO: check that the workflow exists (and has no parameters)
		$this->workflow_id = $workflow_id;
	}
	
	public function get_workflow_id(){
		return $this->workflow_id;
	}
	
	public function set_schedule($schedule){
		// TODO: regex-check validity
		$this->schedule = $schedule;
	}
	
	public function get_schedule(){
		return $this->schedule;
	}
	
	public function set_onfailure($onfailure){
		$this->onfailure = $onfailure;
	}
	
	public function get_onfailure(){
		return $this->onfailure;
	}
	
	public function set_active($active) {
		$this->active = $active;  // 1 or 0
	}
	
	public function get_active(){
		return $this->active;
	}
	
	public function set_node_name($node_name){
		$this->node_name = $node_name;
	}
	
	public function get_node_name(){
		return $this->node_name;
	}
	
	public function set_host($host){
		$host = empty($host)? NULL:$host;
		$this->host = $host;
	}
	
	public function get_host(){
		return $this->host;
	}
	
	public function set_user($user){
		$user = empty($user)? NULL:$user;
		$this->user = $user;
	}
	
	public function get_user(){
		return $this->user;
	}
	
	public function set_parameters($parameters){
		$this->parameters = $parameters;
	}
	
	public function get_parameters(){
		return $this->parameters;
	}
	
	public function set_comment($comment){
		$this->comment = $comment;
	}
	
	public function get_comment(){
		return $this->comment;
	}
	
	public function CommitObject()
	{
		$this->connectDB(DatabaseMySQL::$MODE_RDRW);
		
		if ($this->id === false) {
			$this->db->QueryPrintf("
					INSERT INTO t_workflow_schedule (
						workflow_id, workflow_schedule, workflow_schedule_onfailure, workflow_schedule_user, node_name, workflow_schedule_host, workflow_schedule_active, workflow_schedule_comment
				) VALUES (
						%i, %s, %s, %s, %s, %i, %s
				)",
							$this->workflow_id, $this->schedule, $this->onfailure, $this->user, $this->node_name, $this->host, $this->active, $this->comment
			);
				
			$this->id = $this->db->GetInsertID();
			
		} else {
			$this->db->QueryPrintf("
					UPDATE t_workflow_schedule
					SET
						workflow_id = %i,
						workflow_schedule = %s,
						workflow_schedule_onfailure = %s,
						workflow_schedule_user = %s,
						node_name = %s,
						workflow_schedule_host = %s,
						workflow_schedule_active = %i,
						workflow_schedule_comment = %s
					WHERE workflow_schedule_id = %i
					",
							$this->workflow_id,
							$this->schedule,
							$this->onfailure,
							$this->user,
							$this->node_name,
							$this->host,
							$this->active,
							$this->comment,
							$this->id
			);
			$this->db->QueryPrintf("DELETE FROM t_workflow_schedule_parameters WHERE workflow_schedule_id = %i", $this->id);
		}
		
		
		foreach($this->parameters as $parameterName => $parameterValue) {
			$this->db->QueryPrintf("
				INSERT INTO t_workflow_schedule_parameters (workflow_schedule_id, workflow_schedule_parameter, workflow_schedule_parameter_value)
				VALUES (%i, %s, %s)
			",
				$this->id,
				$parameterName,
				$parameterValue
			);
		}
		
		WorkflowInstance::ReloadEvqueue();
	}
	
	public function check_values($vals, $setvals=false){
		$errors = array();
		$this->set_workflow_id($vals['workflow_id']);
		$this->set_schedule($vals['schedule']);
		$this->set_onfailure($vals['onfailure']);
		$this->set_user($vals['schedule_user']);
		$this->set_node_name($vals['node_name']);
		$this->set_host($vals['schedule_host']);
		$this->set_active($vals['active']);
		$this->set_comment($vals['schedule_comment']);
		
		if(isset($vals['schedule_parameters']) && !is_array($vals['schedule_parameters']))
			parse_str($vals['schedule_parameters'], $parameters);
		elseif(isset($vals['schedule_parameters']) && is_array($vals['schedule_parameters']))
			$parameters = $vals['schedule_parameters'];
		else
			$parameters = array();
		
		$this->set_parameters($parameters);
		
		if (count($errors)>0)
			return $errors;
		
		if ($setvals === true)
			$this->CommitObject();
		
		return true;
	}
	
	public function getGeneratedXml () {
		return WorkflowSchedule::getXML($this);
	}
	
	public static function getXML (WorkflowSchedule $schedule) {
		$parameters = $schedule->get_parameters();
		$parameters_xml = '<parameters>';
		foreach ($parameters as $key => $value) {
			$parameters_xml .= '<parameter name="'.$key.'">'.$value.'</parameter>';
		}
		$parameters_xml .= '</parameters>';
		
		$xml = '<schedule id="'.$schedule->get_id().'">';
		$xml .= '<workflow_id>'.$schedule->get_workflow_id().'</workflow_id>';
		$xml .= '<schedule>'.$schedule->get_schedule().'</schedule>';
		$xml .= '<onfailure>'.$schedule->get_onfailure().'</onfailure>';
		$xml .= '<active>'.$schedule->get_active().'</active>';
		$xml .= '<node_name>'.$schedule->get_node_name().'</node_name>';
		$xml .= '<host>'.$schedule->get_host().'</host>';
		$xml .= '<user>'.$schedule->get_user().'</user>';
		$xml .= '<comment>'.$schedule->get_comment().'</comment>';
		$xml .= $parameters_xml;
		$xml .= '</schedule>';
		return $xml;
	}
	
	public static function getAll($filter=array()){
		$res = array();
		$db = new DatabaseMySQL('queueing');
		
		$values = array();
		$query = "SELECT * FROM t_workflow_schedule ws INNER JOIN t_workflow w ON w.workflow_id = ws.workflow_id WHERE 1 ";
		if(isset($filter['active']) && in_array($filter['active'], array(1,2))){
			$query .= " AND ws.workflow_schedule_active = 1";
			$values[] = $filter['active'];
		}
		$query .= " ORDER BY CASE WHEN workflow_group = '' THEN 2 ELSE 1 END, workflow_group, workflow_name ASC;";
		
		$db->QueryPrintf($query, $values);
		
		while(($row = $db->FetchAssoc()) !== false)
			$res[] = $row;
		return $res;
	}
	
	public static function getAllXml($filter=array()){
		$schedules = WorkflowSchedule::getAll($filter);
		
		$xml = "<schedules>";
		foreach ($schedules as $row) {
			$xml .= WorkflowSchedule::getXML(new WorkflowSchedule($row['workflow_schedule_id']));
		}
		$xml .= "</schedules>";
		return $xml;
	}	
	
	public function delete(){
		if ($this->id !== false) {
			$this->connectDB(DatabaseMySQL::$MODE_RDRW);
			$this->db->QueryPrintf("
					DELETE FROM t_workflow_schedule
					WHERE workflow_schedule_id = %i
					",
					$this->id);
			
			// deleted workflow that's bound to this schedule, if there is one
			$this->db->QueryPrintf("SELECT * FROM t_workflow WHERE workflow_bound = 1 AND workflow_id = %i", $this->workflow_id);
			while ($wf = $this->db->FetchAssoc()) {
				$wf = new Workflow($wf['workflow_id']);
				$wf->delete();
			}
			
			$this->db->QueryPrintf("DELETE FROM t_workflow_schedule_parameters WHERE workflow_schedule_id = %i", $this->id);
			WorkflowInstance::ReloadEvqueue();
			return true;
		}else{
			return false;
		}
	}
	
	public static function GetNextExecutionTime () {
		
		
	// <status><workflow name="followups" scheduled_at="2014-08-30 06:45:00" workflow_schedule_id="135"/></status>
	}
	
	public static function GetAllLastExecution () {
		$db = new DatabaseMySQL('queueing');
		$schedules = WorkflowSchedule::getAll();
		
		$xml = "<last-execution>";
		foreach ($schedules as $schedule) {
			$db->QueryPrintf("
				SELECT *
				FROM  t_workflow_instance
				WHERE workflow_schedule_id = %i
				ORDER BY workflow_instance_start DESC
				LIMIT 1;", $schedule['workflow_schedule_id']);

			$intance = $db->FetchAssoc();
			if($intance){
				$xml .= '<workflow workflow_schedule_id="'.$intance['workflow_schedule_id'].'" workflow_instance_id="'.$intance['workflow_instance_id'].'" workflow_id="'.$intance['workflow_id'].'" workflow_instance_start="'.$intance['workflow_instance_start'].'"  workflow_instance_end="'.$intance['workflow_instance_end'].'" workflow_instance_status="'.$intance['workflow_instance_status'].'"  workflow_instance_errors="'.$intance['workflow_instance_errors'].'" />';
			}
		}
		$xml .= "</last-execution>";
		return $xml;
	}
	
}

?>