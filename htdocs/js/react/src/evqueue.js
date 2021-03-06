class evQueueWS
{
	constructor(context,callback)
	{
		this.ws = new WebSocket("ws://srvdev:5001/", "events");
		
		this.state = 'CONNECTING';
		
		this.ws.onopen = function (event) {
		  console.log("Connected to evQueue Websocket");
		};
		
		this.ws.onclose = function(event) {
		}
		
		this.context = context;
		this.callback = callback;
		
		var self = this;
		this.ws.onmessage = function (event) {
			if(self.state == 'CONNECTING')
			{
				var parser = new DOMParser();
				var xmldoc = parser.parseFromString(event.data, "text/xml");
				var challenge = xmldoc.documentElement.getAttribute("challenge");
			
				var passwd_hash = CryptoJS.SHA1("admin");
				var response = CryptoJS.HmacSHA1(CryptoJS.enc.Hex.parse(challenge), passwd_hash).toString(CryptoJS.enc.Hex);
				
				self.ws.send("<auth response='"+response+"' user='admin' />");
				self.state = 'AUTHENTICATED';
			}
			else if(self.state == 'AUTHENTICATED')
			{
				var api_cmd = btoa("<status action='query' type='workflows' />");
				self.ws.send("<event action='subscribe' type='INSTANCE_TERMINATED' api_cmd='"+api_cmd+"' />");
				self.ws.send("<event action='subscribe' type='INSTANCE_STARTED' api_cmd='"+api_cmd+"' />");
				self.state = 'READY';
			}
			else if(self.state=='READY')
			{
				var parser = new DOMParser();
				var xmldoc = parser.parseFromString(event.data, "text/xml");
				var nodes_ite = xmldoc.evaluate('/response/*',xmldoc.documentElement);
				var node;
				var ret = { node:xmldoc.documentElement.getAttribute('node'), response: [] };
				while(node = nodes_ite.iterateNext())
				{
					var obj = {};
					for(var i=0;i<node.attributes.length;i++)
						obj[node.attributes[i].name] = node.attributes[i].value;
					ret.response.push(obj);
				}
				self.callback(self.context,ret);
			}
		}
	}
}