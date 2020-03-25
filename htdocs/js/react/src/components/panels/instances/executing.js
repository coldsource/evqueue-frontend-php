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

import {App} from '../../base/app.js';
import {ListInstances} from './list.js';
import {WorkflowLauncher} from '../../dialogs/workflows/launcher.js';
import {Panel} from '../../../ui/panel.js';
import {Dialogs} from '../../../ui/dialogs.js';
import {Dialog} from '../../../ui/dialog.js';
import {Confirm} from '../../../ui/confirm.js';

export class ExecutingInstances extends ListInstances {
	constructor(props) {
		super(props,'*');
		
		this.state.nodes_up = 0;
		this.state.nodes_down = 0;
		this.state.now = 0;
		this.timerID = false;
		
		this.retry = this.retry.bind(this);
	}
	
	componentDidMount() {
		var api = { node:'*', group:'status', action:'query',attributes:{type:'workflows'} };
		this.Subscribe('INSTANCE_STARTED',api);
		this.Subscribe('INSTANCE_TERMINATED',api,true);
		
		this.setState({now: this.now()});
		
		this.timerID = setInterval(() => this.state.refresh?this.setState({now: this.now()}):this.state.now = this.now(),1000);
	}
	
	componentWillUnmount() {
		super.componentWillUnmount();
		
		clearInterval(this.timerID);
	}
	
	now() {
		return Date.now();
	}
	
	workflowDuration(wf) {
		return this.humanTime((this.state.now-Date.parse(wf.start_time))/1000);
	}
	
	workflowInfos(wf) {
		return ( <span className="faicon fa-info"></span> );
	}
	
	renderActions(wf) {
		return (
			<td className="tdActions">
				<span className="faicon fa-ban" title="Cancel this instance" onClick={ () => this.cancel(wf) }></span>
				<span className="faicon fa-bomb" title="Kill this instance" onClick={ () => this.cancel(wf,true) }></span>
			</td>
		);
	}
	
	cancel(wf,killtasks = false) {
		var self = this;
		var message;
		if(killtasks)
			message = "You are about to kill this instance.\nRunning tasks will be killed with SIGKILL and workflow will end immediately.\nThis can lead to inconsistancies in running tasks.";
		else
			message = "You are about to cancel this instance.\nRunning tasks will continue to run normally but no new task will be launched.\nRetry schedules will be disabled.";
		
		Dialogs.open(Confirm,{
			content: message,
			confirm: () => { self._cancel(wf,killtasks) }
		});
	}
	
	_cancel(wf,killtasks = false) {
		var self = this;
		
		this.API({
			group: 'instance',
			action: 'cancel',
			attributes: { id:wf.id },
			node: wf.node_name
		}).then( () => {
			App.notice('Canceled instance '+wf.id);
			if(killtasks)
			{
				this.API({
					group: 'instance',
					action: 'query',
					attributes: { id:wf.id }
				}).then( (data) => {
					var tasks = self.xpath("//task[@status='EXECUTING']",data.documentElement);
					for(var i=0;i<tasks.length;i++)
					{
						var task_name = tasks[i].name?tasks[i].name:tasks[i].path;
						this.simpleAPI({
							group: 'instance',
							action: 'killtask',
							attributes: { 'id':wf.id, 'pid':tasks[i].pid },
							node: wf.node_name
						}, "'Killed task "+task_name);
					}
				});
			}
		});
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
		var nodes_up = 0;
		var nodes_down = 0;
		var states = this.state.cluster.nodes_states;
		for(var i=0;i<states.length;i++)
		{
			if(states[i]=='READY')
				nodes_up++;
			else if(states[i]=='ERROR')
				nodes_down++;
		}
		
		if(nodes_down==0)
			return (<div id="nodes-status"><a href="nodes.php"><span className="success">{nodes_up} node{nodes_up!=1?'s':''} up</span></a></div>);
		return (<div id="nodes-status"><a href="nodes.php"><span className="success">{nodes_up} node{nodes_up!=1?'s':''} up - <span className="error">{nodes_down} node{nodes_down!=1?'s':''} down</span></span></a></div>);
	}
	
	renderTitle() {
		var n = 0;
		for(var node in this.state.workflows)
			n += this.state.workflows[node].response.length;
		
		var actions = [
			{icon: 'fa-clock-o',callback:this.retry},
			{icon: 'fa-rocket',callback:() => { Dialogs.open(WorkflowLauncher,{}) }},
			{icon:'fa-refresh '+(this.state.refresh?' fa-spin':''), callback:this.toggleAutorefresh}
		];
		
		return (
			<Panel left={this.renderNodeStatus()} title={'Executing workflows ('+ n +')'} actions={actions} />
		);
	}
	
	retry() {
		this.simpleAPI({node:'*',group:'control',action:'retry',node:'*'},"Retrying all tasks","The retry counter of each task in error will be decremented. Continue ?");
	}
}
