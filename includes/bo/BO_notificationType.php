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

class NotificationType {
	private $db;
	
	private $id;
	private $name;
	private $description;
	private $binary;
	
	function __construct($id = false){
		$this->connectDB();
		
		if ($id === false or $id == ""){
			$this->id = false;
			return false;
		}
		
		$this->db->QueryPrintf("SELECT * FROM t_notification_type WHERE notification_type_id = %i", $id);
		$row = $this->db->FetchAssoc();
		
		if(!$row)
			return false;
		
		$this->id = $row['notification_type_id'];
		$this->name = $row['notification_type_name'];
		$this->description = $row['notification_type_description'];
		$this->binary = $row['notification_type_binary'];
		
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
				INSERT INTO t_notification_type (
					notification_type_name, notification_type_description, notification_type_binary
				) VALUES (
					%s, %s, %s
				)",	$this->name, $this->description, $this->binary);
				
			$this->id = $this->db->GetInsertID();
			
		}else{
			$this->db->QueryPrintf("
					UPDATE t_notification_type
					SET
						notification_type_name = %s,
						notification_type_description = %s,
						notification_type_binary = %s
					WHERE notification_type_id = %i
					",
					$this->name,
					$this->description,
					$this->binary,
					$this->id);
		}
	}
	
	public function check_values($vals, $setvals=false){
		$errors = array();
		
		if (isset($vals["notification_type_id"]) && $vals["notification_type_id"] != "" && $setvals === true){
			$this->id = $vals["notification_type_id"];
		}
		
		if (!isset($vals["notification_type_name"]) || $vals["notification_type_name"] == ""){
			$errors["notification_type_name"] = "Please fill the notification type name field";
		}else if (strlen($vals['notification_type_name']) > 32){
			$errors["notification_type_name"] = "The notification type name can only be 32 characters long maximum.";
		}else if ($setvals === true){
			$this->name = $vals["notification_type_name"];
		}
		
		if ($setvals === true){
			$this->description = $vals["notification_type_description"];
		}
		
		if (!isset($vals["notification_type_binary"]) || $vals["notification_type_binary"] == ""){
			$errors["notification_type_binary"] = "Please fill the notification type binary field";
		}else if (strlen($vals['notification_type_binary']) > 128){
			$errors["notification_type_binary"] = "The notification type binary can only be 128 characters long maximum.";
		}else if ($setvals === true){
			$this->binary = $vals["notification_type_binary"];
		}
		
		if (count($errors)>0)
			return $errors;

		if ($setvals === true){
			$this->CommitObject();
		}
		
		return true;
	}
	
	public function getName () {
		return $this->name;
	}
	
	public function getBinary () {
		return $this->binary;
	}
	
	public function getGeneratedXml(){
		$xml = "<notification-type id='$this->id'>";
		$xml .= '<name>'.htmlspecialchars($this->name).'</name>';
		$xml .= '<description>'.htmlspecialchars($this->description).'</description>';
		$xml .= '<binary>'.htmlspecialchars($this->binary).'</binary>';
		return "$xml</notification-type>";
	}
	
	public static function getAll(){
		$notifs = array();
		$db = new DatabaseMySQL('queueing');
		$db->Query("SELECT notification_type_id FROM t_notification_type ORDER BY notification_type_name ASC ;");
		
		while(($row = $db->FetchAssoc()) !== false)
			$notifs[] = new NotificationType($row['notification_type_id']);
		
		return $notifs;
	}
	
	public static function getAllXml(){
		$xml = "<notification-types>";
		foreach(self::getAll() as $type){
			$xml .= $type->getGeneratedXml();
		}
		$xml .= "</notification-types>";
		return $xml;
	}
	
	public function delete(){
		if ($this->id !== false) {
			$this->connectDB(DatabaseMySQL::$MODE_RDRW);
			$this->db->QueryPrintf('SELECT notification_id FROM t_notification WHERE notification_type_id = %i', $this->id);
			
			while (list($notif_id) = $this->db->FetchArray()) {
				$notif = new Notification($notif_id);
				$notif->delete();  // this will delete appropriate entries from t_notification and t_workflow_notification
			}
			
			$this->db->QueryPrintf("DELETE FROM t_notification_type WHERE notification_type_id = %i", $this->id);
			return true;
		}else{
			return false;
		}
	}
	
}

?>