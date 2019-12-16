class evQueueWS
{
	constructor(context,subscriptions,callback)
	{
		this.ws = new WebSocket("ws://srvdev:5001/", "events");
		
		this.subscriptions = subscriptions;
		
		this.time_delta = 0;
		
		this.state = 'CONNECTING';
		
		this.ws.onopen = function (event) {
		  console.log("Connected to evQueue Websocket");
		};
		
		this.ws.onclose = function(event) {
			console.log("Disconnected from evQueue Websocket");
		}
		
		this.context = context;
		this.callback = callback;
		
		var self = this;
		this.ws.onmessage = function (event) {
			var parser = new DOMParser();
			var xmldoc = parser.parseFromString(event.data, "text/xml");
			
			if(self.state == 'CONNECTING')
			{
				var challenge = xmldoc.documentElement.getAttribute("challenge");
			
				var passwd_hash = CryptoJS.SHA1("admin");
				var response = CryptoJS.HmacSHA1(CryptoJS.enc.Hex.parse(challenge), passwd_hash).toString(CryptoJS.enc.Hex);
				
				self.ws.send("<auth response='"+response+"' user='admin' />");
				self.state = 'AUTHENTICATED';
			}
			else if(self.state == 'AUTHENTICATED')
			{
				var time = xmldoc.documentElement.getAttribute("time");
				self.time_delta = Date.now()-Date.parse(time);
				
				// Subscribe to wanted events
				for(var i=0;i<self.subscriptions.length;i++)
				{
					var api_cmd_b64 = btoa(self.subscriptions[i].api);
					self.ws.send("<event action='subscribe' type='"+self.subscriptions[i].event+"' api_cmd='"+api_cmd_b64+"' />");
				}
				
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
	
	Close() {
		this.ws.close();
	}
	
	GetTimeDelta() {
		return this.time_delta;
	}
}