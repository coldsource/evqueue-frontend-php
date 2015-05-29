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

class NotificationParameters {
	
	public static function check_parameters ($parameters) {
		foreach ($parameters as $p => $v) {
			switch ($p) {
				case 'subject':
					
					break;
				
				case 'to':
					$ea = '.*@.*\..*';
					if (!preg_match("/^$ea(,$ea)*$/", $v))
						return array('to'=>'The email address of a recipient is not valid');
					break;
				
				case 'cc':
					$ea = '.*@.*\..*';
					if (!preg_match("/^$ea(,$ea)*$/", $v) && $v != '')
						return array('to'=>'An email address in CC is not valid');
					break;
				
				case 'body':
					
					break;
			}
		}
		
		return true;
	}
	
	public static function serialise ($parameters) {
		return json_encode($parameters);
	}
	
	public static function deserialise_to_xml ($string) {
		$xml = '<parameters>';
		$params = json_decode($string,true);
		if (is_array($params))
			foreach ($params as $p => $v) {
				$p = htmlspecialchars($p);
				$v = htmlspecialchars($v);
				$xml .= "<$p>$v</$p>";
			}
		return "$xml</parameters>";
	}
	
}

?>