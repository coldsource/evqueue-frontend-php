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

require_once 'lib/workflow_instance.php';


class NotificationPlugin {
	private $id;
	private $relpath;
	private $destination_folder;
	private $filename;
	private $zip;
	
	private $files;
	private $binary;
	
	private $name;
	private $description;
	private $binary_name;
	
	public function __construct ($id = false) {
		$this->id = $id;
		$this->relpath = defined('RELPATH') ? constant('RELPATH') : './';
		
		if (!defined('RELPATH'))
			Logger::GetInstance()->Log(LOG_WARNING,'plugin.php',"Constant 'RELPATH' is not defined, using './' instead");
	}
	
	public function Install ($filename) {
		if ($this->id !== false)
			Logger::GetInstance()->Log(LOG_WARNING,'plugin.php',"Plugin already has an ID, can't install");
		
		$this->filename = $filename;
		
		/**** READ information and check constraints (writable folders etc.) ****/
		$this->destination_folder = "$this->relpath/plugins/notifications/";
		if (!is_writable($this->destination_folder))
			return array("Local plugin folder 'plugins/notifications/' is not writable");
		
		$this->zip = new ZipArchive();
		if (@$this->zip->open($this->filename) !== true)
			return array('Could not open zip file');
		
		$this->files = array();
		foreach (array('manifest.xml', 'notification-parameters.php', 'notification-parameters.xsl') as $file) {
			$this->files[$file] = $this->zip->getFromName($file);
			if ($this->files[$file] === false)
				return array("Could not find the '$file' file");
		}
		
		// check manifest file
		$dom = new DOMDocument();
		if (@$dom->loadXML($this->files['manifest.xml']) === false)
			return array('manifest.xml is not a valid XML file');
		
		$xpath = new DOMXPath($dom);
		$notif_type = $xpath->evaluate('string(/plugin/@type)');
		if ($notif_type != 'notification')
			return array("Plugin type should be 'notification', not '$notif_type'");
		
		$this->name = $xpath->evaluate('string(/plugin/name)');
		$this->description = $xpath->evaluate('string(/plugin/description)');
		$this->binary_name = $xpath->evaluate('string(/plugin/binary)');
		
		// beware the duplicate plugin name!
		$db = new DatabaseMySQL('queueing');
		$db->QueryPrintf('SELECT * FROM t_notification_type WHERE notification_type_name = %s', $this->name);
		if ($db->NumRows() > 0)
			return array('A plugin with the same name is already installed');
		
		if ($this->name == '')
			return array('This plugin has no name (must be defined in the manifest file)');
		
		if ($this->binary_name == '')
			return array('This plugin has no binary (must be defined in the manifest file)');
		
		// binary file
		$this->binary = $this->zip->getFromName($this->binary_name);
		
		if ($this->binary === false)
			return array("Could not find the binary file '$this->binary_name'");
		
		// TODO: check that notification-parameters.php contains the appropriate functions?
		// TODO: check that notification-parameters.xsl contains the appropriate templates?
		
		
		/**** WRITE information, everything should have been checked before ****/
		
		// save files from the zip locally
		$this->destination_folder .= "$this->name/";
		system("mkdir $this->destination_folder");
		
		foreach ($this->files as $file => $data)
			if (file_put_contents("$this->destination_folder/$file", $data) === false)
				return array("Could not write file '$file' locally");
		
		// ask evqueue to store the binary file (it may be running on a different host)
		if (!WorkflowInstance::StoreFile($this->binary_name,$this->binary)) {
			$this->rollback();
			return array("Could not store the binary file at evqueue's, cancelled installation (rolled back writing files locally)");
		}
		
		$type = new NotificationType();
		$ret = $type->check_values(array(
				'notification_type_name' => $this->name,
				'notification_type_description' => $this->description,
				'notification_type_binary' => $this->binary_name,
		), true);
		
		if ($ret !== true) {
			$this->rollback($this->binary_name);
			return array('Could not save notification type, cancelled installation (rolled back writing files locally and binary storage)');
		}
		
		if (!WorkflowInstance::ReloadEvqueue()) {
			$this->rollback($this->binary_name, $type);
			return array('Could not reload evqueue, cancelled installation (rolled back writing files locally, binary storage and notification type)');
		}
		
		return true;
	}
	
	private function rollback ($binary_name=null, $notification_type=null) {
		foreach ($this->files as $file => $data)
			system("rm $this->destination_folder/$file");
		system("rmdir $this->destination_folder");
		
		if ($binary_name)
			WorkflowInstance::DeleteFile($binary_name);
		
		if ($notification_type)
			$notification_type->delete();
	}
	
	public function Delete () {
		$type = new NotificationType($this->id);
		$name = $type->getName();
		
		// 1. Delete remote binary at evqueue's
		if (!WorkflowInstance::DeleteFile($type->getBinary()))
			return array("Can't remove remote file at evqueue's");
		
		// 2. Delete entry from t_notification_type
		$type->delete();
		
		// 3. Delete local files
		$plugin_folder = "$this->relpath/plugins/notifications/$name/";
		foreach (array('manifest.xml','notification-parameters.php','notification-parameters.xsl') as $file)
			system("rm $plugin_folder/$file");
		system("rmdir $plugin_folder");
		
		// 4. Reload EvQueue
		WorkflowInstance::ReloadEvqueue();
		return true;
	}
}

?>