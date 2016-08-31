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

session_start();
require_once 'conf/sites_base.php';
require_once 'inc/evqueue.php';

if (!isset($_SESSION['user_login'])) {
	try{
		$evqueue->Api('ping');
		$_SESSION['user_login'] = "anonymous";
		$_SESSION['user_pwd'] = "";
		$_SESSION['user_profile'] = "ADMIN";
	}
	catch(Exception $e){
		if($e->getCode() == evQueue::ERROR_AUTH_REQUIRED){
			header('Location: '.(defined('SITE_BASE')?constant('SITE_BASE'):'').'auth.php');
			session_write_close();
		}
		else{
			echo $e->getMessage();
		}
		die();
	}
}
else{
	try{
		$evqueue->Api('ping');
	}
	catch(Exception $e){
		echo $e->getMessage();die();
	}
}

?>