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
session_write_close();

$xsl = new XSLEngine();

if(isset($_POST['form_id']))
{
	// Delete
	if($_POST['form_id']=='deleteNotif')
	{
		$xml = $xsl->Api('notification','delete',['id' => $_POST['id']]);
		$simplexml = simplexml_load_string($xml);
		if($simplexml['status']!='OK')
		{
			echo "<error>".htmlspecialchars((string)$simplexml['error'])."</error>";
			die();
		}
		
		die('<ok />');
	}
	
	// Create or Edit
	if($_POST['form_id']=='saveNotif' || $_POST['form_id']=='createNotif')
	{
		if(isset($_POST['type_id']))
			$type_id = $_POST['type_id'];
		else
		{
			$xml = $xsl->Api('notification','get',['id'=>$_POST['id']]);
			$type_id = (string)simplexml_load_string($xml)->{'notification'}['type_id'];
		}
		
		$xml = $xsl->Api('notification_type','get',['id'=>$type_id]);
		$type_name = (string)simplexml_load_string($xml)->{'notification_type'}['name'];
		
		require_once '../'.$type_name.'/notification-parameters.php';  // required for access to NotificationParameters::(de)serialise()
		$parameters = new NotificationParameters();
		$errors = $parameters->check_parameters($_POST);
		
		if($errors!==true)
		{
			echo "<errors>";
			foreach($errors as $error)
				echo "<error>".htmlspecialchars($error)."</error>";
			echo "</errors>";
			die();
		}
		
		$serialized_parameters = $parameters->serialise($_POST);
		
		if(!$_POST['id'])
		{
			// Create
			$xml = $xsl->Api('notification','create',['type_id' => $type_id, 'name' => $_POST['name'], 'parameters' => $serialized_parameters]);
		}
		else
		{
			// Edit
			$xml = $xsl->Api('notification','edit',['id' => $_POST['id'],'type_id' => $type_id, 'name' => $_POST['name'], 'parameters' => $serialized_parameters]);
		}
		
		$simplexml = simplexml_load_string($xml);
		if($simplexml['status']!='OK')
		{
			echo "<error>".htmlspecialchars((string)$simplexml['error'])."</error>";
			die();
		}
		
		die('<ok />');
	}
}

if (!isset($_GET['id']) && !isset($_GET['type_id']) || !isset($_GET['action']))
	die('GET parameter(s) missing');

if(isset($_GET['type_id']))
{
	$type_id = $_GET['type_id'];
	$xml = $xsl->Api('notification_type','get',['id'=>$type_id]);
	$type_name = (string)simplexml_load_string($xml)->{'notification_type'}['name'];
}
else if(isset($_GET['id']))
{
	$xml = $xsl->Api('notification','get',['id'=>$_GET['id']]);
	$simplexml = simplexml_load_string($xml);
	$type_id = (string)$simplexml->{'notification'}['type_id'];
	$parameters_serialized = (string)$simplexml->{'notification'}['parameters'];
	$xsl->AddFragment(['response-notification' => $xml]);
	
	$xml = $xsl->Api('notification_type','get',['id'=>$type_id]);
	$type_name = (string)simplexml_load_string($xml)->{'notification_type'}['name'];
	
	require_once '../'.$type_name.'/notification-parameters.php';  // required for access to NotificationParameters::(de)serialise()
	$parameters = new NotificationParameters();
	$xsl->AddFragment($parameters->deserialise_to_xml($parameters_serialized));
}

//$notif = isset($_GET['id']) ? new Notification($_GET['id']) : null;

/*$type = new NotificationType($notif ? $notif->getTypeID() : $_GET['type_id']);
if ($type === false)
	die("Unknown notification '{$_GET['id']}'");*/


/*if ($notif) $xsl->AddFragment($notif->getGeneratedXml());*/
//$xsl->AddFragment($type->getGeneratedXml());
$xsl->DisplayXHTML('../'.$type_name.'/notification-parameters.xsl');


?>