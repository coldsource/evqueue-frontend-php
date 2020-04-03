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
		this.origin_type = false;
		
		this.onDragStart = this.onDragStart.bind(this);
		this.onDragOver = this.onDragOver.bind(this);
		this.onDragLeave = this.onDragLeave.bind(this);
		this.onDrop = this.onDrop.bind(this);
		
		this.undo = this.undo.bind(this);
		this.redo = this.redo.bind(this);
		
		this.jobUpdate = this.jobUpdate.bind(this);
		this.taskAdd = this.taskAdd.bind(this);
	}
	
	undo() {
		this.workflow.undo();
		this.setState({workflow:this.state.workflow});
	}
	
	redo() {
		this.workflow.redo();
		this.setState({workflow:this.state.workflow});
	}
	
	onDragStart(e, job, subjobs, idx, deep = false) {
		e.stopPropagation();
		
		this.origin_job = job;
		this.origin_subjobs = subjobs;
		this.origin_idx = idx;
		this.origin_type = deep?'branch':'job';
		
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
	
	onDragOver(e) {
		e.target.classList.add('dragover');
		e.preventDefault();
	}
	
	onDragLeave(e) {
		e.target.classList.remove('dragover');
	}
	
	onDrop(e, subjobs, idx, position) {
		e.target.classList.remove('dragover');
		
		var ret = this.state.workflow.moveJob(subjobs, idx, position, this.origin_job, this.origin_subjobs, this.origin_idx, this.origin_type);
		if(ret!==true)
			return App.warning(ret);
		
		this.setState({new_job: false, workflow: this.state.workflow});
	}
	
	jobUpdate(e, job) {
		this.state.workflow.backup();
		
		job[e.target.name] = e.target.value;
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
				<div className="branch" key={idx} draggable onDragStart={ (e) => this.onDragStart(e, job, subjobs, idx, true) } onDragEnd={ this.onDragEnd }>
					<div>
						<div className={sep_type}></div>
					</div>
					<div onDragOver={ this.onDragOver } onDragLeave={ this.onDragLeave } onDrop={ (e) => this.onDrop(e, subjobs, idx, 'top') }>
						<div className="post-separator"></div>
					</div>
					<div className="side-separator" onDragOver={ this.onDragOver } onDragLeave={ this.onDragLeave } onDrop={ (e) => this.onDrop(e, subjobs, idx, 'left') }></div>
					<Job desc={job} onDragStart={ (e, job) => this.onDragStart(e, job, subjobs, idx) } onChange={ (e) => this.jobUpdate(e, job) } onTaskAdd={ this.taskAdd } />
					<div className="side-separator" onDragOver={ this.onDragOver } onDragLeave={ this.onDragLeave } onDrop={ (e) => this.onDrop(e, subjobs, idx, 'right') }></div>
					<div onDragOver={ this.onDragOver } onDragLeave={ this.onDragLeave } onDrop={ (e) => this.onDrop(e, subjobs, idx, 'bottom') }>
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
				<div className="trash" title="Trash" onDragOver={ this.onDragOver } onDragLeave={ this.onDragLeave } onDrop={ (e) => this.onDrop(e, false, false, 'trash') }>
					<span className="faicon fa-trash"></span>
					<br />Drop elements here to remove them
				</div>
				<div className="new-job">
					{ this.state.new_job?
						(<Job desc={new job()} onDragStart={ (e, job) => this.onDragStart(e, job, false, false) } />):
						(<div><span className="faicon fa-plus" onClick={ (e) => this.setState({new_job: true}) }></span><br />Create a new job</div>)
					}
				</div>
				{ this.renderSubjobs(this.state.workflow.subjobs) }
			</div>
		);
	}
}
