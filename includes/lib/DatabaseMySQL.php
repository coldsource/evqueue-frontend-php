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

require_once 'conf/databases.php';
require_once 'lib/Logger.php';

class DatabaseMySQL
{
	private $conn_desc = false;
	private $res = false;

	private $replace_cbk_arg_i;
	private $replace_cbk_args;
	
	private $mode;
	private $name;
	private $unbuffered;

	public static $MODE_RDONLY = 1;
	public static $MODE_RDRW = 2;
	public static $MODE_SUPERUSER = 3;
	
	private static $transaction_depth;

	/*
	 * Be careful to keep the keys of $db and $transaction_depth consistent with the modes here-above
	 * defined. It seems like PHP does not allow you to reuse DatabaseMySQL::$MODE_XXX
	 * in the definition of other attributes (syntaxically).
	 */
	private static $db = array();

	public function __construct($db_name,$mode = false)
	{
		global $DATABASES_CONFIG;
		if(!isset($DATABASES_CONFIG[$db_name]))
			Logger::GetInstance()->Log(LOG_ERR,"Database","Unknown database name '$db_name'. Could not find any configuration");
		
		$this->name = $db_name;
		$conn_desc = $DATABASES_CONFIG[$db_name];
		
		if(sizeof($conn_desc)!=3)
			Logger::GetInstance()->Log(LOG_ERR,"Database","Invalid connection descriptors array. Must have 3 elements.");
		
		if(!isset($conn_desc[DatabaseMySQL::$MODE_RDONLY]) || !isset($conn_desc[DatabaseMySQL::$MODE_RDRW]) || !isset($conn_desc[DatabaseMySQL::$MODE_SUPERUSER]))
			Logger::GetInstance()->Log(LOG_ERR,"Database","Missing keys in connection descriptors array.");
		
		foreach(array(DatabaseMySQL::$MODE_RDONLY,DatabaseMySQL::$MODE_RDRW,DatabaseMySQL::$MODE_SUPERUSER) as $i)
		{
			if(!$conn_desc[$i])
				$this->conn_desc[$i] = false;
			else
			{
				$url_parts = parse_url($conn_desc[$i]);
				if($url_parts['scheme']!='mysql' || !isset($url_parts['user']) || !isset($url_parts['host']) || !isset($url_parts['path']))
					Logger::GetInstance()->Log(LOG_ERR,"Database","Invalid connection descriptor : {$conn_desc[$i]}");
				
				$this->conn_desc[$i]['url'] = $conn_desc[$i];
				$this->conn_desc[$i]['host'] = $url_parts['host'];
				$this->conn_desc[$i]['user'] = $url_parts['user'];
				$this->conn_desc[$i]['pass'] = isset($url_parts['pass'])?$url_parts['pass']:false;
				$this->conn_desc[$i]['database'] = substr($url_parts['path'],1);
				
				DatabaseMySQL::$transaction_depth[$this->name] = array(
						'master' => 0,
						'slave' => 0
				);
				
			}
		}
		
		if($mode===false)
			$this->SetMode(DatabaseMySQL::$MODE_RDONLY);
		else
			$this->SetMode($mode);
		
		$this->unbuffered = false;
	}

	private function Connect()
	{
		$conn_desc = $this->conn_desc[$this->mode];
		
		if($conn_desc===false)
			Logger::GetInstance()->Log(LOG_ERR,"Database","Connection with mode {$this->mode} is forbidden");
		
		Logger::GetInstance()->Log(LOG_DEBUG,"Database","Connecting to database server. Connection descriptor is '{$conn_desc['url']}'");

		DatabaseMySQL::$db[$this->name][$this->mode] = @mysql_connect($conn_desc['host'],$conn_desc['user'],$conn_desc['pass'],true);

		if(DatabaseMySQL::$db[$this->name][$this->mode]==false)
			Logger::GetInstance()->Log(LOG_ERR,"Database","Unable to connect to database. Connection descriptor was : '{$conn_desc['url']}'");

		if(!@mysql_select_db($this->conn_desc[$this->mode]['database'],DatabaseMySQL::$db[$this->name][$this->mode]))
			Logger::GetInstance()->Log(LOG_ERR,"Database","Unable to change database. Connection descriptor was : '{$conn_desc['url']}'");
		
		@mysql_query("SET NAMES UTF8",DatabaseMySQL::$db[$this->name][$this->mode]);
	}

	public function SetMode($mode)
	{
		if($mode!=DatabaseMySQL::$MODE_RDONLY && $mode !=DatabaseMySQL::$MODE_RDRW && $mode !=DatabaseMySQL::$MODE_SUPERUSER)
			Logger::GetInstance()->Log(LOG_ERR,"Database","Error setting database mode only MODE_RDONLY, MODE_RDRW and MODE_SUPERUSER are valid modes");

		$this->mode = $mode;
		return true;
	}
	
	public function SetUnbuffered($unbuffered) {
		$this->unbuffered = $unbuffered ? true : false;
	}
	
	public function Query($query, $fatalError = TRUE)
	{
		// Late connection
		if(!isset(DatabaseMySQL::$db[$this->name][$this->mode]) || DatabaseMySQL::$db[$this->name][$this->mode]===false)
			$this->Connect();

		$t = 0;
		if (Logger::GetInstance()->GetFilterPriority() >= LOG_DEBUG)
			$t = microtime(true);
		
		if ($this->unbuffered)
			$this->res = @mysql_unbuffered_query($query,DatabaseMySQL::$db[$this->name][$this->mode]);
		else
			$this->res = @mysql_query($query,DatabaseMySQL::$db[$this->name][$this->mode]);
		
		if($this->res===false)
		{
			if(mysql_errno(DatabaseMySQL::$db[$this->name][$this->mode])==2006)
			{
				// MySQL Server has gone away
				DatabaseMySQL::$db[$this->name][$this->mode] = false;
				return $this->Query($query);
			}
			$dberror = mysql_error(DatabaseMySQL::$db[$this->name][$this->mode]);
			if($fatalError)
				Logger::GetInstance()->Log(LOG_ERR,"Database","Error executing query '$query'.\nServer returned error : '$dberror'");
			else{
				Logger::GetInstance()->Log(LOG_NOTICE,"Database","Error executing query '$query'.\nServer returned error : '$dberror'");
				return FALSE;
			}
		}
		
		if (Logger::GetInstance()->GetFilterPriority() >= LOG_DEBUG)
			Logger::GetInstance()->Log(LOG_DEBUG,"Database","Executed query $query\n\nin ".(microtime(true)-$t)."s");
		else
			Logger::GetInstance()->Log(LOG_DEBUG,"Database","Executed query $query");
		
		return true;
	}

	public function QueryPrintfNoFatalError($query)
	{
		// Late connection (this is needed for mysql_real_escape_string())
		if(!isset(DatabaseMySQL::$db[$this->name][$this->mode]) || DatabaseMySQL::$db[$this->name][$this->mode]===false)
			$this->Connect();
		
		$this->replace_cbk_arg_i = 1;
		$this->replace_cbk_args = func_get_args();

		$query = preg_replace_callback('/%./',array($this,'replace_cbk'),$query);
		return $this->Query($query, FALSE);
	}
	
	public function QueryPrintf($query)
	{
		// Late connection (this is needed for mysql_real_escape_string())
		if(!isset(DatabaseMySQL::$db[$this->name][$this->mode]) || DatabaseMySQL::$db[$this->name][$this->mode]===false)
			$this->Connect();
		
		$this->replace_cbk_arg_i = 1;
		$this->replace_cbk_args = func_get_args();

		$query = preg_replace_callback('/%./',array($this,'replace_cbk'),$query);
		return $this->Query($query);
	}

	public function QueryVsPrintf($query,$args)
	{
		// Late connection (this is needed for mysql_real_escape_string())
		if(!isset(DatabaseMySQL::$db[$this->name][$this->mode]) || DatabaseMySQL::$db[$this->name][$this->mode]===false)
			$this->Connect();
		
		$this->replace_cbk_arg_i = 1;
		$this->replace_cbk_args = $args;
		array_unshift($this->replace_cbk_args, $query);

		$query = preg_replace_callback('/%./',array($this,'replace_cbk'),$query);
		return $this->Query($query);
	}
	
	public function SequenceInc($table,$name)
	{
		$this->QueryPrintf("UPDATE $table SET sequence_value=last_insert_id(sequence_value+1) where sequence_name=%s",$name);
		return mysql_insert_id(DatabaseMySQL::$db[$this->name][$this->mode]);
	}

	public function FetchAssoc()
	{
		if(!$this->res)
			Logger::GetInstance()->Log(LOG_WARNING,"Database","Could not fetch row as result is empty");

		return mysql_fetch_assoc($this->res);
	}

	public function FetchArray()
	{
		if(!$this->res)
			Logger::GetInstance()->Log(LOG_WARNING,"Database","Could not fetch row as result is empty");

		return mysql_fetch_array($this->res);
	}
	
	public function GetInsertID()
	{
		if(!$this->res)
			Logger::GetInstance()->log(LOG_WARNING,'Database',"Trying to get an INSERT ID but no successful INSERT query was run yet");
		
		return mysql_insert_id(DatabaseMySQL::$db[$this->name][$this->mode]);
	}

	public function Seek($pos)
	{
		if(!$this->res)
			Logger::GetInstance()->Log(LOG_WARNING,"Database","Could not seek as result is empty");

		return mysql_data_seek($this->res,$pos);
	}

	public function NumRows()
	{
		if(!$this->res)
			Logger::GetInstance()->Log(LOG_WARNING,"Database","Could not get result size as result is empty");

		return mysql_num_rows($this->res);
	}

	public function NumAffectedRows()
	{
		if(!$this->res)
			Logger::GetInstance()->Log(LOG_WARNING,"Database","Could not get result size as result is empty");

		return mysql_affected_rows(DatabaseMySQL::$db[$this->name][$this->mode]);
	}
	
	public function GetFoundRows () {
		$res = mysql_query("SELECT FOUND_ROWS();");
		$nbrows = mysql_fetch_array($res);
		return $nbrows[0];
	}
	
	private function replace_cbk($matches)
	{
		$token = $matches[0];

		if($token[1]=='%')
			return '%';

		$val = $this->replace_cbk_args[$this->replace_cbk_arg_i++];
		switch($token[1])
		{
			case 's':
				if($val===null)
					return 'NULL';
				return "'".mysql_real_escape_string($val,DatabaseMySQL::$db[$this->name][$this->mode])."'";

			case 'b':
				if($val===null)
					return 'NULL';
				return "'".mysql_real_escape_string($val,DatabaseMySQL::$db[$this->name][$this->mode])."'";

			case 'i':
				if($val===null)
					return 'NULL';
				if(is_array($val))
				{
					foreach($val as $v)
						if (!is_numeric($v))
							Logger::GetInstance()->Log(LOG_ERR,'DatabaseMySQL.php',"La valeur ".var_export($v,true)." n'est pas numérique ! debug: ".print_r(debug_backtrace(false),true));
					
					return implode(',',$val);
				}
				
				if (!is_numeric($val))
					Logger::GetInstance()->Log(LOG_ERR,'DatabaseMySQL.php',"La valeur ".var_export($val,true)." n'est pas numérique ! debug: ".print_r(debug_backtrace(false),true));
				return $val;

			case 'd':
				if($val===null)
					return 'NULL';

				if(!ctype_digit($val))
					$val = strtotime($val);
				return "'".date('Y-m-d H:i:s',$val)."'";

			default:
				Logger::GetInstance()->Log(LOG_ERR,"SQLQuery","Unknown token : $token");
		}
	}
	
	/* Fonction ajoutées pour faire fonctionner les begin begin/commit transaction */
	public function BeginTransaction () {

	}
	
	public function LockTable($table) {
		
	}
	
	public function CommitTransaction () {

	}
	
	public function RollbackTransaction () {

	}
	
	public static function IsWithinTransaction () {
		
		return false;
		
	}
	
	/* Fin ajout pour faire fonctionner les begin begin/commit transaction */
	
}
?>
