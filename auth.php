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


require_once 'conf/sites_base.php';
require_once 'inc/logger.php';
require_once 'lib/XSLEngine.php';
require_once 'lib/DatabaseMySQL.php';
require_once 'bo/BO_user.php';

if(!isset($DATABASES_CONFIG['queueing']))
{
	// Not yet configured
	header('Location: install.php');
	die();
}

if (isset($_GET['action']))
	switch ($_GET['action']) {
		case 'logout':
			@session_start();
			$sessionName = session_name();
			$sessionCookie = session_get_cookie_params();
			session_destroy();
			setcookie($sessionName, false, $sessionCookie['lifetime'], $sessionCookie['path'], $sessionCookie['domain'], $sessionCookie['secure']);
			break;
	}


$xsl = new XSLEngine();

if (isset($_POST['login']) && isset($_POST['password'])) {
	$db = new DatabaseMySQL('queueing');
	$db->QueryPrintf('
		SELECT user_login, user_profile
		FROM t_user
		WHERE user_login = %s
			AND user_password = %s
	',
					$_POST['login'],
					sha1($_POST['password'])
	);
	
	if ($db->NumRows() == 1) {
		list($user,$profile) = $db->FetchArray();
		
		@session_start();
		$_SESSION['user_login'] = $user;
		$_SESSION['user_profile'] = $profile;
		session_write_close();
		header('Location: index.php');
		die();
		
	} else {
		$xsl->AddError('wrong-creds');
	}
}


$xsl->DisplayXHTML('xsl/auth.xsl');


?>