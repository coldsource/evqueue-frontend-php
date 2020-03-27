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

import {App} from './app.js';
import {evQueueCluster} from '../../evqueue/evqueue-cluster.js';
import {EventDispatcher} from '../../evqueue/event-dispatcher.js';
import {Dialogs} from '../../ui/dialogs.js';
import {Confirm} from '../../ui/confirm.js';
import {Alert} from '../../ui/alert.js';

export class evQueueComponent extends React.Component {
	constructor(props) {
		super(props);
		
		this.nodes = App.global.cluster_config;
		this.last_state = [];
		for(var i=0;i<this.nodes.length;i++)
			this.last_state[i] = 'DISCONNECTED';
		
		// Global evqueue connections
		if(evQueueComponent.global===undefined)
		{
			evQueueComponent.global = {
				event_dispatcher: new EventDispatcher(this.nodes),
				evqueue_api: new evQueueCluster(this.nodes),
			};
		}
		
		this.toggleAutorefresh = this.toggleAutorefresh.bind(this);
		if(this.evQueueEvent!==undefined)
			this.evQueueEvent = this.evQueueEvent.bind(this);
		
		this.event_dispatcher = evQueueComponent.global.event_dispatcher;
		this.evqueue_event = evQueueComponent.global.event_dispatcher.GetEVQ();
		this.evqueue_api = evQueueComponent.global.evqueue_api;
		
		this.prepareAPI = this.prepareAPI.bind(this);
		this.clusterStateChanged = this.clusterStateChanged.bind(this);
		this.event_dispatcher.SubscribeClusterState(this, this.clusterStateChanged);
		
		// Set initial state
		this.state = {
			refresh: true,
			cluster: {
				nodes_names: this.evqueue_event.GetNodes(),
				nodes_states: this.evqueue_event.GetStates()
			}
		};
	}
	
	componentWillUnmount()
	{
		this.event_dispatcher.UnsubscribeClusterState(this);
		this.event_dispatcher.Unsubscribe(this);
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
					App.warning("evQueue engine returned error : "+error+" ("+code+")");
					reject(error);
				}
				else
					resolve(xml);
			});
		});
	}
	
	simpleAPI(api,message=false,confirm=false) {
		var self = this;
		
		if(confirm!==false)
		{
			Dialogs.open(Confirm,{
				content: confirm,
				confirm: () => {
					document.documentElement.style.cursor = 'progress';
					self.API(api).then( () => {
						document.documentElement.style.cursor = 'default';
						if(message!==false)
							App.notice(message);
					});
				}
			});
		}
		else
		{
			document.documentElement.style.cursor = 'progress';
			self.API(api).then( () => {
				document.documentElement.style.cursor = 'default';
				if(message!==false)
					App.notice(message);
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
	
	Subscribe(event,api,send_now,instance_id = 0, handler = undefined)
	{
		if(handler===undefined)
			handler = this.evQueueEvent;
		
		return this.event_dispatcher.Subscribe(event, api, send_now, instance_id, this, handler);
	}
	
	Unsubscribe(event,instance_id = 0)
	{
		return this.event_dispatcher.Unsubscribe(this, event, instance_id);
	}
	
	clusterStateChanged(node, name, state)
	{
		this.setState({cluster: {
			nodes_names: this.evqueue_event.GetNodes(),
			nodes_states: this.evqueue_event.GetStates()
		}});
	}
}
