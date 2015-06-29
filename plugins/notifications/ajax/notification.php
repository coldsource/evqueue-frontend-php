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

define('RELPATH','../../../');
require_once 'inc/auth_check.php';

require_once 'inc/logger.php';
require_once 'lib/XSLEngine.php';
require_once 'bo/BO_notification.php';
require_once 'bo/BO_notificationType.php';


if (!isset($_GET['id']) && !isset($_GET['type_id']) || !isset($_GET['action']))
	die('GET parameter(s) missing');


$notif = isset($_GET['id']) ? new Notification($_GET['id']) : null;

$type = new NotificationType($notif ? $notif->getTypeID() : $_GET['type_id']);
if ($type === false)
	die("Unknown notification '{$_GET['id']}'");


require_once '../'.$type->getName().'/notification-parameters.php';  // required for access to NotificationParameters::(de)serialise()

$xsl = new XSLEngine();
if ($notif) $xsl->AddFragment($notif->getGeneratedXml());
$xsl->AddFragment($type->getGeneratedXml());
$xsl->DisplayXHTML('../'.$type->getName().'/notification-parameters.xsl');


?>