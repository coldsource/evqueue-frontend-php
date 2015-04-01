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


/*
 * populates table t_workflow_instance_parameters
 * from previous t_workflow_instances
 */

set_time_limit(0);

require_once 'lib/Logger.php';
require_once 'lib/DatabaseMySQL.php';
new logger('queueing');

$db_queueing = new DatabaseMySQL("queueing",DatabaseMySQL::$MODE_RDRW);
$db_queueing2 = new DatabaseMySQL("queueing",DatabaseMySQL::$MODE_RDRW);

//$queries = array(
//	"DROP TABLE IF EXISTS `t_workflow_instance_parameters`;",
//	"CREATE TABLE IF NOT EXISTS t_workflow_instance_parameters (
//	workflow_instance_id int(10) unsigned NOT NULL,
//	workflow_instance_parameter varchar(35) COLLATE utf8_unicode_ci NOT NULL,
//	workflow_instance_parameter_value text COLLATE utf8_unicode_ci NOT NULL,
//	KEY `param_and_value` (`workflow_instance_parameter_value`(255),`workflow_instance_parameter`),
//  ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;",
//);
//
//foreach ($queries as $query) {
//	$db_queueing->Query($query);
//}

$db_queueing->Query("SELECT workflow_instance_id, workflow_instance_savepoint FROM t_workflow_instance");

while ($row = $db_queueing->FetchAssoc()) {
	$params = array();
	$nbadded = 0;
	
	$xml = new SimpleXMLElement($row['workflow_instance_savepoint']);
	$parameters = $xml->xpath('*/parameter');
	
	foreach($parameters as $parameter) {
		
		$db_queueing2->QueryPrintf("
			SELECT * FROM t_workflow_instance_parameters
			WHERE workflow_instance_id = %i
				AND workflow_instance_parameter = %s
		",
						$row['workflow_instance_id'],
						$parameter['name']
		);
		
		if ($db_queueing2->NumRows() > 0)
			continue;
		
		$db_queueing2->QueryPrintf("
			INSERT INTO t_workflow_instance_parameters (workflow_instance_id,workflow_instance_parameter,workflow_instance_parameter_value)
			VALUES (%i, %s, %s)
		",
						$row['workflow_instance_id'],
						$parameter['name'],
						(string)$parameter[0]
		);
		
		$nbadded++;
	}
	
	if ($nbadded)
		echo "\n$nbadded parameters added for workflow instance {$row['workflow_instance_id']}\n";
	else
		echo '.';
}

echo "\n";

?>