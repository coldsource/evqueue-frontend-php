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

//sleep(2);

if(isset($_POST['group'])){
	$action = isset($_POST['action']) ? $_POST['action']:false;
	$attributes = isset($_POST['attributes']) ? $_POST['attributes']:[];
	$parameters = isset($_POST['parameters']) ? $_POST['parameters']:[];
	
	header('content-type: text/xml');
	
	try
	{
		$xml = $evqueue->Api($_POST['group'], $action, $attributes, $parameters);
	}
	catch(Exception $e)
	{
		echo "<error>".htmlspecialchars($e->getMessage())."</error>";
		die(-1);
	}
	echo $xml;
}