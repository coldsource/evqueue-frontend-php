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
import {InstanceDetails} from '../../dialogs/instances/details.js';
import {Dialogs} from '../../../ui/dialogs.js';

export class ListInstances extends evQueueComponent {
	constructor(props,node) {
		super(props);
		
		this.node = node;
		
		if(this.node=='*')
			this.state.workflows = {};
		else
			this.state.workflows = {current:{response:[]}};
	}
	
	evQueueEvent(response) {
		var data = this.parseResponse(response);
		
		if(this.node=='*')
		{
			for(var i=0;i<data.response.length;i++)
				data.response[i].node_name = data.node;
			
			var current_state = this.state.workflows;
			current_state[data.node] = data;
		}
		else
			var current_state = { current: data };
		
		this.setState({workflows: current_state});
	}
	
	humanTime(seconds) {
		if(seconds<0)
			seconds = 0;
		seconds = Math.floor(seconds);
		return (seconds/86400 >= 1 ? Math.floor(seconds/86400)+' days, ' : '') +
                (seconds/3600 >= 1 ? (Math.floor(seconds/3600)%24)+'h ' : '') +
                (seconds/60 >= 1 ? (Math.floor(seconds/60)%60)+'m ' : '') +
                (seconds%60)+'s';
	}
	
	timeSpan (dt1, dt2='') {
		var duration = (Date.parse(dt2) - Date.parse(dt1))/1000;

		if (dt1.split(' ')[0] == dt2.split[0])
			dt2.replace(/^\d{4}-\d{2}-\d{2}/,''); // don't display same date twice

		var dts = [dt1,dt2];
		var today = new Date().toISOString().substr(0,10);
		var yesterday = new Date(Date.now() - 86400000).toISOString().substr(0,10);
		var tomorrow = new Date(Date.now() + 86400000).toISOString().substr(0,10);
		for(var i=0;i<2;i++) {
			dts[i] = dts[i].replace(new RegExp('^'+today),'');  // don't display today's date
			dts[i] = dts[i].replace(new RegExp('^'+yesterday),'yesterday');  // 'yesterday' instead of date
			dts[i] = dts[i].replace(new RegExp('^'+tomorrow),'tomorrow');  // 'tomorrow' instead of date
			dts[i] = dts[i].replace(/:\d+$/,'');  // don't display seconds
		}

		if(duration < 60)
			dts[1] = false;

		return dts[1] ? dts[0] + ' → ' + dts[1] : dts[0];
	}
	
	renderWorkflowsList() {
		var ret = [];
		
		for(var node in this.state.workflows)
		{
			ret = ret.concat(this.state.workflows[node].response.map((wf) => {
				wf.wf_status = wf.status;  // .status seems to be reserved by react, in any case it is replaced by a boolean in the rendered HTML
				return (
						<tr key={wf.id}
							data-id={wf.id}
							data-node={wf.node_name}
							data-running_tasks={wf.running_tasks}
							data-retrying_tasks={wf.retrying_tasks}
							data-queued_tasks={wf.queued_tasks}
							data-error_tasks={wf.error_tasks}
							data-waiting_conditions={wf.waiting_conditions}
							>
							<td className="center">
								{ this.WorkflowStatus(wf) }
							</td>
							<td>
								<span className="action" data-id={wf.id} data-node-name={wf.node_name} data-status={wf.wf_status} onClick={() => { Dialogs.open(InstanceDetails,{id: wf.id, node: wf.node_name, width:300})}}>
									{wf.id} – {wf.name} { this.workflowInfos(wf) } ({this.workflowDuration(wf)})
								</span>
								&#160;
							</td>
							<td className="center">{wf.node_name}</td>
							<td className="center">{wf.host?wf.host:'localhost'}</td>
							<td className="tdStarted">
								{this.timeSpan(wf.start_time,wf.end_time)}
							</td>
							{ this.renderActions(wf) }
						</tr>
				);
			}));
		}
		
		return ret;
	}
	
	renderWorkflows() {
		if(Object.keys(this.state.workflows).length==0)
			return (<div className="center"><br />Loading...</div>);
		
		var n = 0;
		for(var node in this.state.workflows)
			n += this.state.workflows[node].response.length;
		
		if(n==0)
			return (<div className="center"><br />No workflow.</div>);
		
		return (
			<div className="workflow-list">
				<table className="border">
					<thead>
						<tr>
							<th style={{width:'80px'}} className="center">State</th>
							<th>ID &#8211; Name</th>
							<th>Node</th>
							<th className="thStarted">Host</th>
							<th className="thStarted">Time</th>
							<th className="thActions">Actions</th>
						</tr>
					</thead>
					<tbody>{ this.renderWorkflowsList() }</tbody>
				</table>
			</div>
		);
	}

	render() {
		return (
			<div>
				{ this.renderTitle() }
				
				{ this.renderWorkflows() }
			</div>
		);
	}
}
