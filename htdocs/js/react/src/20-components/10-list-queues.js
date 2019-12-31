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

class ListQueues extends evQueueComponent {
	constructor(props) {
		super(props);
		
		this.state.nodes = [];
		this.state.queues = [];
		this.state.idx = 0;
		
		this.changeNode = this.changeNode.bind(this);
		this.node = 0;
	}
	
	subscribe() {
		var api = { group:'statistics',action:'query',attributes:{type:'queue'} };
		this.evqueue.Subscribe('QUEUE_ENQUEUE',api);
		this.evqueue.Subscribe('QUEUE_DEQUEUE',api);
		this.evqueue.Subscribe('QUEUE_EXECUTE',api);
		this.evqueue.Subscribe('QUEUE_TERMINATE',api,true);
	}
	
	componentDidMount() {
		var self = this;
		super.componentDidMount().then( () => {
			self.subscribe();
			self.setState({nodes:self.GetNodes()});
		});
	}
	
	changeNode(event) {
		var self = this;
		self.setState({idx:event.target.dataset.idx});
		this.evqueue.ChangeNode(event.target.dataset.idx).then( () => {
			self.subscribe();
		});
	}
	
	evQueueEvent(response) {
		var data = this.parseResponse(response,'/response/statistics/*');
		this.setState({queues: data.response});
	}
	
	renderQueuesList() {
		return this.state.queues.map((queue) => {
			var running_prct = queue.running_tasks / queue.concurrency * 100;
			var queue_prct = queue.size>20?100:queue.size/20*100;
			return (
				<tr key={queue.name} className="evenOdd">
					<td>{queue.name}</td>
					<td className="center">{queue.scheduler}</td>
					<td className="center">{queue.concurrency}</td>
					<td>
						<div className="prctgradient">
							<div style={{background:'linear-gradient(to right,transparent '+running_prct+'%,white '+running_prct+'%)'}}>
								<div style={{ textAlign:'right',width:running_prct+'%' }}>{Math.round(running_prct)}&#160;%</div>
							</div>
						</div>
						{queue.running_tasks} task{queue.running_tasks?'s':''} running.
					</td>
					<td>
						<div className="prctgradient">
							<div style={{ background:"linear-gradient(to right,transparent "+queue_prct+"%,white "+queue_prct+"%)" }}>
								<div style={{ textAlign:'right',width:queue_prct+'%' }}>&#160;</div>
							</div>
						</div>
						{queue.size} awaiting task{queue.size>1?'s':''} in queue.
					</td>
				</tr>
			);
		});
	}
	
	renderNodesList() {
		var ret = [];
		for(var i=0;i<this.state.nodes.length;i++)
		{
			var node = this.state.nodes[i];
			ret.push(<li key={node} data-idx={i} className={this.state.idx==i?'selected':''} onClick={this.changeNode}>{node}</li>);
		}
		return ret;
	}
	
	renderQueues() {
		return (
			<div className="workflow-list">
				<table>
					<thead>
						<tr>
							<th>Name</th>
							<th>Scheduler</th>
							<th>Concurrency</th>
							<th>Running tasks</th>
							<th>Queued tasks</th>
						</tr>
					</thead>
					<tbody>{ this.renderQueuesList() }</tbody>
				</table>
			</div>
		);
	}

	render() {
		return (
			<div>
				<div className="boxTitle">
					<span className="title">aQueues States</span>
					<span className={"faicon fa-refresh action"+(this.state.refresh?' fa-spin':'')} onClick={this.toggleAutorefresh}></span>
				</div>
				<ul className="reacttabs">{ this.renderNodesList() }</ul>
				{ this.renderQueues() }
			</div>
		);
	}
}

if(document.querySelector('#queues'))
	ReactDOM.render(<ListQueues />, document.querySelector('#queues'));