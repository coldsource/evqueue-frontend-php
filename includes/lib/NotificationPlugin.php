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

class NotificationPlugin {
	private $id;
	private $name;
	private $relpath;
	private $destination_folder;
	private $filename;
	private $zip;
	
	private $files;
	private $binary;
	
	private $description;
	private $binary_name;
	
	public function __construct ($id=false,$name,$relpath='./') {
		$this->id = $id;
		$this->name = $name;
		$this->relpath = $relpath;
	}
	
	public function Install ($xsl, $filename) {
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
		foreach (array('manifest.xml', 'notification-parameters.php', 'notification-parameters.xsl', 'plugin-configuration.php', 'plugin-configuration.xsl') as $file) {
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
		
		// binary file
		$this->binary = $this->zip->getFromName($this->binary_name);
		
		if ($this->binary === false)
			return array("Could not find the binary file '$this->binary_name'");
		
		/**** WRITE information, everything should have been checked before ****/
		
		// save files from the zip locally
		$this->destination_folder .= "$this->name/";
		system("mkdir $this->destination_folder");
		
		foreach ($this->files as $file => $data)
			if (file_put_contents("$this->destination_folder/$file", $data) === false)
				return array("Could not write file '$file' locally");
		
		$xsl->Api('notification_type', 'register', [
			'name' => $this->name,
			'description' => $this->description,
			'binary_content' => base64_encode($this->binary),
			]);
		
		if(!$xsl->HasError())
			$xsl->AddNotice('Installed plugin successfully!');
	}
	
	private function rollback ($binary_name=null, $notification_type=null) {
		foreach ($this->files as $file => $data)
			system("rm $this->destination_folder/$file");
		system("rmdir $this->destination_folder");
	}
	
	public function Delete ($xsl) {
		// 1. Unregister plugin in evQueue engine
		$xsl->Api('notification_type', 'unregister', ['id'=>$this->id]);
		
		// 2. Delete local files
		$plugin_folder = "$this->relpath/plugins/notifications/$this->name/";
		foreach (array('manifest.xml','notification-parameters.php','notification-parameters.xsl','plugin-configuration.xsl','plugin-configuration.php') as $file)
			system("rm $plugin_folder/$file");
		system("rmdir $plugin_folder");
		
		if(!$xsl->HasError())
			$xsl->AddNotice('Uninstalled plugin successfully!');
	}
}

?>