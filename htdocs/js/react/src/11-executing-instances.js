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

class ExecutingInstances extends ListInstances {
	constructor(props) {
		super(props);
		
		this.state.now = 0;
		this.state.ready = false;
		this.timerID = false;
		this.node = '*';
	}
	
	componentDidMount() {
		var self = this;
		
		super.componentDidMount().then( () => {
			var api = { group:'status', action:'query',parameters:{type:'workflows'} };
			self.evqueue.Subscribe('INSTANCE_STARTED',api);
			self.evqueue.Subscribe('INSTANCE_TERMINATED',api);
			this.setState({ready: true});
		});
		
		this.setState({now: this.now()});
		this.timerID = setInterval(() => this.state.refresh?this.setState({now: this.now()}):this.state.now = this.now(),1000);
	}
	
	componentWillUnmount() {
		super.componentWillUnmount();
		clearInterval(this.timerID);
	}
	
	now()
	{
		return Date.now();
	}
	
	workflowDuration(wf) {
		return this.humanTime((this.state.now-Date.parse(wf.start_time))/1000);
	}
	
	workflowInfos(wf) {
		return ( <span className="faicon fa-info"></span> );
	}
	
	renderActions() {
		return (
			<td className="tdActions">
				<span className="faicon fa-ban" title="Cancel this instance"></span>
				<span className="faicon fa-bomb" title="Kill this instance"></span>
			</td>
		);
	}
	
	WorkflowStatus(wf) {
		if(wf.running_tasks - wf.queued_tasks > 0)
			return <span className="fa fa-spinner fa-pulse fa-fw" title="Task(s) running"></span>;
		
		if(wf.queued_tasks > 0)
			return <span className="faicon fa-hand-stop-o" title="Task(s) queued"></span>;
		
		if(wf.retrying_tasks > 0)
			return <span className="faicon fa-clock-o" title="A task ended badly and will retry"></span>;
	}
	
	renderNodeStatus() {
		if(!this.state.ready)
			return (<div></div>);
		
		var nodes_up = this.evqueue.GetConnectedNodes();
		var nodes_down = this.evqueue.GetNodes().length-this.evqueue.GetConnectedNodes();
		if(nodes_down==0)
			return (<a href="nodes.php"><span className="success">{nodes_up} node{nodes_up!=1?'s':''} up</span></a>);
		return (<a href="nodes.php"><span className="success">{nodes_up} node{nodes_up!=1?'s':''} up - <span className="error">{nodes_down} node{nodes_down!=1?'s':''} down</span></span></a>);
	}
	
	renderTitle() {
		var n = 0;
		for(var node in this.state.workflows)
			n += this.state.workflows[node].length;
		
		return (
			<div className="boxTitle">
				<div id="nodes-status">
					{this.renderNodeStatus()}
				</div>
				<span className="title">Executing workflows</span>&#160;({n})
				<span className={"faicon fa-refresh action"+(this.state.refresh?' fa-spin':'')} onClick={this.toggleAutorefresh}></span>
				<span className="faicon fa-rocket action" title="Launch a new workflow"></span>
				<span className="faicon fa-clock-o action" title="Retry all pending tasks"></span>
			</div>
		);
	}
}

if(document.querySelector('#executing-workflows'))
	ReactDOM.render(<ExecutingInstances />, document.querySelector('#executing-workflows'));