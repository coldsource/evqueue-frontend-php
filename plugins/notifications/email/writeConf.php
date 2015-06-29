<?php

class WriteConf{

	public function write($donnees){
		$texte = '<?php $email_conf = array ( ';
		foreach($donnees AS $key=>$value){
			$texte .= "'".$key."' => '".$value."',";
		}
		$texte = substr($texte, 0, -1); // on supprime la dernière virgule
		$texte .= ' );?>';
			
		return $texte;
	}
	
	public function read($fichier){
		@eval('?>'.$fichier);
		
		$xml = '<notification-type>';
		$xml .= '<email>'.htmlspecialchars($email_conf['email_from']).'</email>';
		$xml .= '<commande-mail>'.htmlspecialchars($email_conf['commande_mail']).'</commande-mail>';
		$xml .= '<smtp>'.htmlspecialchars($email_conf['smtp']).'</smtp>';
		$xml .= '</notification-type>';
		
		return $xml;
	}
	
}
