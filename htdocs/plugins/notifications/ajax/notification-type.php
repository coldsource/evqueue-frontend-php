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
  * Authors: Nicolas Jean, Christophe Marti, Brahim Louridi
  */

require_once 'inc/auth_check.php';
require_once 'inc/logger.php';
require_once 'lib/XSLEngine.php';

$action = $_GET['action'];
$type = $_GET['type'];

require_once '../'.$type.'/plugin-configuration.php';

$conf = new PluginConfiguration();

$xsl = new XSLEngine();
$xsl->SetParameter('SITE_BASE','../../');


if( $action == 'edit'){
	$xml = $xsl->Api('notification_type','get_conf',['id' => $_GET['id']]);
	$content = (string)simplexml_load_string($xml)->{'conf'}['content'];
	$content_xml = $conf->read(base64_decode($content));
	$xsl->AddFragment( $content_xml );
	
}else if( $action == 'save' ){
	$content = $conf->write($_POST); // récupération des données
	echo "saving $content";
	$xsl->Api('notification_type','set_conf',['id' => $_POST['id'], 'content'=>base64_encode($content)]);
}

$xsl->DisplayXHTML('../'.$type.'/plugin-configuration.xsl');


?>