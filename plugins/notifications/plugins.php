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

define('RELPATH', '../../');
require_once 'inc/auth_check.php';

require_once 'inc/logger.php';
require_once 'lib/XSLEngine.php';
require_once 'bo/BO_notification.php';
require_once 'bo/BO_notificationType.php';
require_once 'lib/plugin.php';


$xsl = new XSLEngine();

// INSTALL
if (isset($_FILES['plugin_file'])) {
	$plugin = new NotificationPlugin();
	$errors = $plugin->Install($_FILES['plugin_file']['tmp_name']);
	if ($errors === true)
		$xsl->AddNotice('Installed plugin successfully!');
	else
		$xsl->AddError('error',$errors[0]);
}

// UNINSTALL
if (isset($_POST['action']) && $_POST['action'] == 'delete') {
	$plugin = new NotificationPlugin($_POST['plugin_id']);
	$errors = $plugin->Delete();
	if ($errors === true)
		$xsl->AddNotice('Uninstalled plugin successfully!');
	else
		$xsl->AddError('error',$errors[0]);
}

$xsl->AddFragment(Notification::getAllXml());
$xsl->AddFragment(NotificationType::getAllXml());

$xsl->DisplayXHTML('plugins.xsl');

?>