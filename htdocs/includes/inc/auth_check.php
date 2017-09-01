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
  
require_once __DIR__ . '/logger.php';
require_once __DIR__ . '/../lib/XSLEngine.php';

session_start();
require_once __DIR__ . '/evqueue.php';

if (!isset($_SESSION['user_login'])) {
	try{
		if($evqueue)
			$evqueue->Api('ping');
		$_SESSION['user_login'] = "anonymous";
		$_SESSION['user_pwd'] = "";
		$_SESSION['user_profile'] = "ADMIN";
		
		foreach($QUEUEING as $scheme){
			try{
				$evqueue_node = new evQueue($scheme);
				$evqueue_node->Api('ping');
				$node_name = $evqueue_node->GetParserRootAttributes()['NODE'];
				if(isset($nodes[$node_name]) || $node_name == '')
					throw new Exception('Node name can\'t be null and should be unique. Check your configuration.', evQueue::ERROR_ENGINE_NAME);
				$nodes[$node_name] = $scheme;
			}
			catch(Exception $e){
				if($e->getCode() == evQueue::ERROR_ENGINE_NAME)
					throw $e;
			}
		}
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
		if($evqueue)
			$evqueue->Api('ping');
	}
	catch(Exception $e){
		echo $e->getMessage();die();
	}
}

?>