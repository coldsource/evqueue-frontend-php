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

export class job {
	constructor(desc = {})
	{
		if(typeof desc=='object') {
			this.name = desc.name?desc.name:'';
			this.condition = desc.condition?desc.condition:'';
			this.loop = desc.loop?desc.loop:'';
			this.iteration_condition = desc.iteration_condition?desc.iteration_condition:'';
			this.tasks = desc.tasks?desc.tasks:[];
			this.subjobs = desc.subjobs?desc.subjobs:[];
		}
	}
	
	leftLeaf() {
		return this.left_leaf(this);
	}
	
	left_leaf(job) {
		if(job.subjobs.length==0)
			return job;
		return this.left_leaf(job.subjobs[0]);
	}
	
	addTask(task) {
		if(this.tasks.indexOf(task)!=-1)
			return "This task is already in the job";
		
		this.tasks.push(task);
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
