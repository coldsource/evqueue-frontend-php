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

class Logger
{
	static private $instance = null;

	private $filter_priority;
	private $filter_context;
	private $run_env;

	public function __construct($app_name)
	{
		if(self::$instance!=null)
		{
			$log = self::$instance;
			$log->Log(LOG_NOTICE,"Logger","Replacing Logger",true);
		}

		self::$instance = $this;

		$this->run_env = 'web';
		if (preg_match('/^cli/',php_sapi_name()))
			$this->run_env = 'cli';

		// Initiate syslog
		openlog($app_name,LOG_ODELAY,LOG_LOCAL0);

		self::$instance->ResetFilter();

		self::$instance->setFilter(LOG_WARNING);

		if(isset($_SERVER['HTTP_X_LOGGER_FILTER']))
		{
			$filters = explode(',',$_SERVER['HTTP_X_LOGGER_FILTER']);
			if(sizeof($filters)==1)
				self::$instance->setFilter($filters[0]);
			else
				self::$instance->setFilter($filters[0],$filters[1]);
		}
	}

	static private function ensure_instance()
	{
		if (self::$instance === null) {
			new Logger('default');
			$dbg = array_map(function ($elt) {
				$fu = isset($elt['function']) ? $elt['function'] : '%unknown-function%';
				$li = isset($elt['line']) ? $elt['line'] : '%unknown-line%';
				$fi = isset($elt['file']) ? $elt['file'] : '%unknown-file%';
				return "method $fu @line $li of file $fi";
			}, debug_backtrace());
			self::$instance->Log(LOG_WARNING,'Logger',"Wrong answer! Every project should instanciate its own Logger, and this one does not... Backtrace: ".print_r($dbg,true));
		}
	}

	public static function Log($priority,$context,$message,$include_backtrace=false)
	{
		self::ensure_instance();

		if($priority <= self::$instance->filter_priority && (self::$instance->filter_context == '*' || self::$instance->filter_context == $context)) {
			switch($priority)
			{
				case LOG_EMERG: $priority_text = 'Emergency'; $color = '#FF0000'; $type = E_USER_NOTICE; break;
				case LOG_ALERT: $priority_text = 'Alert'; $color = '#FF0000'; $type = E_USER_NOTICE; break;
				case LOG_CRIT: $priority_text = 'Critical'; $color = '#FF0000'; $type = E_USER_NOTICE; break;
				case LOG_ERR: $priority_text = 'Error'; $color = '#FF0000'; $type = E_USER_ERROR; break;
				case LOG_WARNING: $priority_text = 'Warning'; $color = '#FF9F30'; $type = E_USER_WARNING; break;
				case LOG_NOTICE: $priority_text = 'Notice'; $color = '#FFFF55'; $type = E_USER_NOTICE; break;
				case LOG_INFO: $priority_text = 'Info'; $color = '#BCFF78'; $type = E_USER_NOTICE; break;
				case LOG_DEBUG: $priority_text = 'Debug'; $color = '#FFFFFF'; $type = E_USER_NOTICE; break;
				default: die(-1);
			}

			// Log on screen
			$msg = "[ $context ] $priority_text : $message";
			if (isset($_SERVER['HTTP_X_LOGGER_FILTER'])) {
				switch (self::$instance->run_env) {
					case 'cli':
						echo "$msg\n";
						break;
					case 'web':
						echo "<pre><br/>$msg<br/></pre>";
						break;
				}
			}

			// Log in file
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
			if(isset($_SERVER['HTTP_X_UNIQUE_ID']))
				$log .= "<tr><td>Unique ID</td><td>{$_SERVER['HTTP_X_UNIQUE_ID']}</td></tr>";
			if (is_object($message))
				self::Log(LOG_ERR, 'Logger.php', "Trying to log [$context:$priority] an object (you should log a string): ".print_r($message,true));
			$log .= "<tr><td colspan='2'><pre>$message</pre></td></tr>";

			if($priority<=LOG_ERR || $include_backtrace)
			{
				$log .= "<tr><td colspan='2'>Backtrace :</td></tr>";
				$bt = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS);
				foreach($bt as $el)
				{
					if(isset($el['file']) && isset($el['line']))
						$log .= "<tr><td colspan='2'>".$el['file'].':'.$el['line']."</td></tr>";
				}
			}

			$log .= "</table>\n";
			
			trigger_error($log, $type);
			
			// Log in syslog
			if(isset($_SERVER['HTTP_X_UNIQUE_ID']))
				syslog($priority,"[ {$_SERVER['HTTP_X_UNIQUE_ID']} $context ] $message");
			else
				syslog($priority,"[ $context ] $message");
		}

		if($priority<=LOG_ERR)
		{
			if(isset($_SERVER['SERVER_PROTOCOL']))
				header($_SERVER['SERVER_PROTOCOL'] . ' 503 Temporarily unavailable', true, 500);

			die(123);
		}
	}

	public static function SetFilter($priority,$context='*')
	{
		if(is_string($priority))
		{
			switch($priority)
			{
				case 'LOG_EMERG': $priority = LOG_EMERG; break;
				case 'LOG_ALERT': $priority = LOG_ALERT; break;
				case 'LOG_CRIT': $priority = LOG_CRIT; break;
				case 'LOG_ERR': $priority = LOG_ERR; break;
				case 'LOG_WARNING': $priority = LOG_WARNING; break;
				case 'LOG_NOTICE': $priority = LOG_NOTICE; break;
				case 'LOG_INFO': $priority = LOG_NOTICE; break;
				case 'LOG_DEBUG': $priority = LOG_DEBUG; break;
				default: die(-1);
			}
		}

		self::ensure_instance();
		self::$instance->filter_priority = $priority;
		self::$instance->filter_context = $context;
	}

	public static function GetFilterPriority ()
	{
		self::ensure_instance();
		return self::$instance->filter_priority;
	}

	public static function ResetFilter()
	{
		self::ensure_instance();
		self::$instance->filter_priority = LOG_NOTICE;
		self::$instance->filter_context = '*';
	}

	public static function LogPHPNotice ($errno, $errstr, $errfile, $errline)
	{
		self::Log(LOG_NOTICE,'Unknown Context',"Notice ($errno) in $errfile line $errline:<br/>$errstr");
	}

	public static function ShutDown ()
	{
		$output = ob_get_contents();
		ob_clean();

		global $ended_correctly;
		if (!$ended_correctly) {
			self::Log(LOG_ERR, 'Unknown context', "Webservice did not finish execution correctly.<br/>".htmlspecialchars($output));
			echo $output;
		} else {
			echo $output;
		}

	}

}

?>
