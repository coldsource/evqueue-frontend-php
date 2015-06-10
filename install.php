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
session_destroy();

require_once 'inc/logger.php';
require_once 'lib/XSLEngine.php';
require_once 'lib/workflow_instance.php';
require_once 'lib/DatabaseMySQL.php';

if(isset($DATABASES_CONFIG['queueing']))
{
	// Already configured
	die("evQueue has already been configured, if you want to re-configure it, please remove the content of the configuration files (but keep files in place)");
}

$xsl = new XSLEngine();

if(isset($_POST['db_host']) && isset($_POST['db_user']) && isset($_POST['db_password']) && isset($_POST['db_name']) && isset($_POST['engine_host']) && isset($_POST['engine_port']))
{
	$error = false;
	
	try
	{
		$cnx = @mysql_connect($_POST['db_host'],$_POST['db_user'],$_POST['db_password']);
		if($cnx===false)
			throw new Exception("Unable to connect to database");
		
		$re = @mysql_select_db($_POST['db_name']);
		if($re===false)
			throw new Exception("Database does not exist");
		
		$wfi = new WorkflowInstance($_POST['engine_host'],$_POST['engine_port']);
		$wfs = $wfi->GetRunningWorkflows();
		if($wfs===false)
			throw new Exception("Unable to connect to evQueue engine");
		
		$path_to_conf = (is_dir('/etc/evqueue/conf') && is_writable('/etc/evqueue/conf')) ? '/etc/evqueue/conf' : 'conf';
		
		$f = @fopen("$path_to_conf/databases.php",'w',true);
		if($f===false)
			throw new Exception("Unable to open config file '$path_to_conf/databases.php'");
		
		fputs($f,"<?php\n// This file has been generated by install.php\nglobal \$DATABASES_CONFIG;\n\$DATABASES_CONFIG = array();\n\n\$DATABASES_CONFIG['queueing'] = array(\n\tDatabaseMySQL::\$MODE_RDONLY=>'mysql://{$_POST['db_user']}:{$_POST['db_password']}@{$_POST['db_host']}/{$_POST['db_name']}',\n\tDatabaseMySQL::\$MODE_RDRW=DatabaseMySQL::\$MODE_RDONLY,\n\tDatabaseMySQL::\$MODE_SUPERUSER=>false\n);\n?>");
		
		fclose($f);
		
		$f = @fopen("$path_to_conf/queueing.php",'w',true);
		if($f===false)
			throw new Exception("Unable to open config file '$path_to_conf/queueing.php'");
		
		fputs($f,"<?php\n// This file has been generated by install.php\ndefine('QUEUEING_HOST','{$_POST['engine_host']}');\ndefine('QUEUEING_PORT','{$_POST['engine_port']}');\n?>");
		
		fclose($f);
		
		$site_base = dirname($_SERVER['REQUEST_URI']);
		if($site_base!="/")
			$site_base .= '/';
		$site_base = "http://{$_SERVER['HTTP_HOST']}$site_base";
		
		$f = @fopen("$path_to_conf/sites_base.php",'w',true);
		if($f===false)
			throw new Exception("Unable to open config file '$path_to_conf/sites_base.php'");
		
		fputs($f,"<?php\n// This file has been generated by install.php\ndefine('SITE_BASE','$site_base');\n?>");
		
		fclose($f);
		
		$logger_path = dirname(__FILE__).'/logs';
		
		$f = @fopen("$path_to_conf/logger.php",'w',true);
		if($f===false)
			throw new Exception("Unable to open config file '$path_to_conf/logger.php'");
		
		fputs($f,"<?php\n// This file has been generated by install.php\ndefine('QUEUEING_BASEPATH','$logger_path');\n?>");
		
		fclose($f);
		
		// everything went smooth, my job is done here
		unlink('install.php');
		
		header("Location: auth.php");
		die();
		
	}
	catch(Exception $e)
	{
		$xsl->SetParameter('ERROR',$e->getMessage());
	}
}

$xsl->DisplayXHTML('xsl/install.xsl');
?>