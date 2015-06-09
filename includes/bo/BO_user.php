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


class User {
	
	private $db;
	private $mode;
	
	private $id;
	private $password;
	private $profile;
	private $rights;
	
	
	function __construct($id = false){
		$this->connectDB();
		
		$this->rights = array();
		
		if ($id === false or $id == ""){
			$this->id = false;
			$this->mode = 'CREATION';
			return;
		}
		$this->mode = 'EDITION';
		
		$this->db->QueryPrintf("SELECT * FROM t_user WHERE user_login = %s", $id);
		$row = $this->db->FetchAssoc();
		if(!$row)
			return false;
		
		$this->id = $row['user_login'];
		$this->profile = $row['user_profile'];
		
		$this->db->QueryPrintf("SELECT * FROM t_user_right ur inner join t_workflow wf on wf.workflow_id = ur.workflow_id WHERE user_login = %s", $id);
		while ($row = $this->db->FetchAssoc())
			$this->rights[$row['workflow_id']] = array(
					'name' => $row['workflow_name'],
					'edit' => $row['user_right_edit'],
					'read' => $row['user_right_read'],
					'exec' => $row['user_right_exec'],
					'kill' => $row['user_right_kill'],
					'del'  => $row['user_right_del'],
			);
	}
	
	private function connectDB ($mode = null) {
		if ($mode === null)
			$mode = DatabaseMySQL::$MODE_RDONLY;
		
		$this->db = new DatabaseMySQL ('queueing', $mode);
		return $this->db;
	}
	
	public static function UserExists ($login) {
		$db = new DatabaseMySQL('queueing');
		$db->QueryPrintf('SELECT * FROM t_user WHERE user_login = %s', $login);
		return $db->NumRows() > 0;
	}
	
	public function check_values($vals, $setvals=false){
		$errors = array();
		
		/***** LOGIN (upon creation only) *****/
		if ($vals['action'] == 'createUser') {
			if (!isset($vals['login']) || !preg_match('/^\w{1,32}$/',$vals['login'])){
				$errors['invalid-login'] = 'The user login should be composed of alpha-numeric characters and underscores only, and have a max length of 32 characters';

			} else if (self::UserExists($vals['login'])) {
				$errors['user-already-exists'] = 'This user login already exists, please choose another one';

			} else if ($setvals === true) {
				$this->id = $vals['login'];
			}
		}
		
		/***** PROFILE (upon creation only) *****/
		if ($vals['action'] == 'createUser') {
			if (!isset($vals['profile']) || !in_array($vals['profile'],array('ADMIN','REGULAR_EVERYDAY_NORMAL_GUY'))){
				$errors['invalid-profile'] = "Please fill the notification name field";

			} else if ($setvals === true) {
				$this->profile = $vals['profile'];
			}
		}
		
		/***** PASSWORD (upon creation or pass change) *****/
		if (in_array($vals['action'],array('createUser','chpwd'))) {
			
			if (strlen($vals['password']) < 8)
				$errors['pwd-too-short'] = 'Password must be at least 8 characters long';
			
			if ($vals['password'] != $vals['password2'])
				$errors['pwd-confirm-wrong'] = "New passwords don't match";
			
			if ($vals['action'] == 'chpwd') {
				$this->db->QueryPrintf('
					SELECT user_login, user_profile
					FROM t_user
					WHERE user_login = %s
						AND user_password = %s
				',
								$vals['login'],
								sha1($vals['current_password'])
				);
				
				if ($this->db->NumRows() != 1)
					$errors['chpwd-wrong-creds'] = 'There was an error editing your password. Wrong current password given?';
			}
			
			if (count($errors) == 0 && $setvals ===true)
				$this->password = $vals['password'];
		}
		
		/***** RIGHTS (upon creation or rights change) *****/
		if (in_array($vals['action'],array('createUser','editRights')))
			$this->SetRights(isset($vals['rights']) ? $vals['rights'] : array());
		
		
		if (count($errors)>0)
			return $errors;

		if ($setvals === true)
			$this->CommitObject();
		
		return true;
	}
	
	public function SetRights ($rights) {
		if ($this->profile == 'ADMIN')
			return;
			
		$this->rights = $rights;
	}
	
	public function CheckRights ($params) {
		if ($this->profile == 'ADMIN')
			return true;
		
		// For non-admins:
		switch ($params['form_id']) {
			case "formTask":
			case "formQueue":
			case "formSchedule":
			case 'formWorkflowSchedule':
			case "deleteTask":
			case "deleteWorkflow":
			case "deleteQueue":
			case "deleteSchedule":
			case "deleteWorkflowSchedule":
			case 'resetStats':
			case 'saveNotif':
				return false;
			
			case "formWorkflow":
				return isset($this->rights[$params['workflow_id']]['edit']) && $this->rights[$params['workflow_id']]['edit'] == 1;
				
			case "deleteWFI":
				$wfi = new WorkflowInst($_POST['id']);
				$wf = $wfi->get_workflow_id();
				return isset($this->rights[$wf]['del']) && $this->rights[$wf]['del'] == 1;
			
			case "stopWFI":
			case 'killTask':
				$wfi = new WorkflowInst($_POST['id']);
				$wf = $wfi->get_workflow_id();
				return isset($this->rights[$wf]['kill']) && $this->rights[$wf]['kill'] == 1;
			
			case 'launchWorkflow':
				$id = null;
				if (is_numeric($params['id'])) {
					$wfi_bo = new WorkflowInst($params['id']);
					$id = $wfi_bo->get_workflow_id();
					
				} else {
					$id = Workflow::GetIDFromName($params['id']);
				}
				
				return $id !== false && isset($this->rights[$id]['exec']) && $this->rights[$id]['exec'] == 1;
			
			default:
				Logger::GetInstance()->Log(LOG_ERR,'BO_user.php',"Dunno how to check rights for {$params['form_id']}");
		}
		
		return true;
	}
	
	public function CommitObject()
	{
		$this->connectDB(DatabaseMySQL::$MODE_RDRW);
		
		if ($this->mode == 'CREATION') {
			$this->db->QueryPrintf('INSERT INTO t_user (user_login,user_password,user_profile) VALUES (%s,SHA1(%s),%s)', $this->id, $this->password, $this->profile);
		}else{
			$this->db->QueryPrintf('UPDATE t_user SET user_password = SHA1(%s) WHERE user_login = %s', $this->password, $this->id);
		}
		
		// user rights
		$this->db->QueryPrintf('DELETE FROM t_user_right WHERE user_login = %s', $this->id);
		
		foreach ($this->rights as $wfid => $rights) {
			$this->db->QueryPrintf('
				INSERT INTO t_user_right
					(user_login, workflow_id, user_right_edit, user_right_read, user_right_exec, user_right_kill, user_right_del)
				VALUES
					(%s, %i, %i, %i, %i, %i, %i)
				',
							$this->id,
							$wfid,
							(isset($rights['edit']) && $rights['edit'] == 1) ? 1 : 0,
							(isset($rights['read']) && $rights['read'] == 1) ? 1 : 0,
							(isset($rights['exec']) && $rights['exec'] == 1) ? 1 : 0,
							(isset($rights['kill']) && $rights['kill'] == 1) ? 1 : 0,
							(isset($rights['del'])  && $rights['del']  == 1) ? 1 : 0
			);
		}
		
		WorkflowInstance::ReloadEvqueue();
	}
	
	public function GetProfile () {
		return $this->profile;
	}
	
	public function GetRights () {
		return $this->rights;
	}
	
	public function getXML ($node_name='user') {
		$xml = "<$node_name login='$this->id' profile='$this->profile'>";
		foreach ($this->rights as $wfid => $rights) {
			$xml .= "<workflow wfid='$wfid' wfname='{$rights['name']}'>";
			unset($rights['name']);
			
			foreach ($rights as $action => $bool)
				$xml .= "<right action='$action'>$bool</right>";
			$xml .= '</workflow>';
		}
		$xml .= "</$node_name>";
		return $xml;
	}
	
	public static function getAllXML(){
		$xml = '<users>';
		
		$db = new DatabaseMySQL('queueing');
		$db->Query('SELECT user_login FROM t_user');
		
		while (list($login) = $db->FetchArray()) {
			$user = new User($login);
			$xml .= $user->getXML();
		}
		
		return "$xml</users>";
	}
	
	public static function FilterWorkflowsForUser ($user_login) {
		if ($_SESSION['user_profile'] == 'ADMIN')  // admin have super rights on super everything
			return array('query'=>'', 'values'=>array());
		
		return array(
			'query' => "
				INNER JOIN t_user_right ur
				ON ur.workflow_id = wf.workflow_id
				AND user_right_read = 1
				AND user_login = %s
			",
			'values' => array($user_login),
		);
	}
}

?>