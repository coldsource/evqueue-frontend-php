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

require_once 'inc/auth_check.php';
require_once 'inc/logger.php';
require_once 'lib/XSLEngine.php';
require_once 'lib/DatabaseMySQL.php';
require_once 'bo/BO_user.php';
require_once 'bo/BO_workflow.php';


$xsl = new XSLEngine();


if (isset($_POST['action'])) {
	switch ($_POST['action']) {
		case 'chpwd':
			
			if (strlen($_POST['password']) < 8) {
				$xsl->AddError('pwd-too-short');
			
			} else if ($_POST['password'] != $_POST['password2']) {
				$xsl->AddError('pwd-confirm-wrong');
			
			} else {
				$db = new DatabaseMySQL('queueing', DatabaseMySQL::$MODE_RDRW);
				$db->QueryPrintf('
					SELECT user_login, user_profile
					FROM t_user
					WHERE user_login = %s
						AND user_password = %s
				',
								$_SESSION['user_login'],
								sha1($_POST['current_password'])
				);

				if ($db->NumRows() == 1) {
					$db->QueryPrintf("
						UPDATE t_user
						SET user_password = %s
						WHERE user_login = %s
					",
									sha1($_POST['password']),
									$_SESSION['user_login']
					);

				} else {
					$xsl->AddError('chpwd-wrong-creds');
				}
			}
			
			break;
		
		case 'editRights':
			$rights = array();
			
			foreach ($_POST['rights'] as $right) {
				preg_match('/^(edit|read|exec|kill|del)(\d+)$/', $right, $m);
				list($m, $action, $wfid) = $m;
				
				$rights[$wfid][$action] = 1;
			}
			
			$user = new User($_POST['login']);
			$user->SetRights($rights);
			$user->CommitObject();
			
			break;
	}
}


$user = new User($_GET['user_login']);
$xsl->AddFragment($user->getXML());

$xsl->AddFragment(Workflow::getAllXml());

$xsl->AddPrivateFragment('<rights><right action="edit" /><right action="read" /><right action="exec" /><right action="kill" /><right action="del" /></rights>');


$xsl->DisplayXHTML('xsl/manage_user.xsl');


?>