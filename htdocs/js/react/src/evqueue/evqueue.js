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

import {CryptoJS} from './cryptojs/core.js';

export class evQueueWS
{
	constructor(parameters)
	{
		this.callback = parameters.callback;
		this.node = parameters.node;
		this.stateChange = parameters.stateChange;
		
		this.state = 'DISCONNECTED'; // We start in disconnected state
		this.name = 'offline'; // Name will be known upon connecton
		this.last_error = false;
		this.api_promise = Promise.resolve(); // No previous query was run at this time
	}
	
	Connect()
	{
		var self = this;
		var mode = self.callback===undefined?'api':'event';
		
		return self.api_promise = new Promise(function(resolve, reject) {
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
				if(self.state!='AUTHENTICATING' && (self.state=='DISCONNECTING' || event.wasClean))
				{
					// Disconnection was requested by JS or close was requested by browser (ie page closed), this is OK
					self.last_error = false;
					self.state = 'DISCONNECTED';
					console.log("Disconnected from node "+self.node);
				}
				else
				{
					if(self.state=='CONNECTING')
					{
						self.last_error = 'CONNECTION';
						reject('Connection failed'); // Connecting failed
					}
					
					if(self.state=='AUTHENTICATING')
					{
						self.last_error = 'AUTHENTICATION';
						reject('Authentication error');
					}
					else
					{
						console.log("Node "+self.node+" is down");
						
						// Try reconnecting
						setTimeout(() => { self.api_promise = self.Connect(); }, 5000);
					}
					
					self.state = 'ERROR'; // Unexpected disconnection, set state to error
				}
				
				// Notify of state change
				if(self.stateChange!==undefined)
					self.stateChange(self.node, self.name, self.state);
			}
			
			self.ws.onmessage = function (event) {
				var parser = new DOMParser();
				var xmldoc = parser.parseFromString(event.data, "text/xml");
				
				if(self.state == 'CONNECTING')
				{
					// We are connecting, first message sent by engine is challeng for authentication
					var challenge = xmldoc.documentElement.getAttribute("challenge");
				
					// Compute challenge response and send to complete authentication
					var user = window.localStorage.user;
					var passwd_hash = CryptoJS.enc.Hex.parse(window.localStorage.password);
					var response = CryptoJS.HmacSHA1(CryptoJS.enc.Hex.parse(challenge), passwd_hash).toString(CryptoJS.enc.Hex);
					
					self.ws.send("<auth response='"+response+"' user='"+user+"' />");
					self.state = 'AUTHENTICATING';
				}
				else if(self.state == 'AUTHENTICATING')
				{
					self.state = 'READY';
					
					// Set our name
					self.name = xmldoc.documentElement.getAttribute('node');
					
					// Notify of state change
					if(self.stateChange!==undefined)
						self.stateChange(self.node, self.name, self.state);
					
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
	
	GetLastError()
	{
		return this.last_error;
	}
	
	// Build API XML from object
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
	
	// Execute API command on evqueue
	API(api)
	{
		var self = this;
		
		// Handle late connection
		var evq_ready;
		if(this.state=='DISCONNECTED' || this.state=='ERROR')
			self.api_promise = this.Connect();
		
		// This is used to serialize API commands
		var old_api_promise = self.api_promise;
		self.api_promise = new Promise(function(resolve, reject) {
			old_api_promise.then( () => {
				var api_cmd = self.build_api_xml(api);
				self.ws.send(api_cmd);
				if(self.callback!==undefined)
					resolve(); // We are waiting no result to complete this action
				else
					self.promise = {resolve:resolve,reject:reject}; // Promise will be resolved once response is received
			}, (reason) =>  reject(reason) );
		});
		
		return self.api_promise;
	}
}
