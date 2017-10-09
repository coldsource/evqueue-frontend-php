<?php 
require_once __DIR__ . '/evQueueCluster.php';


class evQueueProxy {
	
	private $cluster = false;
	
	public function __construct ($node_schemes, $user_login=false, $user_pwd=false, $user_pwd_hashed=false) {
		$conf = is_array($node_schemes)?$node_schemes:[$node_schemes];
		
		$this->cluster = new evQueueCluster($conf, $user_login, $user_pwd, $user_pwd_hashed);
	}
	
	public function Run()
	{
		if(!isset($_POST['group']))
			return;
		
		$action = isset($_POST['action']) ? $_POST['action']:false;
		$attributes = isset($_POST['attributes']) ? $_POST['attributes']:[];
		$parameters = isset($_POST['parameters']) ? $_POST['parameters']:[];
		$node_name = isset($_POST['node']) ? $_POST['node'] : false;
		
		header('content-type: text/xml');
	
		try
		{
			$xml = $this->cluster->Api($_POST['group'], $action, $attributes, $parameters, $node_name);
		}
		catch(Exception $e)
		{
			echo "<error>".htmlspecialchars($e->getMessage())."</error>";
			die(-1);
		}
		
		echo $xml;
		
		die();
	}
}


?>