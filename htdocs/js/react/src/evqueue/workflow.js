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

import {job} from './job.js';
import {task} from './task.js';
import {input} from './input.js';
import {input_part} from './input-part.js';

export class workflow {
	constructor()
	{
		this.subjobs = [ this.createJob({name: "New job"}) ];
		
		this.wf_pre_undo = '';
		this.wf_undo = [];
		this.wf_redo = [];
		
		this.parent_depth = 0;
	}
	
	createJob(desc = {}) {
		var new_job = new job(desc);
		new_job._workflow = this;
		return new_job;
	}
	
	createTask(desc = {}) {
		return new task(desc, this);
	}
	
	createInput(desc = {}) {
		return new input(desc, this);
	}
	
	createInputPart(desc = {}) {
		return new input_part(desc, this);
	}
	
	loadXML(workflow) {
		this.subjobs = [];
		
		this.name= workflow.hasAttribute('name')?workflow.getAttribute('name'):'';
		this.comment = workflow.hasAttribute('comment')?workflow.getAttribute('comment'):'';
		this.group= workflow.hasAttribute('group')?workflow.getAttribute('group'):'';
		
		var subjobs_ite = workflow.ownerDocument.evaluate('workflow/subjobs',workflow);
		var subjobs_node = subjobs_ite.iterateNext();
		this.load_subjobs(subjobs_node, this.subjobs, undefined);
	}
	
	load_subjobs(subjobs_node, subjobs, parent) {
		var jobs_ite = subjobs_node.ownerDocument.evaluate('job',subjobs_node);
		
		var job_node;
		while(job_node = jobs_ite.iterateNext())
		{
			var new_job = this.createJob(this.node_to_object(job_node));
			new_job._parent = parent;
			
			var tasks_ite = job_node.ownerDocument.evaluate('tasks',job_node);
			var tasks_node = tasks_ite.iterateNext();
			if(tasks_node)
				this.load_tasks(tasks_node, new_job);
			
			subjobs.push(new_job);
			
			
			var subjobs_node2 = job_node.ownerDocument.evaluate('subjobs',job_node).iterateNext();
			if(subjobs_node2)
				this.load_subjobs(subjobs_node2, new_job.subjobs, new_job);
		}
	}
	
	load_tasks(tasks_node, job) {
		var tasks_ite = tasks_node.ownerDocument.evaluate('task',tasks_node);
		
		var task_node;
		while(task_node = tasks_ite.iterateNext())
		{
			var new_task = this.createTask(this.node_to_object(task_node));
			
			this.load_inputs(task_node, new_task);
			
			if(task_node.hasAttribute('type') && task_node.getAttribute('type')=='SCRIPT')
			{
				var script_ite = task_node.ownerDocument.evaluate('script', task_node);
				var script_node = script_ite.iterateNext();
				new_task.script_source = script_node.textContent;
			}
			
			job.addTask(new_task);
		}
	}
	
	load_inputs(task_node, task) {
		var inputs_ite = task_node.ownerDocument.evaluate('input',task_node);
		
		var input_node;
		while(input_node = inputs_ite.iterateNext())
		{
			var new_input = this.createInput(this.node_to_object(input_node));
			
			this.load_input_parts(input_node, new_input);
			
			task.addInput(new_input);
		}
	}
	
	load_input_parts(input_node, input) {
		var part_node = input_node.firstChild;
		while(part_node) {
			if(part_node.nodeType==Node.TEXT_NODE)
				input.addPart(this.createInputPart({type: 'text', value: part_node.nodeValue}));
			else if(part_node.nodeType==Node.ELEMENT_NODE)
				input.addPart(this.createInputPart({type: part_node.nodeName, value: part_node.getAttribute('select')}));
				
			part_node = part_node.nextSibling;
		}
	}
	
	node_to_object(node) {
		var obj = {};
		for(var i=0;i<node.attributes.length;i++)
		{
			var name = node.attributes[i].name.replace(/-/g,"_");
			obj[name] = node.attributes[i].value;
		}
		return obj;
	}
	
	stringify(obj) {
		return JSON.stringify(obj, (name, value) => {
			if(name.substr(0,1)=='_' && name!='_id')
				return undefined;
			return value;
		});
	}
	
	backup() {
		this.wf_undo.push(this.stringify(this.subjobs));
		this.wf_redo = [];
	}
	
	preBackup() {
		this.wf_pre_undo = this.stringify(this.subjobs);
	}
	
	postBackup() {
		if(this.wf_pre_undo!='')
		{
			this.wf_undo.push(this.wf_pre_undo);
			this.wf_pre_undo = '';
		}
		
		this.wf_redo = [];
	}
	
	restore(json) {
		var subjobs = JSON.parse(json);
		for(var i=0;i<subjobs.length;i++)
			subjobs[i] = this._restore(subjobs[i]);
		return subjobs;
	}
	
	_restore(jobobj) {
		for(var i=0;i<jobobj.subjobs.length;i++)
		{
			jobobj.subjobs[i] = this._restore(jobobj.subjobs[i]);
			jobobj.subjobs[i]._parent = jobobj;
		}
		
		for(var i=0;i<jobobj.tasks.length;i++)
		{
			jobobj.tasks[i] = Object.setPrototypeOf(jobobj.tasks[i], task.prototype);
			jobobj.tasks[i]._parent = jobobj;
			
			for(var j=0;j<jobobj.tasks[i].inputs.length;j++)
			{
				jobobj.tasks[i].inputs[j] = Object.setPrototypeOf(jobobj.tasks[i].inputs[j], input.prototype);
				jobobj.tasks[i].inputs[j]._parent = jobobj.tasks[i];
				
				for(var k=0;k<jobobj.tasks[i].inputs[j].parts.length;k++)
				{
					jobobj.tasks[i].inputs[j].parts[k] = Object.setPrototypeOf(jobobj.tasks[i].inputs[j].parts[k], input_part.prototype);
					jobobj.tasks[i].inputs[j].parts[k]._parent = jobobj.tasks[i].inputs[j];
				}
			}
		}
		
		return Object.setPrototypeOf(jobobj, job.prototype);
	}
	
	undo() {
		if(this.wf_undo.length==0)
			return;
		
		this.wf_redo.push(this.stringify(this.subjobs));
		this.subjobs = this.restore(this.wf_undo.pop());
	}
	
	redo() {
		if(this.wf_redo.length==0)
			return;
		
		this.wf_undo.push(this.stringify(this.subjobs));
		this.subjobs = this.restore(this.wf_redo.pop());
	}
	
	moveJob(subjobs, idx, position, origin_job, origin_subjobs, origin_idx, origin_type) {
		// Place new job
		var new_job = origin_job;
		var old_subjobs = new_job.subjobs;
		var type = origin_type;
		
		if(position=='left')
		{
			if(subjobs[idx]===new_job || subjobs[idx-1]===new_job)
				return "Cannot move a job left of itself";

			subjobs.splice(idx,0, new_job);
			
			if(type=='job')
				new_job.subjobs = [];
		}
		else if(position=='right')
		{
			if(subjobs[idx]===new_job || subjobs[idx+1]===new_job)
				return "Cannot move a job right of itself";
			
			subjobs.splice(idx+1,0, new_job);
			
			if(type=='job')
				new_job.subjobs = [];
		}
		else if(position=='top')
		{
			if(subjobs[idx]===new_job)
				 return "Cannot move a job above itself";
			
			if(type=='job')
				new_job.subjobs = [ subjobs[idx] ];
			else
			{
				var leaf = new_job.leftLeaf();
				leaf.subjobs = [ subjobs[idx] ];
			}
			
			subjobs[idx] = new_job;
		}
		else if(position=='bottom')
		{
			if(subjobs[idx].subjobs===new_job.subjobs)
				return "Cannot move a job below itself";
			
			for(var i=0;i<subjobs[idx].subjobs.length;i++)
			{
				if(subjobs[idx].subjobs[i]===new_job)
					return "Cannot move a job above itself";
			}
			
			if(type=='job')
				new_job.subjobs = subjobs[idx].subjobs;
			else
			{
				var leaf = new_job.leftLeaf();
				leaf.subjobs = subjobs[idx].subjobs;
			}
			
			subjobs[idx].subjobs = [ new_job ];
		}
		
		// Remove old job
		if(origin_subjobs!==false && origin_idx!==false)
		{
			var remove_idx = origin_idx;
			if(subjobs===origin_subjobs && idx<=origin_idx)
				remove_idx++;
			
			origin_subjobs.splice(remove_idx, 1);
			
			// Replace children
			if(type=='job')
			{
				for(var i=0;i<old_subjobs.length;i++)
					origin_subjobs.splice(idx-1, 0, old_subjobs[i]);
			}
		}
		
		return true;
	}
	
	getJob(id) {
		return this.getObject('job', id, this.subjobs);
	}
	
	getJobPath(id) {
		var path = [];
		
		this.parent_depth = 0;
		var ret = this.getObject('job', id, this.subjobs, path);
		
		return ret===false?false:path;
	}
	
	getTask(id) {
		return this.getObject('task', id, this.subjobs);
	}
	
	getTaskPath(id) {
		var path = [];
		
		this.parent_depth = 0;
		var ret = this.getObject('task', id, this.subjobs, path);
		
		return ret===false?false:path;
	}
	
	getInput(id) {
		return this.getObject('input', id, this.subjobs);
	}
	
	getInputPart(id) {
		return this.getObject('input-part', id, this.subjobs);
	}
	
	getObject(type, id, subjobs, path) {
		for(var i=0;i<subjobs.length;i++)
		{
			if(type=='job' && subjobs[i]._id==id)
			{
				if(subjobs[i].loop && path!==undefined)
				{
					path.push({group: 'Current job', values: [{value: 'evqGetCurrentJob()/evqGetContext()', name: 'Loop context'}]});
				}
				
				return subjobs[i];
			}
			else if(type=='task' || type=='input' || type=='input-part')
			{
				for(var j=0;j<subjobs[i].tasks.length;j++)
				{
					if(type=='task' && subjobs[i].tasks[j]._id==id)
					{
						if(path!==undefined && subjobs[i].tasks[j].loop)
						{
							path.push({group: 'Current task', value: '.', name: 'Loop context'});
							
							if(subjobs[i].loop)
								path.push({group: 'Current job', value: 'evqGetCurrentJob()/evqGetContext()', name: 'Loop context'});
						}
						return subjobs[i].tasks[j];
					}
					else if(type=='input' || type=='input-part')
					{
						if(type=='input' && subjobs[i].tasks[j].stdin._id==id)
							return subjobs[i].tasks[j].stdin;
						
						if(type=='input-part')
						{
							for(var l=0;l<subjobs[i].tasks[j].stdin.parts.length;l++)
							{
								if(subjobs[i].tasks[j].stdin.parts[l]._id==id)
									return subjobs[i].tasks[j].stdin.parts[l];
							}
						}
						
						for(var k=0;k<subjobs[i].tasks[j].inputs.length;k++)
						{
							if(type=='input' && subjobs[i].tasks[j].inputs[k]._id==id)
								return subjobs[i].tasks[j].inputs[k];
							
							if(type=='input-part')
							{
								for(var l=0;l<subjobs[i].tasks[j].inputs[k].parts.length;l++)
								{
									if(subjobs[i].tasks[j].inputs[k].parts[l]._id==id)
										return subjobs[i].tasks[j].inputs[k].parts[l];
								}
							}
						}
					}
				}
			}
			
			let job = this.getObject(type, id, subjobs[i].subjobs, path);
			if(job!==false)
			{
				if(path!==undefined)
				{
					var group = 'Parent job '+(this.parent_depth+1);
					if(subjobs[i].loop)
						path.push({group: group, value: 'evqGetParentJob('+(this.parent_depth)+'/evqGetContext()', name: 'Loop context'});
					
					for(var j=0;j<subjobs[i].tasks.length;j++)
						path.push({group: group, value: "evqGetParentJob("+(this.parent_depth)+")/evqGetOutput('"+subjobs[i].tasks[j].getPath()+"')", name:"Task: "+subjobs[i].tasks[j].getPath(), path: subjobs[i].tasks[j].getPath()});
					
					this.parent_depth++;
				}
				
				return job;
			}
		}
		
		return false;
	}
}
