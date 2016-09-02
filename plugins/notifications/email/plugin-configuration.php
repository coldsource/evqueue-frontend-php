<?php

class PluginConfiguration{

	public function write($params){
		$str = '<?php $EMAIL_CONFIG = array ( ';
		foreach($params AS $key=>$value){
			$str .= "'".$key."' => '".$value."',";
		}
		$str = substr($str, 0, -1); // on supprime la dernière virgule
		$str .= ' );?>';
			
		return $str;
	}
	
	public function read($str){
		@eval('?>'.$str);
		
		$xml = '<notification-type>';
		$xml .= '<email>'.htmlspecialchars(isset($EMAIL_CONFIG['from'])?$EMAIL_CONFIG['from']:'').'</email>';
		$xml .= '</notification-type>';
		
		return $xml;
	}
	
}
