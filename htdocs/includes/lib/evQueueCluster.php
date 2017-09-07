<?php 
require_once __DIR__ . '/evQueue.php';


class evQueueCluster {
	
	private $node_schemes = [];
	private $user_login = false;
	private $user_pwd = false;
	private $user_pwd_hashed = false;
	private $last_request_status = false;
	
	private $profile = false;
	
	
	public function __construct ($node_schemes, $user_login=false, $user_pwd=false, $user_pwd_hashed=false) {
		$this->node_schemes = $node_schemes;
		$this->user_login = $user_login;
		$this->user_pwd = $user_pwd;
		$this->user_pwd_hashed = $user_pwd_hashed;
	}
	
	public function SetUserLoginPwd ($user_login, $user_pwd, $user_pwd_hashed=false) {
		$this->user_login = $user_login;
		$this->user_pwd = $user_pwd;
		$this->user_pwd_hashed = $user_pwd_hashed;
	}
	
	public function Api ($group, $action = false, $attributes = [], $parameters = [], $node_name = false) {
		
		$full_xml = '';
		
		$nodes_requested = 0;
		$this->last_request_status = [];
		foreach ($this->node_schemes as $scheme) {
			
			try {
				$evqueue_node =
					($this->user_login !== false) ?
					new evQueue($scheme, $this->user_login, $this->user_pwd, $this->user_pwd_hashed) :
					new evQueue($scheme);
				
				if ($node_name !== false && $node_name !== '*') {
					$evqueue_node->Api('ping');
					$name = $evqueue_node->GetParserRootAttributes()['NODE'];
					if ($name !== $node_name)
						continue;
				}
				
				$full_xml .= $evqueue_node->Api($group, $action, $attributes, $parameters);
				if ($this->profile === false)
					$this->profile = $evqueue_node->GetProfile();
				
				$name = $evqueue_node->GetParserRootAttributes()['NODE'];
				
				$nodes_requested++;
				$this->last_request_status[$scheme] = $name;
				
				if($node_name !== '*')
					break;
			}
			catch(Exception $e)
			{
				$this->last_request_status[$scheme] = false;
				
				if ($e->getCode() === evQueue::ERROR_ENGINE)
				{
					if ($node_name === '*') {
						$dom = new DOMDocument();
						$dom->loadXML('<response />');
						$dom->documentElement->setAttribute("err", $e->GetMessage());
						$dom->documentElement->setAttribute("errid", $e->GetCode());
						$dom->documentElement->setAttribute("scheme", $scheme);
						$full_xml .= $dom->saveXML($dom->documentElement);
					}
					continue;
				}
				
				throw $e;
			}
		}
		
		if($nodes_requested==0)
			throw new Exception('No running nodes',evQueue::ERROR_ENGINE);
		
		return $node_name === '*' ? "<cluster-response>$full_xml</cluster-response>" : $full_xml;
	}
	
	public function GetNodeNames()
	{
		$xml = $this->Api('ping',false,[],[],'*');
    $dom = new DOMDocument();
    $dom->loadXML($xml);
    $xp = new DOMXPath($dom);
    
		$node_names = [];
    foreach ($xp->query('/cluster-response/response/@node') as $node)
      $node_names[] = $node->nodeValue;
		
		return $node_names;
	}
	
	public function GetLastRequestStatus()
	{
		return $this->last_request_status;
	}
	
	public function GetProfile () {
		return $this->profile;
	}
	
	public function GetConfigurationEntry($name) {
		$xml = $this->Api('status','query',[ 'type' => 'configuration' ]);
		return evQueue::ParseConfigurationEntry($xml,$name);
  }
	
}


?>