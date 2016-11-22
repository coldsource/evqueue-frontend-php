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

if(isset($_POST['action'])) {
	if($_POST['action']=='updatePreferences')
	{
		if($_POST['password']!=$_POST['password2'])
			$xsl->AddError("Passwords do not match");
		
		if($_POST['password']!='' && !$xsl->HasError())
		{
			$xsl->Api('user','change_password',['name'=>$_SESSION['user_login'], 'password'=>$_POST['password']]);
			if(!$xsl->HasError())
				$_SESSION['user_pwd'] = sha1($_POST['password'],true);
		}
		
		$preferences = json_encode(['prefered_node' => $_POST['prefered_node']]);
		$xsl->Api('user', 'update_preferences', ['name'=> $_SESSION['user_login'],'preferences' =>$preferences]);
	}
	
	if(!$xsl->HasError())
	{
		$xsl->AddNotice('Preferences successfuly changed');
	}
}

$xml = $xsl->Api("user", "get", ['name' => $_SESSION['user_login']]);
$simplexml = simplexml_load_string($xml);

$preferences = array();
if(isset($simplexml->user['preferences']))
{
	$preferences = json_decode((string)$simplexml->user['preferences']);
	if(isset($preferences->prefered_node))
		$xsl->AddFragment("<user><prefered_node>{$preferences->prefered_node}</prefered_node></user>");
}

$xsl->DisplayXHTML('xsl/user_preferences.xsl');
?>