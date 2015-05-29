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

class Notification{
	private $db;
	
	private $id;
	private $type_id;
	private $name;
	private $parameters;
	
	function __construct($id = false){
		$this->connectDB();
		
		if ($id === false or $id == ""){
			$this->id = false;
			return;
		}
		
		$this->db->QueryPrintf("SELECT * FROM t_notification WHERE notification_id = %i", $id);
		$row = $this->db->FetchAssoc();
		if(!$row)
			return false;
		
		$this->id = $row['notification_id'];
		$this->type_id = $row['notification_type_id'];
		$this->name = $row['notification_name'];
		$this->parameters = $row['notification_parameters'];		
		
	}
	
	private function connectDB ($mode = null) {
		if ($mode === null)
			$mode = DatabaseMySQL::$MODE_RDONLY;
		
		$this->db = new DatabaseMySQL ('queueing', $mode);
		return $this->db;
	}	

	public function CommitObject()
	{
		$this->connectDB(DatabaseMySQL::$MODE_RDRW);
		
		if ($this->id === false) {
			
			$this->db->QueryPrintf("
				INSERT INTO t_notification (
					notification_name, notification_type_id, notification_parameters
				) VALUES (
					%s, %i, %s
				)",	$this->name, $this->type_id, $this->parameters);
				
			$this->id = $this->db->GetInsertID();
			
		}else{
			$this->db->QueryPrintf("
					UPDATE t_notification
					SET
						notification_name = %s,
						notification_type_id = %i,
						notification_parameters = %s
					WHERE notification_id = %i
					",
					$this->name,
					$this->type_id,
					$this->parameters,
					$this->id);
		}
		
		WorkflowInstance::ReloadEvqueue();
	}
	
	public function check_values($vals, $setvals=false){
		$errors = array();
		
		if (isset($vals["id"]) && $vals["id"] != "" && $setvals === true){
			$this->id = $vals["id"];
		}
		
		if (!isset($vals["type_id"]) || !ctype_digit($vals["type_id"])){
			$errors["type_id"]="Please select a notification type";
		}else if ($setvals === true){
			$this->type_id = $vals["type_id"];
		}
		
		if (!isset($vals["name"]) || $vals["name"] == ""){
			$errors["name"]="Please fill the notification name field";
		}else if (strlen($vals['name']) > 64){
			$errors["name"]="The notification name can only be 64 characters long maximum.";
		}else if ($setvals === true){
			$this->name = $vals["name"];
		}
		
		if ($setvals === true){
			$this->parameters = $vals["parameters"];
		}
		
		if (count($errors)>0)
			return $errors;

		if ($setvals === true){
			$this->CommitObject();
		}
		
		return true;
	}
	
	public function getTypeID () {
		return $this->type_id;
	}
	
	public function getGeneratedXml(){
		$xml = "<notification id='$this->id'>";
		$xml .= "<type-id>$this->type_id</type-id>";
		$xml .= "<name>$this->name</name>";
		
		if (class_exists('NotificationParameters'))
			$xml .= NotificationParameters::deserialise_to_xml($this->parameters);
		else
			$xml .= '<parameters>'.htmlspecialchars($this->parameters).'</parameters>';
		$xml .= '</notification>';
		return $xml;
	}
	
	public static function getAll(){
		$notifs = array();
		$db = new DatabaseMySQL('queueing');
		$db->Query("SELECT notification_id FROM t_notification ORDER BY notification_type_id, notification_name ASC ;");
		
		while(($row = $db->FetchAssoc()) !== false)
			$notifs[] = new Notification($row['notification_id']);
		
		return $notifs;
	}
	
	public static function getAllXml(){
		$xml = "<notifications>";
		foreach(Notification::getAll() as $notif){
			$xml .= $notif->getGeneratedXml();
		}
		$xml .= "</notifications>";
		return $xml;
	}	
	
	public function delete(){
		if ($this->id !== false) {
			$this->connectDB(DatabaseMySQL::$MODE_RDRW);
			$this->db->QueryPrintf("DELETE FROM t_notification          WHERE notification_id = %i", $this->id);
			$this->db->QueryPrintf("DELETE FROM t_workflow_notification WHERE notification_id = %i", $this->id);  // delete references to this notification
			
			WorkflowInstance::ReloadEvqueue();
			return true;
		}else{
			return false;
		}
	}
	
}

?>