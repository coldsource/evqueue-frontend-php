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

import {evQueueCluster} from '../../evqueue/evqueue-cluster.js';
import {Dialogs} from '../../ui/dialogs.js';
import {Confirm} from '../../ui/confirm.js';
import {Alert} from '../../ui/alert.js';

export class evQueueComponent extends React.Component {
	constructor(props) {
		super(props);
		
		this.nodes = document.querySelector("body").dataset.nodes.split(',');
		this.last_state = [];
		for(var i=0;i<this.nodes.length;i++)
		{
			this.nodes[i] = this.nodes[i].replace('tcp://','ws://');
			this.last_state[i] = 'DISCONNECTED';
		}
		
		this.nodes_names = document.querySelector("body").dataset.nodesnames.split(',');
		
		this.state = {
			refresh: true,
		};
		
		// Global evqueue connections
		this.eventDispatcher= this.eventDispatcher.bind(this);
		this.stateChanged = this.stateChanged.bind(this);
		if(evQueueComponent.global===undefined)
		{
			evQueueComponent.global = {
				evqueue_event: new evQueueCluster(this.nodes, this.nodes_names, this.eventDispatcher, this.stateChanged),
				evqueue_api: new evQueueCluster(this.nodes, this.nodes_names),
				external_id: 0,
				handlers: {},
				subscriptions: []
			};
		}
		
		this.toggleAutorefresh = this.toggleAutorefresh.bind(this);
		if(this.evQueueEvent!==undefined)
			this.evQueueEvent = this.evQueueEvent.bind(this);
		
		this.evqueue_event = evQueueComponent.global.evqueue_event;
		this.evqueue_api = evQueueComponent.global.evqueue_api;
		
		this.prepareAPI = this.prepareAPI.bind(this);
	}
	
	GetNodes()
	{
		return this.nodes_names;
	}
	
	GetNodeByName(name) {
		for(var i=0;i<this.nodes_names.length;i++)
			if(this.nodes_names[i]==name)
				return i;
		return -1;
	}
	
	GetNodeByCnx(name) {
		for(var i=0;i<this.nodes.length;i++)
			if(this.nodes[i]==name)
				return i;
		return -1;
	}
	
	GetNodeByIdx(idx) {
		return this.nodes_names[idx];
	}
	
	toggleAutorefresh() {
		this.setState({refresh:!this.state.refresh});
	}
	
	shouldComponentUpdate(nextProps, nextState) {
		if(nextState.refresh)
			return true;
		else if(this.state.refresh)
			return true;
		return false;
	}
	
	eventDispatcher(data) {
		var external_id = parseInt(data.documentElement.getAttribute('external-id'));
		evQueueComponent.global.handlers[external_id](data);
	}
	
	xpath(xpath,context)
	{
		var nodes_ite = context.ownerDocument.evaluate(xpath,context);
		if(nodes_ite.resultType==1)
			return nodes_ite.numberValue;
		
		var ret = [];
		var node;
		while(node = nodes_ite.iterateNext())
		{
			var obj = {domnode:node};
			
			for(var i=0;i<node.attributes.length;i++)
				obj[node.attributes[i].name] = node.attributes[i].value;
			ret.push(obj);
			
		}
		
		return ret;
	}
	
	parseResponse(xmldoc,output_xpath_filter="/response/*")
	{
		var ret = { response: [] };
		
		var root = xmldoc.documentElement;
		for(var i=0;i<root.attributes.length;i++)
			ret[root.attributes[i].name] = root.attributes[i].value;
		
		ret.response = this.xpath(output_xpath_filter,xmldoc.documentElement);
		
		return ret;
	}
	
	API(api) {
		var self = this;
		return new Promise(function(resolve, reject) {
			self.evqueue_api.API(api).then( (xml) => {
				if(xml && xml.documentElement.getAttribute('error'))
				{
					var error = xml.documentElement.getAttribute('error');
					var code = xml.documentElement.getAttribute('error-code');
					Dialogs.open(Alert,{content: (
						<div>
							evQueue engine returned error :
							<br />
							<br />Code : <b>{code}</b>
							<br />Message : <b>{error}</b>
							<br />
							<br />It is likely that your last action didn't worked
						</div>
					)});
					reject(error);
				}
				else
					resolve(xml);
			});
		});
	}
	
	Subscribe(event,api,send_now,instance_id = 0, handler = undefined)
	{
		var external_id = ++evQueueComponent.global.external_id;
		evQueueComponent.global.handlers[external_id] = handler!==undefined?handler:this.evQueueEvent;
		evQueueComponent.global.subscriptions.push({
			event:event,
			api: api,
			instance: this,
			instance_id: instance_id,
			external_id:external_id,
		});
		
		return this.subscribe(event,api,send_now,instance_id,external_id);
	}
	
	subscribe(event,api,send_now,instance_id,external_id)
	{
		var api_cmd_b64 = btoa(this.evqueue_event.BuildAPI(api));
		
		var attributes = {
			type: event,
			api_cmd: api_cmd_b64,
			send_now: (send_now?'yes':'no'),
			external_id: external_id
		};
		
		if(instance_id)
			attributes.instance_id = instance_id;
		
		return this.evqueue_event.API({
			node: api.node,
			group: 'event',
			action: 'subscribe',
			attributes: attributes
		})
	}
	
	Unsubscribe(event,instance_id = 0)
	{
		// Find correct subsciption
		var subscriptions = evQueueComponent.global.subscriptions;
		var external_id = 0;
		for(var i=0;i<subscriptions.length;i++)
		{
			if(subscriptions[i].event==event && subscriptions[i].instance==this && subscriptions[i].instance_id==instance_id)
			{
				external_id = subscriptions[i].external_id;
				break;
			}
		}
		
		var attributes = {
			type: event,
			external_id: external_id
		};
		
		if(instance_id)
			attributes.instance_id = instance_id;
		
		return this.evqueue_event.API({
			node:'*',
			group: 'event',
			action: 'unsubscribe',
			attributes: attributes
		});
	}
	
	UnsubscribeAll()
	{
		return this.evqueue_event.API({
			node:api.node,
			group: 'event',
			action: 'unsubscribeall'
		});
	}
	
	simpleAPI(api,message=false,confirm=false) {
		var self = this;
		
		if(confirm!==false)
		{
			Dialogs.open(Confirm,{
				content: confirm,
				confirm: () => {
					self.API(api).then( () => {
						if(message!==false)
							Message(message);
					});
				}
			});
		}
		else
		{
			self.API(api).then( () => {
				if(message!==false)
					Message(message);
			});
		}
	}
	
	prepareAPI(event) {
		var api = this.state.api;
		if(event.target.name=='node')
			api.node = event.target.value;
		else if(event.target.name.substr(0,10)=='parameter_')
			api.parameters[event.target.name.substr(10)] = event.target.value;
		else
			api.attributes[event.target.name] = event.target.value;
		this.setState({api:api});
	}
	
	stateChanged(node, state) {
		var node_idx = this.GetNodeByCnx(node);
		var node_name = this.GetNodeByIdx(node_idx);
		
		if(this.last_state[node_idx]=='ERROR' && state=='READY')
		{
			var subscriptions = evQueueComponent.global.subscriptions;
			for(var i=0;i<subscriptions.length;i++)
			{
				if(subscriptions[i].api.node=='*' || subscriptions[i].api.node==node_name)
				{
					// Change API commande to reconnect only to the needed node
					var api = {};
					Object.assign(api,subscriptions[i].api);
					api.node = node_name;
					this.subscribe(subscriptions[i].event,api,true,subscriptions[i].instance_id,subscriptions[i].external_id)
				}
			}
		}
		
		this.last_state[node_idx] = state;
		
		if(this.clusterStateChanged!==undefined)
			this.clusterStateChanged(node, state);
	}
}
