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
import {DOMUtils} from '../utils/DOM.js';

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
		
		this._id = task.global.id++;
		this._workflow = workflow;
		
		if(desc instanceof Element)
			this.fromXML(desc);
		else if(typeof desc=='object')
			this.fromObject(desc);
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
	
	fromObject(desc) {
		Object.assign(this, desc);
		
		this.merge_stderr = this.merge_stderr=='yes'?true:false;
		this.use_agent = this.use_agent=='yes'?true:false;
	}

	fromXML(task_node) {
		this.fromObject(DOMUtils.nodeToObject(task_node));
			
		this.load_inputs(task_node);
		
		if(task_node.hasAttribute('type') && task_node.getAttribute('type')=='SCRIPT')
		{
			var script_ite = task_node.ownerDocument.evaluate('script', task_node);
			var script_node = script_ite.iterateNext();
			this.script_source = script_node.textContent;
		}
	}
	
	load_inputs(task_node) {
		var inputs_ite = task_node.ownerDocument.evaluate('input',task_node);
		
		var input_node;
		while(input_node = inputs_ite.iterateNext())
		{
			var new_input = this._workflow.createInput(input_node);
			this.addInput(new_input);
		}
	}
}
