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

export class job {
	constructor(desc = {})
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
		
		if(typeof desc=='object') {
			Object.assign(this, desc);
		}
		
		this._id = job.global.id++;
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
			return "This task is already in the job";
		
		taskobj._parent = this;
		this.tasks.push(taskobj);
		
		return true;
	}
	
	removeTask(task) {
		var idx = this.tasks.indexOf(task);
		if(idx==-1)
			return;
		
		this.tasks.splice(idx, 1);
		return true;
	}
}
