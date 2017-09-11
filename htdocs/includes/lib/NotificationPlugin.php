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
	private $destination_folder;
	private $filename;
	private $zip;
	
	private $manifest;
	private $binary;
	
	private $description;
	private $binary_name;
	
	public function __construct ($id=false,$name) {
		$this->id = $id;
		$this->name = $name;
	}
	
	public function Install ($xsl, $filename) {
		if ($this->id !== false)
			Logger::GetInstance()->Log(LOG_WARNING,'plugin.php',"Plugin already has an ID, can't install");
		
		$this->filename = $filename;
		
		$this->zip = new ZipArchive();
		if (@$this->zip->open($this->filename) !== true)
			return array('Could not open zip file');
		
		$this->manifest = $this->zip->getFromName('manifest.xml');
		if ($this->manifest === false)
				return $xsl->AddError("Could not find the 'manifest.xml' file");
		
		// check manifest file
		$dom = new DOMDocument();
		if (@$dom->loadXML($this->manifest) === false)
			return $xsl->AddError('manifest.xml is not a valid XML file');
		
		$xpath = new DOMXPath($dom);
		$notif_type = $xpath->evaluate('string(/plugin/@type)');
		if ($notif_type != 'notification')
			return $xsl->AddError("Plugin type should be 'notification', not '$notif_type'");
		
		$this->name = $xpath->evaluate('string(/plugin/name)');
		$this->description = $xpath->evaluate('string(/plugin/description)');
		$this->binary_name = $xpath->evaluate('string(/plugin/binary)');
		
		// binary file
		$this->binary = $this->zip->getFromName($this->binary_name);
		
		if ($this->binary === false)
			return $xsl->AddError("Could not find the binary file '$this->binary_name'");
		
		$xsl->Api('notification_type', 'register', [
			'name' => $this->name,
			'description' => $this->description,
			'manifest' => base64_encode($this->manifest),
			'binary_content' => base64_encode($this->binary),
			]);
		
		if(!$xsl->HasError())
			$xsl->AddNotice('Installed plugin successfully!');
	}
}

?>