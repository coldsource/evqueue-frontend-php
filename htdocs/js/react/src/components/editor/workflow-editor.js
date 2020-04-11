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
import {JobEditor} from '../dialogs/jobs/editor.js';
import {TaskEditor} from '../dialogs/tasks/editor.js';
import {TaskInputEditor} from '../dialogs/tasks/input-editor.js';
import {ValueSelector} from '../dialogs/workflows/value-selector.js';
import {WorkflowProperties} from '../dialogs/workflows/properties.js';

export class WorkflowEditor extends evQueueComponent {
	constructor(props) {
		super(props);
		
		this.state.workflow = new workflow();
		this.state.new_job = false;
		
		this.state.dialogs = [];
		
		this.origin_job = false;
		this.origin_task = false;
		
		this.openDialog = this.openDialog.bind(this);
		this.closeDialog = this.closeDialog.bind(this);
		
		this.onJobDragStart = this.onJobDragStart.bind(this);
		this.onTaskDragStart = this.onTaskDragStart.bind(this);
		this.onDragOver = this.onDragOver.bind(this);
		this.onDragLeave = this.onDragLeave.bind(this);
		this.onDrop = this.onDrop.bind(this);
		
		this.undo = this.undo.bind(this);
		this.redo = this.redo.bind(this);
		
		this.objectUpdate = this.objectUpdate.bind(this);
		this.onDlgChange = this.onDlgChange.bind(this);
	}
	
	componentDidMount() {
		this.API({group: 'workflow', action: 'get', attributes: {id: 84}}).then( (response) => {
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
	
	onTaskDragStart(e, task) {
		e.stopPropagation();
		
		this.origin_job = task.getJob();
		this.origin_task = task;
		e.dataTransfer.setData('origin_type','task');
	}
	
	onJobDragStart(e, job, deep = false) {
		e.stopPropagation();
		
		this.origin_job = job;
		e.dataTransfer.setData('origin_type', deep?'branch':'job');
		
		if(deep)
			e.target.firstChild.firstChild.style.display = 'none';
	}
	
	onDragEnd(e) {
		e.stopPropagation();
		
		if(e.dataTransfer.getData('origin_type')=='branch')
			e.target.firstChild.firstChild.style.display = 'block';
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
	
	onDrop(e, job, position) {
		e.currentTarget.classList.remove('dragover');
		var origin_type = e.dataTransfer.getData('origin_type');
		
		this.state.workflow.preBackup();
		
		var ret;
		if(origin_type=='task')
		{
			if(position=='job')
				job.addTask(this.origin_task);
			
			if(job!==this.origin_job)
				this.origin_job.removeTask(this.origin_task);
		}
		else if(origin_type=='job' || origin_type=='branch')
			this.state.workflow.moveJob(job, position, this.origin_job, origin_type);
		
		this.state.workflow.postBackup();
		this.setState({new_job: false, workflow: this.state.workflow});
	}
	
	objectUpdate(e, obj) {
		this.state.workflow.backup();
		
		if(Array.isArray(e.target.name))
		{
			for(var i=0;i<e.target.name.length;i++)
				obj[e.target.name[i]] = e.target.value[i];
		}
		else
			obj[e.target.name] = e.target.value;
		
		this.setState({workflow: this.state.workflow});
	}
	
	onDlgChange(e, event_obj, cur_obj) {
		if(event_obj!==undefined)
			return this.objectUpdate(e, event_obj);
		return this.objectUpdate(e, cur_obj);
	}
	
	openDialog(type, id) {
		var dialogs = this.state.dialogs;
		dialogs.push({
			type: type,
			id: id
		});
		
		this.setState({dialogs: dialogs});
	}
	
	closeDialog(dlg) {
		var dialogs = this.state.dialogs;
		for(var i=0;i<dialogs.length;i++)
		{
			if(dialogs[i].type==dlg.type && dialogs[i].id==dlg.id)
			{
				dialogs.splice(i, 1);
				return this.setState({dialogs: dialogs});
			}
		}
	}
	
	renderDialogs() {
		return this.state.dialogs.map( (dialog) => {
			var key = dialog.type+'|'+dialog.id;
			if(dialog.type=='properties')
			{
				let properties = this.state.workflow.properties;
				return (<WorkflowProperties key={key} properties={properties} onChange={ (e, obj) => this.onDlgChange(e, obj, properties) } onClose={ (e) => this.closeDialog(dialog) } />);
			}
			else if(dialog.type=='job')
			{
				let job = this.state.workflow.getJob(dialog.id);
				return (<JobEditor key={key} job={job} onChange={ (e, obj) => this.onDlgChange(e, obj, job) } onClose={ (e) => this.closeDialog(dialog) } />);
			}
			else if(dialog.type=='task')
			{
				let task = this.state.workflow.getTask(dialog.id);
				return (<TaskEditor key={key} task={task} onChange={ (e, obj) => this.onDlgChange(e, obj, task) } openDialog={ this.openDialog } onClose={ (e) => this.closeDialog(dialog) } />);
			}
			else if(dialog.type=='task-input')
			{
				let input = this.state.workflow.getInput(dialog.id);
				return (<TaskInputEditor key={key} input={input} onChange={ (e, obj) => this.onDlgChange(e, obj, input) } onClose={ (e) => this.closeDialog(dialog) } />);
			}
			else if(dialog.type=='task-input-select')
			{
				let part = this.state.workflow.getInputPart(dialog.id);
				return (<ValueSelector key={key} part={part} onChange={ (e, obj) => this.onDlgChange(e, obj, part) } onClose={ (e) => this.closeDialog(dialog) } />);
			}
		});
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
				<div className="branch" key={idx} draggable onDragStart={ (e) => this.onJobDragStart(e, job, true) } onDragEnd={ this.onDragEnd }>
					<div>
						<div className={sep_type}></div>
					</div>
					<div onDragOver={ (e) => this.onDragOver(e, 'job-slot') } onDragLeave={ this.onDragLeave } onDrop={ (e) => this.onDrop(e, job, 'top') }>
						<div className="post-separator"></div>
					</div>
					<div className="side-separator" onDragOver={ (e) => this.onDragOver(e, 'job-slot') } onDragLeave={ this.onDragLeave } onDrop={ (e) => this.onDrop(e, job, 'left') }></div>
					<Job
						job={job}
						openDialog={ this.openDialog }
						onChange={ (e) => this.objectUpdate(e, job) }
						onJobDragStart={ (e, job) => this.onJobDragStart(e, job) }
						onJobDragOver={ (e) => this.onDragOver(e, 'job') }
						onJobDragLeave={ this.onDragLeave }
						onJobDrop={ (e) => this.onDrop(e, job, 'job') }
						onTaskDragStart={ this.onTaskDragStart }
					/>
					<div className="side-separator" onDragOver={ (e) => this.onDragOver(e, 'job-slot') } onDragLeave={ this.onDragLeave } onDrop={ (e) => this.onDrop(e, job, 'right') }></div>
					<div onDragOver={ (e) => this.onDragOver(e, 'job-slot') } onDragLeave={ this.onDragLeave } onDrop={ (e) => this.onDrop(e, job, 'bottom') }>
						<div className="pre-separator"></div>
					</div>
					
					{ this.renderSubjobs(job.subjobs) }
				</div>
			);
		});
	}
	
	render() {
		return (
			<div>
				<div className="evq-workflow-editor">
					<div className="trash" title="Trash" onDragOver={ (e) => this.onDragOver(e, 'trash') } onDragLeave={ this.onDragLeave } onDrop={ (e) => this.onDrop(e, false, 'trash') }>
						<span className="faicon fa-trash"></span>
						<br />Drop elements here to remove them
					</div>
					<div className="new-job">
						{ this.state.new_job?
							(<Job job={this.state.workflow.createJob({name: 'New job'})} onJobDragStart={ (e, job) => this.onJobDragStart(e, job) } />):
							(<div><span className="faicon fa-plus" onClick={ (e) => this.setState({new_job: true}) }></span><br />Create a new job</div>)
						}
					</div>
					{ this.renderSubjobs(this.state.workflow.subjobs) }
				</div>
				<div>
					{ this.renderDialogs() }
				</div>
			</div>
		);
	}
}
