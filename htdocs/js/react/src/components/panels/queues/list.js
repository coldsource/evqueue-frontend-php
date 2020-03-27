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

import {evQueueComponent} from '../../base/evqueue-component.js';
import {Panel} from '../../../ui/panel.js';
import {Tabs} from '../../../ui/tabs.js';
import {Tab} from '../../../ui/tab.js';

export class ListQueues extends evQueueComponent {
	constructor(props) {
		super(props);
		
		this.state.queues = [];
		this.state.idx = 0;
		
		this.renderTabs = this.renderTabs.bind(this);
	}
	
	componentDidMount() {
		var api = { node:'*', group:'statistics',action:'query',attributes:{type:'queue'} };
		this.Subscribe('QUEUE_ENQUEUE',api);
		this.Subscribe('QUEUE_DEQUEUE',api);
		this.Subscribe('QUEUE_EXECUTE',api);
		this.Subscribe('QUEUE_TERMINATE',api,true);
	}
	
	evQueueEvent(response) {
		var data = this.parseResponse(response,'/response/statistics/*');
		
		var queues = this.state.queues;
		var node_idx = this.evqueue_event.GetNodeByName(data.node);
		queues[node_idx] = data.response;
		
		this.setState({queues: queues});
	}
	
	renderNodesList() {
		var ret = [];
		var nodes = this.state.cluster.nodes_names;
		for(var i=0;i<nodes.length;i++)
		{
			var node = nodes[i];
			ret.push(<Tab key={node} title={node} />);
		}
		return ret;
	}
	
	renderQueuesList(idx) {
		if(idx>=this.state.queues)
			return;
		
		return this.state.queues[idx].map((queue) => {
			var running_prct = queue.running_tasks / queue.concurrency * 100;
			var queue_prct = queue.size>20?100:queue.size/20*100;
			return (
				<div className="queue prctgradient" key={queue.name}>
					<div className="queue-inner" style={{background:'linear-gradient(to top,transparent '+running_prct+'%,white '+running_prct+'%)'}}>
						<h2>{queue.name}</h2>
						<div>Scheduler : <span className="bold">{queue.scheduler}</span></div>
						<div>Concurrency : <span className="bold">{queue.concurrency}</span></div>
						<div><span className="bold">{queue.running_tasks}</span> task{queue.running_tasks?'s':''} (<span className="bold">{running_prct} %</span>) running.</div>
						<div><span className="fa fa-hand-stop-o"></span> <span className="bold">{queue.size}</span> awaiting task{queue.size>1?'s':''} in queue.</div>
					</div>
				</div>
			);
		});
	}
	
	renderQueues(idx) {
		if(this.state.cluster.nodes_states[idx]!='READY')
			return (<div className="center error">Engine is offline</div>);
		
		return (
			<div className="queues">
				{ this.renderQueuesList(idx) }
			</div>
		);
	}
	
	renderTabs(idx) {
		if(this.state.queues.length==0)
			return;
		
		return this.renderQueues(idx);
	}

	render() {
		var actions = [
			{icon:'fa-refresh '+(this.state.refresh?' fa-spin':''), callback:this.toggleAutorefresh}
		];
		
		return (
			<div id="listqueues">
				<Panel left="" title="Queues States" actions={actions}>
					<Tabs render={this.renderTabs}>
						{ this.renderNodesList() }
					</Tabs>
				</Panel>
			</div>
		);
	}
}
