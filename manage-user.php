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


if (isset($_POST['action'])) {
	
	if (isset($_POST['rights'])) {
		$rights = array();
		foreach ($_POST['rights'] as $right) {
			preg_match('/^(edit|read|exec|kill|del)(\d+)$/', $right, $m);
			list($m, $action, $wfid) = $m;

			$rights[$wfid][$action] = 1;
		}
		$_POST['rights'] = $rights;
	}
	
	// Force posted login to session login while editing one's password
	if ($_POST['action'] == 'chpwd')
		$_POST['login'] = $_SESSION['user_login'];
	
	$user = new User($_POST['action']=='createUser' ? false : $_POST['login']);
	$errors = $user->check_values($_POST,true);
	
	if ($errors === true) {
		header('Location: list-users.php');
		die();
	} else {
		$xsl->AddErrors($errors);
	}
}

$xml = $evqueue->Api('user', 'get', ['name' => $_GET['user_login']]);
$xsl->AddFragment(['response-user' => $xml]);

$xml = $evqueue->Api("workflows", "list");
$xsl->AddFragment(["workflows" => $xml]);

$xsl->AddFragment('<rights><right action="edit" /><right action="read" /><right action="exec" /><right action="kill" /></rights>');


$xsl->DisplayXHTML('xsl/manage_user.xsl');


?>