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

require_once 'conf/logger.php';

class Logger
{
	static private $instance = null;

	private $filter_priority;
	private $filter_context;

	private $file;

	public function __construct($app_name)
	{
		if(Logger::$instance!=null)
		{
			$log = Logger::GetInstance();
			$log->Log(LOG_NOTICE,"Logger","Replacing Logger");
		}

		Logger::$instance = $this;

		// Initiate log file
		$basepath = $this->GetBasePath()."/$app_name";
		if(!is_dir($basepath))
			mkdir($basepath,0700,true);
		$this->file = fopen("$basepath/log.html",'a+');

		// Initiate syslog
		openlog($app_name,LOG_ODELAY,LOG_LOCAL0);

		$this->ResetFilter();
		Logger::GetInstance()->setFilter(LOG_WARNING);
	}

	public static function GetBasePath () {
		return QUEUEING_BASEPATH;
	}

	static public function GetInstance()
	{
		if (Logger::$instance === null) {
			new Logger('default');
			$dbg = array_map(function ($elt) {
				$fu = isset($elt['function']) ? $elt['function'] : '%unknown-function%';
				$li = isset($elt['line']) ? $elt['line'] : '%unknown-line%';
				$fi = isset($elt['file']) ? $elt['file'] : '%unknown-file%';
				return "method $fu @line $li of file $fi";
			}, debug_backtrace());
			Logger::$instance->Log(LOG_WARNING,'Logger',"Wrong answer! Every project should instanciate its own Logger, and this one does not... Backtrace: ".print_r($dbg,true));
		}
		
		return Logger::$instance;
	}

	public function Log($priority,$context,$message)
	{
		if($priority <= $this->filter_priority && ($this->filter_context == '*' || $this->filter_context == $context)) {
			// Log in file
			switch($priority)
			{
				case LOG_EMERG: $priority_text = 'Emergency'; $color = '#FF0000'; break;
				case LOG_ALERT: $priority_text = 'Alert'; $color = '#FF0000'; break;
				case LOG_CRIT: $priority_text = 'Critical'; $color = '#FF0000'; break;
				case LOG_ERR: $priority_text = 'Error'; $color = '#FF0000'; break;
				case LOG_WARNING: $priority_text = 'Warning'; $color = '#FF9F30'; break;
				case LOG_NOTICE: $priority_text = 'Notice'; $color = '#FFFF55'; break;
				case LOG_INFO: $priority_text = 'Info'; $color = '#BCFF78'; break;
				case LOG_DEBUG: $priority_text = 'Debug'; $color = '#FFFFFF'; break;
			}

			$log = '';
			$log .= "<table style='border:1px solid;width:100%;'>";
			$log .= "<tr><td colspan='2' style='background:$color'>Logger</td></tr>";
			$log .= "<tr><td style='width:200px;'>Time</td><td>".date('H:i:s d-m-Y')."</td></tr>";
			$log .= "<tr><td>URL</td><td>".
								(isset($_SERVER['HTTP_HOST']) ?
									"http://{$_SERVER['HTTP_HOST']}{$_SERVER['REQUEST_URI']}" :
									'script: ' . __FILE__
								)
							."</td></tr>";
			$log .= "<tr><td>Priority</td><td>$priority_text</td></tr>";
			$log .= "<tr><td>Context</td><td>$context</td></tr>";
			if (is_object($message))
				$this->Log (LOG_ERR, 'Logger.php', "Trying to log [$context:$priority] an object (you should log a string): ".print_r($message,true));
			$log .= "<tr><td colspan='2'><pre>$message</pre></td></tr>";

			if($priority<=LOG_ERR)
			{
				$log .= "<tr><td colspan='2'>Backtrace :</td></tr>";
				$bt = debug_backtrace(false);
				foreach($bt as $el)
				{
					if(isset($el['file']) && isset($el['line']))
						$log .= "<tr><td colspan='2'>".$el['file'].':'.$el['line']."</td></tr>";
				}
			}

			$log .= "</table>\n";
			fwrite($this->file,$log);

			// Log in syslog
			syslog($priority,"[ $context ] $message");
		}
		
		if($priority<=LOG_ERR)
			die(123);
	}

	public function SetFilter($priority,$context='*')
	{
		$this->filter_priority = $priority;
		$this->filter_context = $context;
	}
	
	public function GetFilterPriority () {
		return $this->filter_priority;
	}

	public function ResetFilter()
	{
		$this->filter_priority = LOG_NOTICE;
		$this->filter_context = '*';
	}

	public function LogPHPNotice ($errno, $errstr, $errfile, $errline) {
		$this->Log(LOG_NOTICE,'Unknown Context',"Notice ($errno) in $errfile line $errline:<br/>$errstr");
	}

	public function ShutDown ()
	{
		$output = ob_get_contents();
		ob_clean();

		global $ended_correctly;
		if (!$ended_correctly) {
			$this->Log(LOG_ERR, 'Unknown context', "Webservice did not finish execution correctly.<br/>".htmlspecialchars($output));
			echo $output;
		} else {
			echo $output;
		}

	}

}

?>