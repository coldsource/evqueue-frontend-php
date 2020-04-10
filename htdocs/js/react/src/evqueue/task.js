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

import {input} from './input.js';

export class task {
	constructor(desc = {}, workflow)
	{
		if(task.global===undefined)
		{
			task.global = {
				id: 1
			};
		}
		
		this.type = 'BINARY';
		this.path = '';
		this.script_type = 'static';
		this.script_xpath = '';
		this.script_source = '';
		this.output_method = '';
		this.merge_stderr = false;
		this.wd = '';
		this.condition = '';
		this.loop = '';
		this.iteration_condition = '';
		this.retry_schedule = '';
		this.retry_retval = '';
		this.parametersmode = 'CMDLINE';
		this.queue = 'default';
		this.queue_host = '';
		this.user = '';
		this.host = '';
		this.use_agent = false;
		this.inputs = [];
		
		this.stdin = workflow.createInput({name: 'stdin'});
		this.stdin._parent = this;
		
		if(typeof desc=='object') {
			Object.assign(this, desc);
			
			this.merge_stderr = this.merge_stderr=='yes'?true:false;
			this.use_agent = this.use_agent=='yes'?true:false;
		}
		
		this._id = task.global.id++;
		this._workflow = workflow;
	}
	
	getWorkflow() {
		return this._workflow;
	}
	
	getJob() {
		return this._parent;
	}
	
	getPath() {
		return this.type=='BINARY'?this.path:this.name
	}
	
	addInput(inputobj, copy) {
		var inputs = this.inputs;
		if(copy)
			inputs = this.inputs.concat();
		
		if(inputobj===undefined)
			inputobj = this._workflow.createInput();
		
		inputobj._parent = this;
		inputs.push(inputobj);
		
		return inputs;
	}
	
	removeInput(input, copy) {
		var inputs = this.inputs;
		if(copy)
			inputs = this.inputs.concat();
		
		for(var i=0;i<inputs.length;i++)
		{
			if(inputs[i]===input)
			{
				inputs.splice(i, 1);
				return inputs;
			}
		}
		
		return inputs;
	}
}
