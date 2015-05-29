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
require_once 'utils/string_utils.php';
require_once 'bo/BO_user.php';


class Workflow{
	
	private $db;
	
	private $id;
	private $name;
	private $xml;
	private $group;
	private $comment;
	private $has_bound_task;
	private $workflow_bound;
	private $notifications;
	
	
	function __construct($id = false){
		
		$this->connectDB();
		
		if ($id === false or $id == ""){
			$this->id = false;
			return;
		}

		$this->db->QueryPrintf("SELECT *, (SELECT COUNT(*) FROM t_task t WHERE t.workflow_id = w.workflow_id) AS nb_bound_tasks FROM t_workflow w WHERE workflow_id = %i", $id);
		$row = $this->db->FetchAssoc();
		if(!$row)
			return false;
		
		$this->id = $row['workflow_id'];
		$this->name = $row['workflow_name'];
		$this->xml = $row['workflow_xml'];
		$this->group = $row['workflow_group'];
		$this->comment = $row['workflow_comment'];
		$this->has_bound_task = $row['nb_bound_tasks'] > 0;
		$this->workflow_bound = $row['workflow_bound'];
		
		$this->db->QueryPrintf("SELECT notification_id FROM t_workflow_notification WHERE workflow_id = %i", $this->id);
		$this->notifications = array();
		while (list($notif_id) = $this->db->FetchArray())
			$this->notifications[] = $notif_id;
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
	
	public function set_name($name){
		$this->name = $name;
	}
	
	public function get_name(){
		return $this->name;
	}
	
	public function set_xml($xml){
		$this->xml = $xml;
	}
	
	public function get_xml(){
		return $this->xml;
	}
	
	public function set_group($group){
		$this->group = $group;
	}
	
	public function set_notifications($notifications){
		$this->notifications = $notifications;
	}
	
	public function set_comment($comment){
		$this->comment = $comment;
	}
	
	public function get_group(){
		return $this->group;
	}
	
	public function get_comment(){
		return $this->comment;
	}
	
	public function set_workflow_bound ($bound) {
		$this->workflow_bound = $bound;
	}
	
	public function get_workflow_bound () {
		return $this->workflow_bound;
	}
	
	public function has_bound_task(){
		return $this->has_bound_task;
	}
	
	public function CommitObject()
	{
		$this->connectDB(DatabaseMySQL::$MODE_RDRW);
		
		if ($this->id === false) {
			
			$this->db->QueryPrintf("
					INSERT INTO t_workflow (
					workflow_name, workflow_xml, workflow_group, workflow_comment, workflow_bound
			) VALUES (
					%s,%s,%s,%s,%i
			)",	$this->name, $this->xml, $this->group, $this->comment, $this->workflow_bound?1:0);
				
			$this->id = $this->db->GetInsertID();
		}else{
			$this->db->QueryPrintf("
					UPDATE t_workflow
					SET
						workflow_name = %s,
						workflow_xml = %s,
						workflow_group = %s,
						workflow_comment = %s
					WHERE workflow_id = %i
					",
					$this->name,
					$this->xml,
					$this->group,
					$this->comment,
					$this->id);
		}
		
		// NOTIFICATIONS
		$this->db->QueryPrintf('DELETE FROM t_workflow_notification WHERE workflow_id = %i', $this->id);
		foreach ($this->notifications as $notif)
			$this->db->QueryPrintf('INSERT INTO t_workflow_notification (workflow_id, notification_id) VALUES (%i,%i)', $this->id, (int)$notif);
		
		WorkflowInstance::ReloadEvqueue();
	}
	
	
	public static function GetIDFromName ($name) {
		$db = new DatabaseMySQL('queueing');
		$db->QueryPrintf('SELECT workflow_id FROM t_workflow WHERE workflow_name = %s', $name);
		
		if ($db->NumRows() != 1)
			return false;
		
		list($wfid) = $db->FetchArray();
		return $wfid;
	}
	
	
	public function existWorkflowName($name, $id=null){
	
		if ($id == null){
			$this->db->QueryPrintf("SELECT * FROM t_workflow WHERE workflow_name = %s ;",$name);
		}else{
			$this->db->QueryPrintf("SELECT * FROM t_workflow WHERE workflow_name = %s and workflow_id != %i  ;",$name,$id);
		}
	
		if ($this->db->NumRows() > 0){
			return true;
		}else{
			return false;
		}
	}	
	
	public function check_values($vals, $setvals=false){
		$errors = array();
		
		if (isset($vals["workflow_id"]) && $vals["workflow_id"] != ""){
			$workflowid = $vals["workflow_id"];
		}else{
			$workflowid = null;
		}		
		
		if (isset($vals["workflow_id"]) && $vals["workflow_id"] != "" && $setvals === true){
			$this->set_id($vals["workflow_id"]);
		}

		if (!isset($vals["workflow_name"]) || $vals["workflow_name"] == ""){
			$errors["workflow_name"]="Please fill the workflow name field";
		}else if($this->existWorkflowName($vals["workflow_name"],$workflowid)){
			$errors["workflow_name"]="A workflow has already the same name. Please change your workflow name.";
		}else if (!preg_match('/^[0-9a-zA-Z-_]+$/',$vals["workflow_name"])){
			$errors["workflow_name"]="The workflow name can only have letters, numbers and dashes. Please change your workflow name.";
		}else{
			if ($setvals === true){
				$this->set_name($vals["workflow_name"]);
			}
		}
		
		$task_id = $task_name = null;
		if (isset($vals['script_path'])) {
			
			if ($workflowid === null) {  // creation, find a task name that's not used yet
				$task_id = false;
				do {
					$short_wf_name = substr($vals["workflow_name"],0,15).'_';
					$task_name = $short_wf_name.generate_random_string(32-strlen($short_wf_name));
					$this->db->QueryPrintf("SELECT * FROM t_task WHERE task_name = %s", $task_name);
				} while ($this->db->NumRows() > 0);
				
			} else {  // edition, find the task name
				$this->db->QueryPrintf("SELECT task_id, task_name FROM t_task WHERE workflow_id = %i", $workflowid);
				list($task_id,$task_name) = $this->db->FetchArray();
			}
			
			$this->set_workflow_bound(isset($vals['bound']) ? $vals['bound'] : false);
			
			$arguments = '';
			if(isset($vals['script_arguments']) && is_array($vals['script_arguments'])){
				$i = 1;
				foreach ($vals['script_arguments'] as $value) {
					$arguments .= '<input name="arguments_'.$i.'">'.htmlspecialchars($value).'</input>';
					$i++;
				}
			}
			
			$vals['workflow_xml'] = "<workflow>
	<parameters/>
	<subjobs>
		<job>
			<tasks>
				<task name='$task_name' queue='default' >$arguments</task>
			</tasks>
		</job>
	</subjobs>
</workflow>";
		}
		
		if (!isset($vals["workflow_xml"]) || $vals["workflow_xml"] == ""){
			$errors["workflow_xml"]="Please fill the workflow xml field";
			
		} else {
			$ok_or_errors = self::CheckWorkflowXML($vals['workflow_xml']);
			if ($ok_or_errors !== true)
				return $ok_or_errors;
			
			if ($setvals === true){
				$this->set_xml($vals["workflow_xml"]);
			}
		}
		
		if ($setvals === true){
			$this->set_group($vals["workflow_group"]);
			$this->set_comment($vals["workflow_comment"]);
		}
		
		if ($setvals === true){
			$this->set_notifications(explode(',', $vals["workflow_notifications"]));
		}
		
		if (count($errors)>0)
			return $errors;
		
		if ($setvals === true){
			$this->CommitObject();
			
			if (isset($vals['script_path'])) {
				// create task
				$task = new Task($task_id);
				$task->set_name($task_name);
				$task->set_binary_path($vals['script_path']);
				$task->set_parameters_mode('CMDLINE');  // this does not matter, the task is not going to get any parameter from evqueue
				$task->set_output_method('TEXT');
				$task->set_workflow_id($this->id);
				$task->set_wd($vals["task_wd"]);
				$task->set_group('');
				$task->CommitObject();
			}
		}
		
		return true;
	}
	
	public static function CheckWorkflowXML ($workflow_xml) {
		libxml_use_internal_errors(true);
		$dom = new DomDocument();
		if (!$dom->loadXML($workflow_xml)) {
			$output = libxml_get_errors();
			return array('invalid-xml' => "Given XML is not valid XML: <br/><ul>".join('',array_map(function($e){return '<li>Line '.$e->line.': '.htmlspecialchars($e->message).'</li>';}, $output))."</ul>");
		}
		
		if (!$dom->schemaValidate('../xsd/workflow.xsd')) {
			$output = libxml_get_errors();
			return array('xsd-check' => "Given XML does not validate against workflow.xsd: <br/><ul>".join('',array_map(function($e){return '<li>Line '.$e->line.': '.htmlspecialchars($e->message).'</li>';}, $output))."</ul>");
		}
		
		return true;
	}
	
	public function getGeneratedXml($nodename='workflow'){
		$xml = "<$nodename id='".$this->get_id()."' name='".$this->get_name()."' group=\"".$this->get_group()."\" comment=\"".$this->get_comment()."\" has-bound-task='".($this->has_bound_task() ? 'yes' : 'no')."' bound-to-schedule='".$this->get_workflow_bound()."'>";
		$xml .= $this->get_xml();
		
		// notifications
		$xml .= '<notifications>';
		foreach ($this->notifications as $notif_id)
			$xml .= "<notification>$notif_id</notification>";
		$xml .= '</notifications>';
		
		$xml .= "</$nodename>";
		return $xml;
	}
	
	public function getXmlOnly(){
		return $this->get_xml();
	}
	
	public static function getAll($filter=false, $user_mgmt=true){
		$res = array();
		
		$clause = '';
		switch ($filter) {
			case 'only-unbound-workflows':
				$clause = 'WHERE NOT(workflow_bound)';
				break;
			
			default:
				if ($filter)
					Logger::GetInstance()->Log(LOG_WARNING,'BO_workflow.php',"Don't know about filtering on '$filter'");
		}
		
		$query = 'SELECT wf.workflow_id FROM t_workflow wf';
		$values = array();
		
		if ($user_mgmt) {
			$filter = User::FilterWorkflowsForUser($_SESSION['user_login']);
			$query .= $filter['query'];
			$values = $filter['values'];
		}
		
		$query .= " ORDER BY CASE WHEN workflow_group = '' THEN 2 ELSE 1 END, workflow_group, workflow_name ASC";
		
		$db = new DatabaseMySQL('queueing');
		$db->QueryVsPrintf($query,$values);
		
		while(($row = $db->FetchAssoc()) !== false)
			$res[] = new Workflow($row['workflow_id']);
		
		return $res;
	}
	
	public static function getAllXml($filter=false,$node_name='workflows',$user_mgmt=true){
		$workflows = Workflow::getAll($filter,$user_mgmt);
		
		$xml = "<$node_name>";
		foreach ($workflows as $workflow) {
			$xml .= $workflow->getGeneratedXml();
		}
		$xml .= "</$node_name>";
		return $xml;
	}
	
	public function delete(){
	
		if ($this->id !== false) {
			
			$this->connectDB(DatabaseMySQL::$MODE_RDRW);
			$this->db->QueryPrintf("DELETE FROM t_workflow              WHERE workflow_id = %i", $this->id);
			$this->db->QueryPrintf("DELETE FROM t_task                  WHERE workflow_id = %i", $this->id);  // delete bound task too
			$this->db->QueryPrintf("DELETE FROM t_workflow_notification WHERE workflow_id = %i", $this->id);  // detach notifications from this worflow
			
			WorkflowInstance::ReloadEvqueue();  // even if the bound task is only used by that workflow, it's cleaner to reload the tasks list still
			return true;
		}else{
			return false;
		}
	}
	
	public static function getAllGroup(){
		$res = array();
		$db = new DatabaseMySQL('queueing');
		$db->Query("SELECT DISTINCT workflow_group FROM t_workflow ORDER BY workflow_group ASC;");
		
		while(($row = $db->FetchAssoc()) !== false)
			$res[] = $row['workflow_group'];
		return $res;
	}
	
	public static function getAllGroupXml(){
		$res = Workflow::getAllGroup();
		$xml = '<groups>';
		foreach ($res as $value) {
			if($value != '')
				$xml .= "<group>$value</group>";
		}
		$xml .= "<group></group>";
		$xml .= '</groups>';
		
		return $xml;
	}
}

?>