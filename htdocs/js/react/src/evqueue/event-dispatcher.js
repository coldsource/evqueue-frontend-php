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

'use strict';

import {evQueueCluster} from './evqueue-cluster.js';

export class EventDispatcher {
	constructor(nodes) {
		// Initialize object
		this.nodes = nodes;
		this.last_state = [];
		for(var i=0;i<this.nodes.length;i++)
			this.last_state[i] = 'DISCONNECTED';
		
		// Instanciate API and Event clusters
		this.StateChange = this.StateChange.bind(this);
		this.Dispatch = this.Dispatch.bind(this);
		this.evqueue_event = new evQueueCluster(this.nodes, this.Dispatch, this.StateChange);
		
		// States for evqueue events
		this.external_id = 0;
		this.handlers = {};
		this.external_id_ref = {};
		this.subscriptions = [];
		
		// State for cluster events
		this.cluster_handlers = [];
	}
	
	GetEVQ()
	{
		return this.evqueue_event;
	}
	
	SubscribeClusterState(instance, handler)
	{
		this.cluster_handlers.push({
			instance: instance,
			handler: handler
		});
	}
	
	UnsubscribeClusterState(instance)
	{
		for(var i=0;i<this.cluster_handlers.length;i++)
		{
			if(this.cluster_handlers[i].instance==instance)
			{
				this.cluster_handlers.splice(i,1);
				break;
			}
		}
	}
	
	Subscribe(event,api,send_now,instance_id = 0, instance, handler)
	{
		// Store state
		var external_id = ++this.external_id;
		this.handlers[external_id] = handler;
		this.external_id_ref[external_id] = api.ref;
		this.subscriptions.push({
			event:event,
			api: api,
			instance: instance,
			instance_id: instance_id,
			external_id:external_id,
		});
		
		return this.evqueue_event.Subscribe(event,api,send_now,instance_id,external_id);
	}
	
	Unsubscribe(instance, event = undefined, instance_id = 0)
	{
		// Find correct subsciption
		var subscriptions = this.subscriptions;
		var external_id = 0;
		for(var i=0;i<subscriptions.length;i++)
		{
			if(subscriptions[i].instance==instance && (event===undefined || subscriptions[i].event==event) && (instance_id==0 || subscriptions[i].instance_id==instance_id))
			{
				external_id = subscriptions[i].external_id;
				subscriptions.splice(i,1);
				delete this.handlers[external_id];
				delete this.external_id_ref[external_id];
				this.evqueue_event.Unsubscribe(event, external_id, instance_id);
				return;
			}
		}
	}
	
	Dispatch(data) {
		var external_id = parseInt(data.documentElement.getAttribute('external-id'));
		var ref = this.external_id_ref[external_id];
		this.handlers[external_id](data, ref);
	}
	
	StateChange(node, name, state) {
		var node_idx = this.evqueue_event.GetNodeByCnx(node);
		
		// Resubscribe events if node comes UP
		if(this.last_state[node_idx]=='ERROR' && state=='READY')
		{
			var subscriptions = this.subscriptions;
			for(var i=0;i<subscriptions.length;i++)
			{
				if(subscriptions[i].api.node=='*' || subscriptions[i].api.node==name)
				{
					// Change API commande to reconnect only to the needed node
					var api = {};
					Object.assign(api,subscriptions[i].api);
					api.node = name;
					this.evqueue_event.Subscribe(subscriptions[i].event,api,true,subscriptions[i].instance_id,subscriptions[i].external_id);
				}
			}
		}
		
		this.last_state[node_idx] = state;
		
		// Notify subscribers
		for(var i=0;i<this.cluster_handlers.length;i++)
			this.cluster_handlers[i].handler(node, name, state);
	}
}
