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
require_once 'lib/NotificationPlugin.php';


$xsl = new XSLEngine();
$xsl->SetParameter('SITE_BASE','../../');

// INSTALL
if (isset($_FILES['plugin_file'])) {
	$plugin = new NotificationPlugin(false,false,'../../');
	$errors = $plugin->Install($xsl,$_FILES['plugin_file']['tmp_name']);
}

// UNINSTALL
if (isset($_POST['action']) && $_POST['action'] == 'delete') {
	$plugin = new NotificationPlugin($_POST['plugin_id'],$_POST['plugin_name'], '../../');
	$errors = $plugin->Delete($xsl);
}

$xsl->AddFragment(['response-notifications-types' => $xsl->Api('notification_types','list')]);

$xsl->DisplayXHTML('plugins.xsl');
?>