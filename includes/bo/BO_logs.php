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

require_once 'inc/logger.php';
require_once 'lib/DatabaseMySQL.php';

class Logs{
	
	private $db;
	
	function __construct($id = false){
	}
	
	public static function getLastLogs($limit){
		$db = new DatabaseMySQL('queueing');
		$db->Query("SELECT log_level,log_message,log_timestamp FROM t_log ORDER BY log_id DESC LIMIT $limit");
		
		$xml = '<logs>';
		while(($row = $db->FetchAssoc()) !== false){
			switch($row['log_level'])
			{
				case LOG_EMERG: $level = 'LOG_EMERG';break;
				case LOG_ALERT: $level = 'LOG_ALERT';break;
				case LOG_CRIT: $level = 'LOG_CRIT';break;
				case LOG_ERR: $level = 'LOG_ERR';break;
				case LOG_WARNING: $level = 'LOG_WARNING';break;
				case LOG_NOTICE: $level = 'LOG_NOTICE';break;
				case LOG_INFO: $level = 'LOG_INFO';break;
				case LOG_DEBUG: $level = 'LOG_DEBUG';break;
			}
			$xml.= "<log level='$level' message=\"".htmlspecialchars($row['log_message'])."\" timestamp='{$row['log_timestamp']}' />";
		}
		$xml .= '</logs>';
		
		return $xml;
	}
}

?>