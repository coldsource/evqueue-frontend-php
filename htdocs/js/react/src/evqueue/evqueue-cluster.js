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
	constructor(nodes_desc, nodes_names, eventCallback, stateChange)
	{
		this.stateChangeCallback = stateChange;
		this.stateChange = this.stateChange.bind(this);
		
		this.nodes = [];
		for(var i=0;i<nodes_desc.length;i++)
			this.nodes.push(new evQueueWS({
				node: nodes_desc[i],
				callback: eventCallback,
				stateChange: this.stateChange
			}));
		
		this.nodes_names = nodes_names;
	}
	
	GetNodeByName(name)
	{
		if(name=='*')
			return '*';
		
		for(var i=0;i<this.nodes_names.length;i++)
			if(this.nodes_names[i]==name)
				return i;
		return -1;
	}
	
	GetConnectedNodes()
	{
		var connected_nodes = 0;
		for(var i=0;i<this.nodes.length;i++)
		{
			if(this.nodes[i].GetState()=='READY')
				connected_nodes++;
		}
		return connected_nodes;
	}
	
	GetErrorNodes()
	{
		var error_nodes = 0;
		for(var i=0;i<this.nodes.length;i++)
		{
			if(this.nodes[i].GetState()=='ERROR')
				error_nodes++;
		}
		return error_nodes;
	}
	
	GetUpNode()
	{
		for(var i=0;i<this.nodes.length;i++)
		{
			if(this.nodes[i].GetState()=='READY' || this.nodes[i].GetState()=='DISCONNECTED')
				return i;
		}
		
		return -1;
	}
	
	API(api)
	{
		var self = this;
		
		var node = api.node!==undefined?self.GetNodeByName(api.node):this.GetUpNode();
		if(node==-1)
			return Promise.reject('Cluster error : unknown node');
		
		if(node=='*')
		{
			return new Promise(function(resolve, reject) {
				var resolved = 0;
				for(var i=0;i<self.nodes.length;i++)
				{
					self.nodes[i].API(api).then( () => {
						resolved++;
						if(resolved==self.nodes.length)
							resolve();
					});
				}
			});
		}
		else
			return self.nodes[node].API(api);
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
	
	stateChange(node,state) {
		if(this.stateChangeCallback!==undefined)
			this.stateChangeCallback(node,state);
	}
}
