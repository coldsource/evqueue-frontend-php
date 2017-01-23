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


$xsl = new XSLEngine();

if(isset($_GET['action']))
	$_POST = $_GET;

if(isset($_POST['action'])) {
	try
	{
		if($_POST['action']=='createUser')
		{
			if($_POST['password']!=$_POST['password2'])
				$xsl->AddError("Passwords do not match");

			if(!$xsl->HasError())
				$xsl->Api('user','create',['name'=>$_POST['login'], 'password'=>$_POST['password'], 'profile'=>$_POST['profile']]);
		}
		elseif($_POST['password']!='')
		{
			$xsl->Api('user','change_password',['name'=>$_POST['login'], 'password'=>$_POST['password']]);
		}

		if(!$xsl->HasError() && ($_POST['action']=='createUser' || $_POST['action']=='editRights'))
		{
			$rights = array();
			if (isset($_POST['rights'])) {
				foreach ($_POST['rights'] as $right) {
					preg_match('/^(edit|read|exec|kill)(\d+)$/', $right, $m);
					list($m, $action, $wfid) = $m;

					$rights[$wfid][$action] = 1;
				}
			}


			foreach($rights as $wfid=>$wf_rights)
			{
				$xsl->Api('user', 'grant', [
					'name' => $_POST['login'],
					'workflow_id'=> $wfid,
					'edit' => (isset($wf_rights['edit']) && $wf_rights['edit'])?'yes':'no',
					'read' => (isset($wf_rights['read']) && $wf_rights['read'])?'yes':'no',
					'exec' => (isset($wf_rights['exec']) && $wf_rights['exec'])?'yes':'no',
					'kill' => (isset($wf_rights['kill']) && $wf_rights['kill'])?'yes':'no',
				]);
			}
		}

		if(!$xsl->HasError())
		{
			header('Location: list-users.php');
			die();
		}
	}
	catch(Exception $e) {}
}

if(isset($_GET['user_login']))
{
	$xml = $xsl->Api('user', 'get', ['name' => $_GET['user_login']]);
	$xsl->AddFragment(['response-user' => $xml]);
}

$xml = $xsl->Api("workflows", "list");
$xsl->AddFragment(["workflows" => $xml]);

$xsl->DisplayXHTML('xsl/manage_user.xsl');
?>
