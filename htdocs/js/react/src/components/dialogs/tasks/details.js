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

import {Dialog} from '../../../ui/dialog.js';
import {Tabs} from '../../../ui/tabs.js';
import {Tab} from '../../../ui/tab.js';

export class TaskDetails extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			execution: props.task.output.length-1,
			task: this.props.task,
			now: Date.now()
		}
		
		this.changeExecution = this.changeExecution.bind(this);
	}
	
	componentDidMount() {
		if(this.state.task.status=='EXECUTING')
			this.timerID = setInterval(() => { this.setState({now: this.now()}) },1000);
	}
	
	componentWillUnmount() {
		if(this.timerID!==undefined)
			clearInterval(this.timerID);
	}
	
	now() {
		return Date.now();
	}
	
	renderInputs(task) {
		if(task.input.length==0)
			return (<div>This task has no inputs</div>);
		
		return task.input.map( (input) => {
			return (
				<div key={input.name}>
					<div>{input.name}</div>
					<div>{input.domnode.textContent}</div>
				</div>
			);
		});
	}
	
	renderHost(task) {
		if(!task.host)
			return '';
		
		return (
			<fieldset className="tabbed">
				<legend>Remote</legend>
				{
					task.user?(
						<div>
							<div>User</div>
							<div>{task.user}</div>
						</div>
							):''
				}
				<div>
					<div>Host</div>
					<div>{task.host}</div>
				</div>
			</fieldset>
		);
	}
	
	renderOutput(task,output,type) {
		if(!output)
			return;
		
		if(task.status=='EXECUTING')
		{
			return (
				<div>
					<br />
					This task is currently running.
					<br />You can view it's live output :
					&#160;
					<a target="_blank" className="action" href={"ajax/datastore.php?node="+this.props.node+"&tid="+task.tid+"&type="+type}>here</a>
				</div>
			);
		}
		
		if(output['datastore-id'])
		{
			return (
				<div>
					<div><i>The output of this task is too big and has been stored in the datastore.</i></div>
					<br />
					<div><a href="ajax/datastore.php?id={@datastore-id}&amp;download"><span className="faicon fa-download"></span>Download from datastore</a></div>
					<div><a target="_blank" href="ajax/datastore.php?id={@datastore-id}"><span className="faicon fa-eye"></span>View in browser</a></div>
				</div>
			);
		}
		
		if(task['output-method']=='XML' && output.retval==0)
			return (<XML xml={output.domnode}/>);
		return (<pre>{output.domnode.textContent}</pre>);
	}
	
	renderExecutions(task) {
		if(task.output.length<=1)
			return '';
		
		return (
			<fieldset className="tabbed">
				<legend>Previous executions</legend>
				<div>
					<div>Choose</div>
					<div>
						<select value={this.state.execution} onChange={this.changeExecution}>
							{
								task.output.map( (output,idx) => {
									return (<option key={idx} value={idx}>{output.execution_time}</option>);
								})
							}
						</select>
					</div>
				</div>
			</fieldset>
		);
	}
	
	changeExecution(event) {
		this.setState({execution: event.target.value});
	}
	
	render() {
		var task = this.state.task;
		var execution = this.state.execution>=0?this.state.execution:0;
		
		// Clear timer if task is terminated
		if(task.status!='EXECUTING' && this.timerID!==undefined)
		{
			clearInterval(this.timerID);
			delete this.timerID;
		}
		
		return (
			<Dialog dlgid={this.props.dlgid} title={'Task '+(task.type=='SCRIPT'?task.name:task.path)} width="600">
				<Tabs>
					<Tab title="General">
						<fieldset className="tabbed">
							<legend>Description</legend>
							<div>
								<div>Type</div>
								<div>{task.type=='SCRIPT'?'Script':'Shell'}</div>
							</div>
							<div>
								<div>{task.type=='SCRIPT'?'Name':'Path'}</div>
								<div>{task.type=='SCRIPT'?task.name:task.path}</div>
							</div>
						</fieldset>
						
						<fieldset className="tabbed">
							<legend>Inputs</legend>
							{this.renderInputs(task)}
						</fieldset>
						
						<fieldset className="tabbed">
							<legend>Execution</legend>
							<div>
								<div>Status</div>
								<div>{task.status}</div>
							</div>
							{
								task.error?(
									<div>
										<div>Error</div>
										<div>{task.error}</div>
									</div>
									):''
							}
							{
								task.details?(
									<div>
										<div>Infos</div>
										<div>{task.details}</div>
									</div>
									):''
							}
							<div>
								<div>Return value</div>
								<div>{task.output.length!=0?task.output[execution].retval:'∅'}</div>
							</div>
							<div>
								<div>Started at</div>
								<div>{task.output.length!=0?task.output[execution].execution_time:task.execution_time}</div>
							</div>
							<div>
								<div>Ended at</div>
								<div>{task.output.length!=0?task.output[execution].exit_time:'∅'}</div>
							</div>
							<div>
								<div>Execution time</div>
								<div>{task.output.length!=0?
									(Date.parse(task.output[execution].exit_time)/1000-Date.parse(task.output[execution].execution_time)/1000):
									Math.round((this.state.now/1000-Date.parse(task.execution_time)/1000))
								} second(s)</div>
							</div>
							<div>
								<div>Number of executions</div>
								<div>{task.output.length}</div>
							</div>
							<div>
								<div>Queue</div>
								<div>{task.queue}</div>
							</div>
						</fieldset>
							
						{this.renderHost(task)}
						
						{this.renderExecutions(task)}
					</Tab>
					<Tab title="stdout">
						{this.renderOutput(task,task.output.length!=0?task.output[execution]:'','stdout')}
					</Tab>
					<Tab title="stderr">
						{this.renderOutput(task,task.output.length!=0?task.stderr[execution]:'','stderr')}
					</Tab>
					<Tab title="log">
						{this.renderOutput(task,task.output.length!=0?task.log[execution]:'','log')}
					</Tab>
				</Tabs>
			</Dialog>
		);
	}
}
