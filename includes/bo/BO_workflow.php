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
require_once 'bo/BO_task.php';
require_once 'conf/queueing.php';


class Workflow{
	
	const WORKFLOW_IMPORT_EXPORT_VERSION = 1.4;
	
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
		$this->notifications = array();
		
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
		return true;
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
			$errors["workflow_name"]="A workflow has already the same name '{$vals["workflow_name"]}'. Please change your workflow name.";
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
		
		if (isset($vals["workflow_notifications"]) && $setvals === true){
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
		
		$fh = fopen('xsd/workflow.xsd','r',true);
		$xsd = stream_get_contents($fh);
		fclose($fh);
		
		if (!$dom->schemaValidateSource($xsd)) {
			$output = libxml_get_errors();
			return array('xsd-check' => "Given XML does not validate against workflow.xsd: <br/><ul>".join('',array_map(function($e){return '<li>Line '.$e->line.': '.htmlspecialchars($e->message).'</li>';}, $output))."</ul>");
		}
		
		return true;
	}
	
	public function getGeneratedXml($nodename='workflow'){
		$xml = "<$nodename id='$this->id' name='".htmlspecialchars($this->get_name())."'
						group=\"".htmlspecialchars($this->get_group())."\" comment=\"".htmlspecialchars($this->get_comment())."\" has-bound-task='".($this->has_bound_task() ? 'yes' : 'no')."' bound-to-schedule='".$this->get_workflow_bound()."'>";
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
	
	
	public function Export ($filename) {
		global $QUEUEING;
		
		$zip = new ZipArchive();
		$zip->open($filename, ZipArchive::CREATE);  // TODO: test if it worked
		
		// ADD WORKFLOW XML DEFINITION, AS-IS
		$zip->addFromString('workflow.xml', $this->xml);
		
		$manifest = new DOMDocument();
		$manifest->encoding = 'UTF-8';
		
		// CREATE A MANIFEST FILE CONTAINING BASIC WORKFLOW INFORMATION...
		$manifest->appendChild($manifest->createElement('workflow'));
		$manifest->documentElement->setAttribute('name', $this->name);
		$manifest->documentElement->setAttribute('export-version', self::WORKFLOW_IMPORT_EXPORT_VERSION);
		
		$manifest->documentElement->appendChild($manifest->createElement('comment'))->appendChild($manifest->createTextNode($this->comment));
		$manifest->documentElement->appendChild($manifest->createElement('group'))->appendChild($manifest->createTextNode($this->group));
		
		$wf = new DOMDocument();
		$wf->loadXML($this->xml);
		$wfx = new DOMXPath($wf);
		
		// ... AND THE COMPREHENSIVE LIST OF TASKS
		$tasks = $manifest->createElement('tasks');
		$manifest->documentElement->appendChild($tasks);
		
		foreach ($wfx->query('//task') as $t) {
			$name = $t->getAttribute('name');
			$id = Task::existsTaskName($name);
			if ($id === false)
				return array("There is no task named '$name'");
			
			$bo_task = new Task($id);
			$binary = $bo_task->get_binary_path();
			if (strpos($binary,'/') === 0) {
				// "system task" (ls, ps, wc, cat...), nothing to export, the task should be present on the system for the workflow to run
			} else {
				// specific, user-defined task: we package it with the workflow so it can be run anywhere else
				$bin = WorkflowInstance::GetTaskFile($binary,array_keys($QUEUEING)[0]);
				if ($bin === false)
					return array("I can't get the binary $binary. EvQueue not running?");
				$zip->addFromString($binary,$bin);
			}
			
			$taskdom = new DOMDocument();
			$taskdom->loadXML($bo_task->getGeneratedXml());
			
			$tasks->appendChild($manifest->importNode($taskdom->documentElement,true));
		}
		
		$zip->addFromString('manifest.xml', $manifest->saveXML());
		
		$zip->close();
		return true;
	}
	
	
	public static function Import ($zip_filename) {
		$errors = array();
		
		$zip = new ZipArchive();
		$zip->open($zip_filename);
		
		$manifest = new DOMDocument();
		if (!@$manifest->loadXML($zip->getFromName('manifest.xml')))
			$errors[] = array('File manifest.xml was not found or is not valid XML');
		
		$manifest = new DOMXPath($manifest);
		
		$export_version = $manifest->evaluate('number(/workflow/@export-version)');
		if (!is_numeric($export_version))
			$errors[] = array("Can't find the version with which the workflow was exported");
		
		if (empty($errors)) {
			switch ($export_version) {
				case 1.4:
					$errors = self::import_v1_4($zip,$manifest);
					break;

				default:
					$errors = array("Can't import workflow, export version $export_version is unknown (current version is ".self::WORKFLOW_IMPORT_EXPORT_VERSION.")");
					break;
			}
		}
		
		$zip->close();
		return ($errors === true || empty($errors)) ? true : $errors;
	}
	
	private static function import_v1_4 (ZipArchive $zip,$manifest) {
		
		// CHECK WORKFLOW
		$wfxml = new DomDocument();
		if (!@$wfxml->loadXML($zip->getFromName('workflow.xml')))
			return array('File workflow.xml was not found or is not valid XML');
		
		$workflow_params = array(
				'workflow_id' => false,
				'workflow_name' => $manifest->evaluate('string(/workflow/@name)'),
				'workflow_xml' => $zip->getFromName('workflow.xml'),
				'workflow_group' => $manifest->evaluate('string(/workflow/group)'),
				'workflow_comment' => $manifest->evaluate('string(/workflow/comment)'),
		);
		
		$workflow = new Workflow();
		$ret = $workflow->check_values($workflow_params);
		if ($ret !== true)
			return $ret;
		
		// CHECK TASKS
		$tasks = array();
		foreach ($manifest->query('/workflow/tasks/task') as $task) {
			$binary = $manifest->evaluate('string(task_binary)',$task);
			
			$task_params = array(
					'task_name' => $manifest->evaluate('string(task_name)',$task),
					'task_user' => $manifest->evaluate('string(task_user)',$task),
					'task_host' => $manifest->evaluate('string(task_host)',$task),
					'task_binary_path' => $binary,
					'task_parameters_mode' => $manifest->evaluate('string(task_parameters_mode)',$task),
					'task_output_method' => $manifest->evaluate('string(task_output_method)',$task),
					'task_wd' => $manifest->evaluate('string(task_wd)',$task),
					'task_xsd' => $manifest->evaluate('string(task_xsd)',$task),
					'task_group' => $manifest->evaluate('string(task_group)',$task),
			);
			
			if (substr($binary,0,1) != '/') {
				$task_params['binary_content'] = $zip->getFromName($binary);
				if ($task_params['binary_content'] === false)
					return array('binary-not-found',"The file '$binary' was not found in the workflow archive, not installing");
			}
			
			if (Task::TaskExists($task_params))
				continue;  // we don't have to create it!
			
			$task = new Task();
			$ret = $task->check_values($task_params);
			if ($ret !== true)
				return $ret;
			
			$tasks[] = array('bo'=>$task,'params'=>$task_params);
		}
		
		// ACTUALLY CREATE (not existing) TASKS AND WORKFLOW
		$tasks_to_rollback = array();
		foreach ($tasks as $task) {
			$task['bo']->check_values($task['params'], true);
			$ret = $task['bo']->CommitObject();
			if ($ret !== true) {
				self::rollback_v1_4($tasks_to_rollback);
				return $ret;
			}
			$tasks_to_rollback[] = $task;
		}
		
		$workflow->check_values($workflow_params, true);
		$workflow->CommitObject();
		return true;
	}
	
	private static function rollback_v1_4 ($tasks_to_rollback) {
		foreach ($tasks_to_rollback as $task)
			$task['bo']->delete();
	}
	
}

?>