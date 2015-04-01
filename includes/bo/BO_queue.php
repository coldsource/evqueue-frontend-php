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

class Queue{
	
	private $db;
	
	private $id;
	private $name;
	private $concurrency;
	
	function __construct($id = false){
		
		$this->connectDB();
		
		if ($id === false or $id == ""){
			$this->id = false;
			return;
		}

		$this->db->QueryPrintf("SELECT * FROM t_queue WHERE queue_id = %i", $id);
		$row = $this->db->FetchAssoc();
		if(!$row)
			return false;
		
		$this->id = $row['queue_id'];
		$this->name = $row['queue_name'];
		$this->concurrency = $row['queue_concurrency'];		
		
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
	
	public function set_concurrency($concurrency){
		$this->concurrency = $concurrency;
	}
	
	public function get_concurrency(){
		return $this->concurrency;
	}
	
	public function CommitObject()
	{
		$this->connectDB(DatabaseMySQL::$MODE_RDRW);
		
		if ($this->id === false) {
			
			$this->db->QueryPrintf("
					INSERT INTO t_queue (
					queue_name, queue_concurrency
			) VALUES (
					%s,%s
			)",	$this->name, $this->concurrency);
				
			$this->id = $this->db->GetInsertID();
		}else{
			
			$this->db->QueryPrintf("SELECT queue_name FROM t_queue WHERE queue_id = %i", $this->id);
			list($previous_queue_name) = $this->db->FetchArray();
			
			if ($previous_queue_name == 'default' && $this->name != 'default')
				return array('forbidden'=>"Can't change default queue's name");
			
			$this->db->QueryPrintf("
					UPDATE t_queue
					SET
						queue_name = %s,
						queue_concurrency = %s
					WHERE queue_id = %i
					",
					$this->name,
					$this->concurrency,
					$this->id);
		}
	}
	
	public function existQueueName($name, $id=null){
	
		if ($id == null){
			$this->db->QueryPrintf("SELECT * FROM t_queue WHERE queue_name = %s ;",$name);
		}else{
			$this->db->QueryPrintf("SELECT * FROM t_queue WHERE queue_name = %s and queue_id != %i  ;",$name,$id);
		}
	
		if ($this->db->NumRows() > 0){
			return true;
		}else{
			return false;
		}
	}	
	
	public function check_values($vals, $setvals=false){
		$errors = array();
		
		if (isset($vals["queue_id"]) && $vals["queue_id"] != ""){
			$queueid = $vals["queue_id"];
		}else{
			$queueid = null;
		}		
		
		if (isset($vals["queue_id"]) && $vals["queue_id"] != "" && $setvals === true){
			$this->set_id($vals["queue_id"]);
		}

		if (!isset($vals["queue_name"]) || $vals["queue_name"] == ""){
			$errors["queue_name"]="Please fill the queue name field";
		}else if($this->existQueueName($vals["queue_name"],$queueid)){
			$errors["queue_name"]="A queue has already the same name. Please change your queue's name.";
		}else if (!preg_match('/^[0-9a-zA-Z-_]+$/',$vals["queue_name"])){
			$errors["queue_name"]="The queue name can only have letters, numbers and dashes. Please change your queue's name.";
		}else if ($setvals === true){
			$this->set_name($vals["queue_name"]);
		}
		
		if (!isset($vals["queue_concurrency"]) || $vals["queue_concurrency"] == ""){
			$errors["queue_concurrency"]="Please fill the queue concurrency field";
		}else{
			if (!is_numeric($vals["queue_concurrency"])){
				$errors["queue_concurrency"]="Queue concurrency must be integer";
			}else{
				if ($setvals === true){
					$this->set_concurrency(intval($vals["queue_concurrency"]));
				}
			}
		}

		if (count($errors)>0)
			return $errors;

		if ($setvals === true){
			$this->CommitObject();
		}
		
		return true;
	}
	
	public function getGeneratedXml(){
		$xml = '<queue id="'.$this->get_id().'">';
		$xml .= '<queue_name>'.$this->get_name().'</queue_name>';
		$xml .= '<queue_concurrency>'.$this->get_concurrency().'</queue_concurrency>';
		$xml .= '</queue>';
		return $xml;
	}
	
	public static function getAll(){
		$res = array();
		$db = new DatabaseMySQL('queueing');
		$db->Query("SELECT * FROM t_queue ORDER BY queue_name ASC ;");
		
		while(($row = $db->FetchAssoc()) !== false){
			$res[]=$row;
		}
		return $res;
	}
	
	public static function getAllXml(){
		$res = Queue::getAll();
	
		$xml = "<queues>";
		for($i=0;$i<count($res);$i++){
			$xml .= '<queue id="'.$res[$i]["queue_id"].'">';
			$xml .= '<queue_name>'.$res[$i]["queue_name"].'</queue_name>';
			$xml .= '<queue_concurrency>'.$res[$i]["queue_concurrency"].'</queue_concurrency>';
			$xml .= "</queue>";
		}
		$xml .= "</queues>";
		return $xml;
	}	
	
	public function delete(){
		if ($this->id !== false) {
			
			if ($this->name == 'default')
				return array('forbidden'=>"Can't delete default queue");
			
			$this->connectDB(DatabaseMySQL::$MODE_RDRW);
			$this->db->QueryPrintf("
					DELETE FROM t_queue
					WHERE queue_id = %i
					",
					$this->id);
			return true;
		}else{
			return false;
		}
	}
	
}

?>