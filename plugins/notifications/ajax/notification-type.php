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

define('RELPATH','../../../');
require_once 'inc/auth_check.php';

require_once 'inc/logger.php';
require_once 'lib/XSLEngine.php';
require_once 'lib/workflow_instance.php';

$action = $_GET['action'];
$type = $_GET['type'];

require_once '../'.$type.'/plugin-configuration.php';

$conf = new PluginConfiguration();
$xsl = new XSLEngine();


if( $action == 'edit'){
	$fichier = WorkflowInstance::GetConfFile($type.'.php');
	$contenu = $conf->read($fichier);
	$xsl->AddFragment( $contenu );
	
}else if( $action == 'save' ){
	$texte = $conf->write($_POST); // récupération des données
	WorkflowInstance::StoreConfFile($type.'.php', $texte); // Ecriture des données dans le serveur
}

$xsl->DisplayXHTML('../'.$type.'/plugin-configuration.xsl');


?>