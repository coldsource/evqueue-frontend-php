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

if(isset($_SERVER['ENVTYPE']))
	return require_once 'inc-global/conf/databases.php';

global $DATABASES_CONFIG;
$DATABASES_CONFIG = array();

$DATABASES_CONFIG['queueing'] = array(
		DatabaseMySQL::$MODE_RDONLY=>'mysql://evqueue:evqueue@127.0.0.1/evqueue',
		DatabaseMySQL::$MODE_RDRW=>'mysql://evqueue:evqueue@127.0.0.1/evqueue',
		DatabaseMySQL::$MODE_SUPERUSER=>false
);
?>