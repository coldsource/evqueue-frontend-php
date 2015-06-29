<?php

class PluginConfiguration{

	public function write($params){
		$str = '<?php $email_conf = array ( ';
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
		$xml .= '<email>'.htmlspecialchars($email_conf['email_from']).'</email>';
		$xml .= '<mail-command>'.htmlspecialchars($email_conf['commande_mail']).'</mail-command>';
		$xml .= '<smtp>'.htmlspecialchars($email_conf['smtp']).'</smtp>';
		$xml .= '</notification-type>';
		
		return $xml;
	}
	
}
