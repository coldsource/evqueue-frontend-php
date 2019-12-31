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
	constructor(node, callback)
	{
		this.callback = callback;
		
		this.node = node;
		
		this.state = 'DISCONNECTED'; // We start in disconnected state
		this.api_promise = Promise.resolve(); // No previous query was run at this time
	}
	
	Connect()
	{
		var self = this;
		var mode = self.callback===undefined?'api':'event';
		
		return new Promise(function(resolve, reject) {
			// Connect using appropriate protocol
			if(mode=='api')
				self.ws = new WebSocket(self.node, "api");
			else
				self.ws = new WebSocket(self.node, "events");
			
			self.state = 'CONNECTING';
			
			// Event on connection
			self.ws.onopen = function (event) {
				console.log("Connected to node "+self.node+" ("+mode+")");
			};
			
			// Event on disconnection
			self.ws.onclose = function(event) {
				if(self.state=='DISCONNECTING')
					self.state = 'DISCONNECTED'; // Disconnection was requested, this is OK
				else
					self.state = 'ERROR'; // Unexpected disconnection, set state to error
				
				console.log("Disconnected from node "+self.node);
			}
			
			self.ws.onmessage = function (event) {
				var parser = new DOMParser();
				var xmldoc = parser.parseFromString(event.data, "text/xml");
				
				if(self.state == 'CONNECTING')
				{
					// We are connecting, first message sent by engine is challeng for authentication
					var challenge = xmldoc.documentElement.getAttribute("challenge");
				
					// Compute challenge response and send to complete authentication
					var user = document.querySelector("body").dataset.user;
					var passwd_hash = CryptoJS.enc.Hex.parse(document.querySelector("body").dataset.password);
					var response = CryptoJS.HmacSHA1(CryptoJS.enc.Hex.parse(challenge), passwd_hash).toString(CryptoJS.enc.Hex);
					
					self.ws.send("<auth response='"+response+"' user='"+user+"' />");
					self.state = 'AUTHENTICATED';
				}
				else if(self.state == 'AUTHENTICATED')
				{
					self.state = 'READY';
					resolve(); // We are now connected
				}
				else if(self.state=='READY')
				{
					if(mode=='event')
					{
						// Event protocol, notify callback
						self.callback(new DOMParser().parseFromString(event.data, "text/xml"));
					}
					else
					{
						// API protocol, resolve our promise to send response
						self.state = 'READY';
						self.promise.resolve(new DOMParser().parseFromString(event.data, "text/xml"));
					}
				}
			}
		});
	}
	
	Close()
	{
		if(this.state=='DISCONNECTED')
			return; // Node is not connected
		
		this.state = 'DISCONNECTING';
		this.ws.close();
	}
	
	GetState()
	{
		return this.state;
	}
	
	build_api_xml(api)
	{
		var xmldoc = new Document();
		
		var api_node = xmldoc.createElement(api.group);
		api_node.setAttribute('action',api.action);
		xmldoc.appendChild(api_node);
		
		for(var attribute in api.attributes)
			api_node.setAttribute(attribute,api.attributes[attribute]);
		
		for(var parameter in api.parameters)
		{
			var parameter_node = xmldoc.createElement('parameter');
			parameter_node.setAttribute('name',parameter);
			parameter_node.setAttribute('value',api.parameters[parameter]);
			api_node.appendChild(parameter_node);
		}
		
		return new XMLSerializer().serializeToString(xmldoc);
	}
	
	API(api)
	{
		var self = this;
		
		var evq_ready;
		if(this.state=='DISCONNECTED' || this.state=='ERROR')
			self.api_promise = this.Connect();
		
		var old_api_promise = self.api_promise;
		self.api_promise = new Promise(function(resolve, reject) {
			old_api_promise.then( () => {
				var api_cmd = self.build_api_xml(api);
				self.ws.send(api_cmd);
				if(self.callback!==undefined)
					resolve(); // We are waiting no result to complete this action
				else
					self.promise = {resolve:resolve,reject:reject}; // Promise will be resolved once response is received
			});
		});
		
		return self.api_promise;
	}
}