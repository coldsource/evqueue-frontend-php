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

import {App} from '../base/app.js';
import {evQueueComponent} from '../base/evqueue-component.js';
import {Dialogs} from '../../ui/dialogs.js';
import {Job} from './job.js';
import {job} from '../../evqueue/job.js';
import {workflow} from '../../evqueue/workflow.js';
import {task} from '../../evqueue/task.js';

export class WorkflowEditor extends evQueueComponent {
	constructor(props) {
		super(props);
		
		this.state.workflow = new workflow();
		
		this.state.new_job = false;
		
		this.origin_job = false;
		this.origin_subjobs = false;
		this.origin_idx = false;
		this.origin_task = false;
		
		this.onJobDragStart = this.onJobDragStart.bind(this);
		this.onTaskDragStart = this.onTaskDragStart.bind(this);
		this.onDragOver = this.onDragOver.bind(this);
		this.onDragLeave = this.onDragLeave.bind(this);
		this.onDrop = this.onDrop.bind(this);
		
		this.undo = this.undo.bind(this);
		this.redo = this.redo.bind(this);
		
		this.jobUpdate = this.jobUpdate.bind(this);
		this.taskUpdate = this.taskUpdate.bind(this);
		this.taskAdd = this.taskAdd.bind(this);
	}
	
	componentDidMount() {
		this.API({group: 'workflow', action: 'get', attributes: {id: 57}}).then( (response) => {
			this.state.workflow.loadXML(response.documentElement.firstChild);
			this.setState({workflow:this.state.workflow});
		});
	}
	
	undo() {
		this.state.workflow.undo();
		this.setState({workflow:this.state.workflow});
	}
	
	redo() {
		this.state.workflow.redo();
		this.setState({workflow:this.state.workflow});
	}
	
	onTaskDragStart(e, job, task) {
		e.stopPropagation();
		
		this.origin_job = job;
		this.origin_task = task;
		e.dataTransfer.setData('origin_type','task');
	}
	
	onJobDragStart(e, job, subjobs, idx, deep = false) {
		e.stopPropagation();
		
		this.origin_job = job;
		this.origin_subjobs = subjobs;
		this.origin_idx = idx;
		e.dataTransfer.setData('origin_type', deep?'branch':'job');
		
		if(deep)
			e.target.firstChild.firstChild.style.display = 'none';
	}
	
	onDragEnd(e) {
		e.stopPropagation();
		
		if(e.target.firstChild && e.target.firstChild.firstChild && e.target.firstChild.firstChild.style)
		{
			e.target.firstChild.firstChild.style.display = 'block';
		}
	}
	
	onDragOver(e, type) {
		e.stopPropagation();
		
		var origin_type = e.dataTransfer.getData('origin_type');
		
		if(origin_type=='task' && type!='trash' && type!='job')
			return;
		
		if((origin_type=='job' || origin_type=='branch') && type!='trash' && type!='job-slot')
			return;
		
		e.currentTarget.classList.add('dragover');
		e.preventDefault();
	}
	
	onDragLeave(e) {
		e.currentTarget.classList.remove('dragover');
	}
	
	onDrop(e, subjobs, idx, position) {
		e.currentTarget.classList.remove('dragover');
		var origin_type = e.dataTransfer.getData('origin_type');
		
		this.state.workflow.preBackup();
		
		var ret;
		if(origin_type=='task')
		{
			if(position=='job')
			{
				ret = subjobs[idx].addTask(this.origin_task);
				
				if(ret!==true)
					return App.warning(ret);
			}
			
			this.origin_job.removeTask(this.origin_task);
		}
		else if(origin_type=='job' || origin_type=='branch')
		{
			ret = this.state.workflow.moveJob(subjobs, idx, position, this.origin_job, this.origin_subjobs, this.origin_idx, origin_type);
			if(ret!==true)
				return App.warning(ret);
		}
		
		this.state.workflow.postBackup();
		this.setState({new_job: false, workflow: this.state.workflow});
	}
	
	jobUpdate(e, job) {
		this.state.workflow.backup();
		
		job[e.target.name] = e.target.value;
		this.setState({workflow: this.state.workflow});
		
		// Force dialogs to update because dialogs are rendered outside of this component 
		Dialogs.instance.forceUpdate();
	}
	
	taskUpdate(e, job, task) {
		this.state.workflow.backup();
		
		task[e.target.name] = e.target.value;
		this.setState({workflow: this.state.workflow});
		
		// Force dialogs to update because dialogs are rendered outside of this component 
		Dialogs.instance.forceUpdate();
	}
	
	taskAdd(e, job) {
		this.state.workflow.backup();
		
		job.tasks.push(new task());
		
		this.setState({workflow: this.state.workflow});
	}
	
	renderSubjobs(subjobs) {
		if(subjobs===undefined || subjobs.length==0)
			return;
		
		return subjobs.map( (job, idx) => {
			var sep_type = 'separator';
			if(idx==0)
				sep_type += ' left-separator';
			if(idx==subjobs.length-1)
				sep_type += ' right-separator';
			
			return (
				<div className="branch" key={idx} draggable onDragStart={ (e) => this.onJobDragStart(e, job, subjobs, idx, true) } onDragEnd={ this.onDragEnd }>
					<div>
						<div className={sep_type}></div>
					</div>
					<div onDragOver={ (e) => this.onDragOver(e, 'job-slot') } onDragLeave={ this.onDragLeave } onDrop={ (e) => this.onDrop(e, subjobs, idx, 'top') }>
						<div className="post-separator"></div>
					</div>
					<div className="side-separator" onDragOver={ (e) => this.onDragOver(e, 'job-slot') } onDragLeave={ this.onDragLeave } onDrop={ (e) => this.onDrop(e, subjobs, idx, 'left') }></div>
					<Job
						job={job}
						onJobDragStart={ (e, job) => this.onJobDragStart(e, job, subjobs, idx) }
						onJobDragOver={ (e) => this.onDragOver(e, 'job') }
						onJobDragLeave={ this.onDragLeave }
						onJobDrop={ (e) => this.onDrop(e, subjobs, idx, 'job') }
						onJobChange={ (e) => this.jobUpdate(e, job) }
						onTaskChange={ this.taskUpdate }
						onTaskDragStart={ this.onTaskDragStart }
						onTaskAdd={ this.taskAdd }
					/>
					<div className="side-separator" onDragOver={ (e) => this.onDragOver(e, 'job-slot') } onDragLeave={ this.onDragLeave } onDrop={ (e) => this.onDrop(e, subjobs, idx, 'right') }></div>
					<div onDragOver={ (e) => this.onDragOver(e, 'job-slot') } onDragLeave={ this.onDragLeave } onDrop={ (e) => this.onDrop(e, subjobs, idx, 'bottom') }>
						<div className="pre-separator"></div>
					</div>
					
					{ this.renderSubjobs(job.subjobs) }
				</div>
			);
		});
	}
	
	render() {
		return (
			<div className="evq-workflow-editor">
				<div className="trash" title="Trash" onDragOver={ (e) => this.onDragOver(e, 'trash') } onDragLeave={ this.onDragLeave } onDrop={ (e) => this.onDrop(e, false, false, 'trash') }>
					<span className="faicon fa-trash"></span>
					<br />Drop elements here to remove them
				</div>
				<div className="new-job">
					{ this.state.new_job?
						(<Job job={new job({name: 'New job'})} onJobDragStart={ (e, job) => this.onJobDragStart(e, job, false, false) } />):
						(<div><span className="faicon fa-plus" onClick={ (e) => this.setState({new_job: true}) }></span><br />Create a new job</div>)
					}
				</div>
				{ this.renderSubjobs(this.state.workflow.subjobs) }
			</div>
		);
	}
}
