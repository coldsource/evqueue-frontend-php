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


class Schedule{
	
	private $db;
	
	private $id;
	private $name;
	private $xml;
	
	function __construct($id = false){
		
		$this->connectDB();
		
		if ($id === false or $id == ""){
			$this->id = false;
			return;
		}

		$this->db->QueryPrintf("SELECT * FROM t_schedule WHERE schedule_id = %i", $id);
		$row = $this->db->FetchAssoc();
		if(!$row)
			return false;
		
		$this->id = $row['schedule_id'];
		$this->name = $row['schedule_name'];
		$this->xml = $row['schedule_xml'];		
		
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
	
	public function CommitObject()
	{
		$this->connectDB(DatabaseMySQL::$MODE_RDRW);
		
		if ($this->id === false) {
			
			$this->db->QueryPrintf("
					INSERT INTO t_schedule (
					schedule_name, schedule_xml
			) VALUES (
					%s,%s
			)",	$this->name, $this->xml);
				
			$this->id = $this->db->GetInsertID();
		}else{
			$this->db->QueryPrintf("
					UPDATE t_schedule
					SET
						schedule_name = %s,
						schedule_xml = %s
					WHERE schedule_id = %i
					",
					$this->name,
					$this->xml,
					$this->id);
		}
		
		WorkflowInstance::ReloadEvqueue();
	}
	
	
	public function existScheduleName($name, $id=null){
	
		if ($id == null){
			$this->db->QueryPrintf("SELECT * FROM t_schedule WHERE schedule_name = %s ;",$name);
		}else{
			$this->db->QueryPrintf("SELECT * FROM t_schedule WHERE schedule_name = %s and schedule_id != %i  ;",$name,$id);
		}
	
		if ($this->db->NumRows() > 0){
			return true;
		}else{
			return false;
		}
	}	
	
	public function check_values($vals, $setvals=false){
		$errors = array();
		
		if (isset($vals["schedule_id"]) && $vals["schedule_id"] != ""){
			$scheduleid = $vals["schedule_id"];
		}else{
			$scheduleid = null;
		}		
		
		if (isset($vals["schedule_id"]) && $vals["schedule_id"] != "" && $setvals === true){
			$this->set_id($vals["schedule_id"]);
		}

		if (!isset($vals["schedule_name"]) || $vals["schedule_name"] == ""){
			$errors["schedule_name"]="Please fill the schedule name field";
		}else if($this->existScheduleName($vals["schedule_name"],$scheduleid)){
			$errors["schedule_name"]="A schedule has already the same name. Please change your schedule name.";
		}else if (!preg_match('/^[0-9a-zA-Z-_]+$/',$vals["schedule_name"])){
			$errors["schedule_name"]="The schedule name can only have letters, numbers and dashes. Please change your schedule name.";
		}else{
			if ($setvals === true){
				$this->set_name($vals["schedule_name"]);
			}
		}
		
		if (!isset($vals["schedule_xml"]) || $vals["schedule_xml"] == ""){
			$errors["schedule_xml"]="Please fill the schedule xml field";
		}else{
			$ok_or_errors = self::CheckXML($vals['schedule_xml']);
			if ($ok_or_errors !== true)
				return $ok_or_errors;
			
			if ($setvals === true){
				$this->set_xml($vals["schedule_xml"]);
			}
		}

		if (count($errors)>0)
			return $errors;

		if ($setvals === true){
			$this->CommitObject();
		}
		
		return true;
	}
	
	public static function CheckXML ($schedule_xml) {
		libxml_use_internal_errors(true);
		$dom = new DomDocument();
		if (!$dom->loadXML($schedule_xml)) {
			$output = libxml_get_errors();
			return array('invalid-xml' => "Given XML is not valid XML: <br/><ul>".join('',array_map(function($e){return '<li>Line '.$e->line.': '.htmlspecialchars($e->message).'</li>';}, $output))."</ul>");
		}
		
		$fh = fopen('../xsd/retry-schedule.xsd','r',true);
		$xsd = stream_get_contents($fh);
		fclose($fh);
		
		if (!$dom->schemaValidateSource($xsd)) {
			$output = libxml_get_errors();
			return array('xsd-check' => "Given XML does not validate against retry-schedule.xsd: <br/><ul>".join('',array_map(function($e){return '<li>Line '.$e->line.': '.htmlspecialchars($e->message).'</li>';}, $output))."</ul>");
		}
		
		return true;
	}
	
	public function getGeneratedXml(){
		return '<schedule id="'.$this->get_id().'">'.$this->get_xml().'</schedule>';
	}
	
	public static function getAll(){
		$res = array();
		$db = new DatabaseMySQL('queueing');
		$db->Query("SELECT * FROM t_schedule ORDER BY schedule_name ASC ;");
		
		while(($row = $db->FetchAssoc()) !== false){
			$res[]=$row;
		}
		return $res;
	}
	
	public static function getAllXml(){
		$res = Schedule::getAll();
	
		$xml = "<schedules>";
		for($i=0;$i<count($res);$i++){
			$xml .= '<schedule id="'.$res[$i]["schedule_id"].'">';
			$xml .= '<schedule_name>'.$res[$i]["schedule_name"].'</schedule_name>';
			$xml .= '<schedule_xml>'.$res[$i]["schedule_xml"].'</schedule_xml>';
			$xml .= "</schedule>";
		}
		$xml .= "</schedules>";
		return $xml;
	}	
	
	public function delete(){
	
		if ($this->id !== false) {
	
			$this->connectDB(DatabaseMySQL::$MODE_RDRW);
			$this->db->QueryPrintf("
					DELETE FROM t_schedule
					WHERE schedule_id = %i
					",
					$this->id);
			return true;
		}else{
			return false;
		}
	}
	
}

?>