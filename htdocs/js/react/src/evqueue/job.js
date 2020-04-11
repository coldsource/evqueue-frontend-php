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

import {task} from './task.js';
import {DOMUtils} from '../utils/DOM.js';

export class job {
	constructor(desc = {}, workflow)
	{
		if(job.global===undefined)
		{
			job.global = {
				id: 1
			};
		}
		
		this.name = '';
		this.condition = '';
		this.loop = '';
		this.iteration_condition = '';
		this.tasks = [];
		this.subjobs = [];
		
		this._id = job.global.id++;
		this._workflow = workflow;
		
		if(desc instanceof Element)
			this.fromXML(desc);
		else if(typeof desc=='object')
			this.fromObject(desc);
	}
	
	getWorkflow() {
		return this._workflow;
	}
	
	leftLeaf() {
		return this.left_leaf(this);
	}
	
	left_leaf(job) {
		if(job.subjobs.length==0)
			return job;
		return this.left_leaf(job.subjobs[0]);
	}
	
	addTask(taskobj) {
		if(taskobj===undefined)
			taskobj = this._workflow.createTask();
		
		if(this.tasks.indexOf(taskobj)!=-1)
			return;
		
		taskobj._parent = this;
		this.tasks.push(taskobj);
	}
	
	removeTask(task) {
		var idx = this.tasks.indexOf(task);
		if(idx==-1)
			return;
		
		this.tasks.splice(idx, 1);
		return true;
	}
	
	emptySubjobs() {
		var removed_subjobs = this.subjobs.concat(); // Backup nodes before they get removed
		this.subjobs = [];
		return removed_subjobs;
	}
	
	setSubjobs(jobs) {
		var removed_subjobs = this.emptySubjobs();
		
		if(!Array.isArray(jobs))
			jobs = [ jobs ];
		
		for(let i=0;i<jobs.length;i++)
		{
			if(jobs[i]===this) // Do not append self to prevent loops
				continue;
				
			this.addSubjob(jobs[i]);
			
			let idx = removed_subjobs.indexOf(jobs[i]);
			if(idx!=-1)
				removed_subjobs.splice(idx, 1); // We are finally not removed since we've be re-added
		}
		
		return removed_subjobs;
	}
	
	addSubjob(job, idx = undefined) {
		job._parent = this;
		if(idx!==undefined)
			this.subjobs.splice(idx, 0, job);
		else
		{
			this.subjobs.push(job);
			idx = this.subjobs.length-1;
		}
		
		return idx;
	}
	
	replaceSubjob(job, idx) {
		if(this.subjobs[idx]===job)
			return [];
		
		job._parent = this;
		
		let old_subjob = this.subjobs[idx];
		this.subjobs[idx] = job;
		return [ old_subjob ];
	}
	
	removeSubjob(idx) {
		this.subjobs.splice(idx, 1);
	}
	
	fromObject(desc) {
		Object.assign(this, desc);
	}
	
	fromXML(job_node) {
		this.fromObject(DOMUtils.nodeToObject(job_node));
		
		let task_ite = job_node.ownerDocument.evaluate('tasks/task',job_node);
		let task_node;
		while(task_node = task_ite.iterateNext())
			this.addTask(this._workflow.createTask(task_node));
		
		let subjob_ite = job_node.ownerDocument.evaluate('subjobs/job',job_node);
		let subjob_node;
		while(subjob_node = subjob_ite.iterateNext())
			this.addSubjob(this._workflow.createJob(subjob_node));
	}
	
	toXML(xmldoc) {
		let job_node = xmldoc.createElement('job');
		
		if(this.name)
			job_node.setAttribute('name', this.name);
		if(this.condition)
			job_node.setAttribute('condition', this.condition);
		if(this.loop)
			job_node.setAttribute('loop', this.loop);
		if(this.iteration_condition)
			job_node.setAttribute('iteration_condition', this.iteration_condition);
		
		let tasks_node = job_node.appendChild(xmldoc.createElement('tasks'));
		for(let i=0;i<this.tasks.length;i++)
			tasks_node.appendChild(this.tasks[i].toXML(xmldoc));
		
		if(this.subjobs.length>0)
		{
			let subjobs_node = job_node.appendChild(xmldoc.createElement('subjobs'));
			for(let i=0;i<this.subjobs.length;i++)
				subjobs_node.appendChild(this.subjobs[i].toXML(xmldoc));
		}
		
		return job_node;
	}
}
