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
  * Author: Thibault Kummer
  */

class evQueueWS
{
	constructor(context,callback)
	{
		this.context = context;
		this.callback = callback;
	}
	
	Connect(context,subscriptions,callback)
	{
		var self = this;
		
		return new Promise(function(resolve, reject) {
		
			self.ws = new WebSocket("ws://srvdev:5001/", "events");
			
			self.time_delta = 0;
			
			self.state = 'CONNECTING';
			
			self.ws.onopen = function (event) {
			console.log("Connected to evQueue Websocket");
			};
			
			self.ws.onclose = function(event) {
				console.log("Disconnected from evQueue Websocket");
			}
			
			self.ws.onmessage = function (event) {
				var parser = new DOMParser();
				var xmldoc = parser.parseFromString(event.data, "text/xml");
				
				if(self.state == 'CONNECTING')
				{
					var challenge = xmldoc.documentElement.getAttribute("challenge");
				
					var user = document.querySelector("body").dataset.user;
					var passwd_hash = CryptoJS.enc.Hex.parse(document.querySelector("body").dataset.password);
					var response = CryptoJS.HmacSHA1(CryptoJS.enc.Hex.parse(challenge), passwd_hash).toString(CryptoJS.enc.Hex);
					
					self.ws.send("<auth response='"+response+"' user='"+user+"' />");
					self.state = 'AUTHENTICATED';
				}
				else if(self.state == 'AUTHENTICATED')
				{
					var time = xmldoc.documentElement.getAttribute("time");
					self.time_delta = Date.now()-Date.parse(time);
					
					self.state = 'READY';
					resolve();
				}
				else if(self.state=='READY')
				{
					var parser = new DOMParser();
					var xmldoc = parser.parseFromString(event.data, "text/xml");
					
					var ret = { response: [] };
					
					var root = xmldoc.documentElement;
					for(var i=0;i<root.attributes.length;i++)
						ret[root.attributes[i].name] = root.attributes[i].value;
					
					var nodes_ite = xmldoc.evaluate('/response/*',xmldoc.documentElement);
					var node;
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
		});
	}
	
	Close() {
		this.ws.close();
	}
	
	GetTimeDelta() {
		return this.time_delta;
	}
	
	Subscribe(event,group,action,parameters)
	{
		var xmldoc = new Document();
		var api_node = xmldoc.createElement(group);
		api_node.setAttribute('action',action);
		xmldoc.appendChild(api_node);
		for(var parameter in parameters)
			api_node.setAttribute(parameter,parameters[parameter]);
		var api_cmd = new XMLSerializer().serializeToString(xmldoc);
		
		var api_cmd_b64 = btoa(api_cmd);
		this.ws.send("<event action='subscribe' type='"+event+"' api_cmd='"+api_cmd_b64+"' />");
	}
	
	UnsubscribeAll(api_cmd,event)
	{
		this.ws.send("<event action='unsubscribeall' />");
	}
}