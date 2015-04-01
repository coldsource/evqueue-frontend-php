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

require_once 'lib/WebserviceWrapper.php';


function edit_simple_workflow ($parameters) {
	//use bash to parse arguments
	$var = $parameters['script_path'];
	exec ('sh -c \'for var in "$@"; do echo "$var"; done\' -- '.$var, $output);
	if(isset($output[0])){
		$script_path = $output[0];
		$args = $output;
		unset($args[0]);
	}
	else{
		$script_path = '';
		$args = array();
	}
	
	$ws = new WebserviceWrapper('save-workflow', 'formWorkflow', array(
			'workflow_id' => $parameters['workflow_id'],
			'workflow_name' => $parameters['workflow_name'],
			'script_path' => $script_path,
			'script_arguments' => $args,
			'workflow_group' => $parameters['workflow_group'],
			'workflow_comment' => $parameters['workflow_comment'],
			'task_wd' => $parameters['task_wd'],
			'bound' => isset($parameters['bound']) ? $parameters['bound'] : false,
	), true);
	$ws->FetchResult();
	
	return $ws;
}


?>