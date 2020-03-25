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

import {evQueueWS} from './evqueue.js';

export class evQueueCluster
{
	constructor(nodes_desc, eventCallback, stateChange)
	{
		this.stateChangeCallback = stateChange;
		this.stateChange = this.stateChange.bind(this);
		
		// Init global state
		if(this.stateChangeCallback!==undefined)
		{
			evQueueCluster.global = {};
			evQueueCluster.global.nodes_names = [];
			evQueueCluster.global.nodes_states = [];
			for(var i=0;i<nodes_desc.length;i++)
			{
				evQueueCluster.global.nodes_names.push('offline');
				evQueueCluster.global.nodes_states.push('DISCONNECTED');
			}
		}
		
		this.nodes_desc = nodes_desc;
		this.nodes = [];
		for(var i=0;i<nodes_desc.length;i++)
		{
			var evq = new evQueueWS({
				node: nodes_desc[i],
				callback: eventCallback,
				stateChange: stateChange===undefined?undefined:this.stateChange
			});
			
			if(this.stateChangeCallback!==undefined)
				evq.Connect();
			
			this.nodes.push(evq);
		}
	}
	
	GetNodes()
	{
		return evQueueCluster.global.nodes_names;
	}
	
	GetStates()
	{
		return evQueueCluster.global.nodes_states;
	}
	
	GetNodeByCnx(cnx) {
		for(var i=0;i<this.nodes_desc.length;i++)
			if(this.nodes_desc[i]==cnx)
				return i;
		
		return -1;
	}
	
	GetNodeByName(name)
	{
		if(name=='*')
			return '*';
		
		var nodes_names = evQueueCluster.global.nodes_names;
		for(var i=0;i<nodes_names.length;i++)
			if(nodes_names[i]==name)
				return i;
		return -1;
	}
	
	GetUpNode()
	{
		for(var i=0;i<this.nodes.length;i++)
		{
			if(this.nodes[i].GetState()!='ERROR')
				return i;
		}
		
		return -1;
	}
	
	
	_api(api, resolve, reject)
	{
		var self = this;
		
		// Connecttion requested to all nodes, success only if all nodes are successful
		if(api.node=='*')
		{
			var resolved = 0;
			var data = [];
			for(var i=0;i<self.nodes.length;i++)
			{
				self.nodes[i].API(api).then(
					(xml) => {
						resolved++;
						data.push(xml);
						if(resolved==self.nodes.length)
							resolve(data);
					},
					(reason) => reject(reason)
				);
			}
		}
		else
		{
			// Specific node is requested
			if(api.node!==undefined)
			{
				var node = self.GetNodeByName(api.node)
				if(node==-1)
					return reject('Cluster error : unknown node');
				
				return self.nodes[node].API(api).then(
					(xml) => resolve(xml),
					(reason) => reject(reason)
				);
			}
			
			// Request for any up nodes, try to find one answering
			var node = self.GetUpNode();
			if(node==-1)
				return reject('Cluster error : no nodes up');
			
			self.nodes[node].API(api).then(
				(xml) => resolve(xml),
				(reason) => {
					if(self.nodes[node].GetLastError()=='AUTHENTICATION')
						reject(reason); // No need to retry on authentication error
					else
						self._api(api, resolve, reject); // Connection error, try another node
				}
			);
		}
	}
	
	API(api)
	{
		var self = this;
		
		return new Promise(function(resolve, reject) {
			return self._api(api, resolve, reject);
		});
	}
	
	BuildAPI(api)
	{
		return this.nodes[0].build_api_xml(api);
	}
	
	Close()
	{
		for(var i=0;i<this.nodes.length;i++)
			this.nodes[i].Close();
	}
	
	stateChange(node, name, state) {
		var idx = this.GetNodeByCnx(node);
		evQueueCluster.global.nodes_names[idx] = name;
		evQueueCluster.global.nodes_states[idx] = state;
		
		if(this.stateChangeCallback!==undefined)
			this.stateChangeCallback(node, name, state);
	}
	
	Subscribe(event,api,send_now,instance_id,external_id)
	{
		var api_cmd_b64 = btoa(this.BuildAPI(api));
		
		var attributes = {
			type: event,
			api_cmd: api_cmd_b64,
			send_now: (send_now?'yes':'no'),
			external_id: external_id
		};
		
		if(instance_id)
			attributes.instance_id = instance_id;
		
		return this.API({
			node: api.node,
			group: 'event',
			action: 'subscribe',
			attributes: attributes
		});
	}
	
	Unsubscribe(event, external_id, instance_id = 0)
	{
		var attributes = {
			type: event,
			external_id: external_id
		};
		
		if(instance_id)
			attributes.instance_id = instance_id;
		
		return this.API({
			node:'*',
			group: 'event',
			action: 'unsubscribe',
			attributes: attributes
		});
	}
}
