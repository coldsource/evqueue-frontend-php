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



if(isset($_SERVER['ENVTYPE'])) {
	switch($_SERVER['ENVTYPE'])
	{
		case 'dev':
			if ( isset($_SERVER['HTTP_HOST']) ) {
				$host_parts = explode('.',$_SERVER['HTTP_HOST']);
				$login = $host_parts[0];
			} else if ( isset($_SERVER['PWD']) ) {
				preg_match(';/data/sandbox/([^/]*)/;', $_SERVER['PWD'], $matches);
				$login = $matches[1];
			} else {
				die('Impossible de trouver le login de l\'utilisateur pour calculer l\'emplacement du fichier de log (ni $_SERVER[HTTP_HOST] ni $_SERVER[PWD] ne sont définis).');
			}
			define('QUEUEING_BASEPATH', "/data/sandbox/$login/logger/htdocs");
			break;

		case 'preprod':
		case 'prod':
			define('QUEUEING_BASEPATH',"/data/logs");
			break;
	}
	
} else {
	define('QUEUEING_BASEPATH', $_SERVER['DOCUMENT_ROOT']."/logs");
}




?>