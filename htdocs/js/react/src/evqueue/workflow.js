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

export class workflow {
	constructor()
	{
		this.subjobs = [ new job({name: "New job"}) ];
		
		this.wf_undo = [];
		this.wf_redo = [];
	}
	
	backup() {
		this.wf_undo.push(JSON.stringify(this.subjobs));
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
			jobobj.subjobs[i] = this._restore(jobobj.subjobs[i]);
		
		for(var i=0;i<jobobj.tasks.length;i++)
			jobobj.tasks[i] = Object.setPrototypeOf(jobobj.tasks[i], task.prototype);
		
		return Object.setPrototypeOf(jobobj, job.prototype);
	}
	
	undo() {
		if(this.wf_undo.length==0)
			return;
		
		this.wf_redo.push(JSON.stringify(this.subjobs));
		this.subjobs = this.restore(this.wf_undo.pop());
	}
	
	redo() {
		if(this.wf_redo.length==0)
			return;
		
		this.wf_undo.push(JSON.stringify(this.state.workflow));
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

			this.backup();
			
			subjobs.splice(idx,0, new_job);
			
			if(type=='job')
				new_job.subjobs = [];
		}
		else if(position=='right')
		{
			if(subjobs[idx]===new_job || subjobs[idx+1]===new_job)
				return "Cannot move a job right of itself";
			
			this.backup();
			
			subjobs.splice(idx+1,0, new_job);
			
			if(type=='job')
				new_job.subjobs = [];
		}
		else if(position=='top')
		{
			if(subjobs[idx]===new_job)
				 return "Cannot move a job above itself";
			
			this.backup();
			
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
			
			this.backup();
			
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
}
