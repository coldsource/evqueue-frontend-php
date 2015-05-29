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


function saveWorkflow ($parameters) {
	
	$notifs = isset($parameters['notification']) ? $parameters['notification'] : array();
	if (!is_array($notifs))
		$notifs = array($notifs);
	
	$parameters['workflow_notifications'] = join(',',$notifs);
	
	$ws = new WebserviceWrapper('save-workflow', 'formWorkflow', $parameters, true);
	$ws->FetchResult();
	
	return $ws->HasErrors();
}


function edit_simple_workflow ($parameters) {
	//use bash to parse arguments
	$var = $parameters['script_path'];
	exec ('sh -c \'for var in "$@"; do echo "$var"; done\' -- '.$var, $output);
	if(isset($output[0])){
		$parameters['script_path'] = $output[0];
		$parameters['script_arguments'] = $output;
		unset($parameters['script_arguments'][0]);
	}
	else{
		$parameters['script_path'] = '';
		$parameters['script_arguments'] = array();
	}
	
	$parameters['bound'] = isset($parameters['bound']) ? $parameters['bound'] : false;
	
	return saveWorkflow($parameters);
}


?>