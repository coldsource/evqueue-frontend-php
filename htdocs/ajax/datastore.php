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
  * Authors: Thibault Kummer
  */

require_once __DIR__ . '/../includes/inc/auth_check.php';

if(isset($_GET['id']))
{
	$xml = $cluster->Api('datastore', 'get',['id' => $_GET['id']]);
	$sxml = simplexml_load_string($xml);
	$gzip = (string)$sxml['gzip'];
	$data = (string)$sxml;

	if($gzip)
	{
		if(isset($_GET['download']))
		{
			header('Content-type: application/gzip');
			header("Content-Disposition: attachment; filename='datastore-{$_GET['id']}.gz'");
		}
		else
		{
			header('Content-type: text/plain');
			header('Content-Encoding: gzip');
		}
	}
	else
	{
		header('Content-type: text/plain');
		if(isset($_GET['download']))
			header("Content-Disposition: attachment; filename='datastore-{$_GET['id']}.txt'");
	}

	echo base64_decode($data);
}
else if(isset($_GET['node']) && isset($_GET['tid']) && isset($_GET['type']))
{
	try
	{
		$xml = $cluster->Api('processmanager', 'tail',['tid' => $_GET['tid'], 'type' => $_GET['type']], [], $_GET['node']);
		$sxml = simplexml_load_string($xml);
		
		header('Content-type: text/plain');
		echo $sxml;
	}
	catch(Exception $e)
	{
		echo "Unable to open log file";
	}
}
?>