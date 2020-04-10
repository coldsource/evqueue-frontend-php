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
		this.name = '';
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
		this.setStdin(workflow.createInput());
		
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
	
	setStdin(stdin) {
		this.stdin = stdin;
		this.stdin.name = 'stdin';
		stdin._parent = this;
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
		let inputs_ite = task_node.ownerDocument.evaluate('input',task_node);
		
		let input_node;
		while(input_node = inputs_ite.iterateNext())
		{
			let new_input = this._workflow.createInput(input_node);
			this.addInput(new_input);
		}
		
		let stdin_ite = task_node.ownerDocument.evaluate('stdin',task_node);
		let stdin_node = stdin_ite.iterateNext();
		if(stdin_node)
			this.setStdin(this._workflow.createInput(stdin_node));
	}
	
	toXML(xmldoc) {
		let task_node = xmldoc.createElement('task');
		
		if(this.type && this.type=='SCRIPT')
			task_node.setAttribute('type', this.type);
		if(this.type=='BINARY')
			task_node.setAttribute('path', this.path);
		else if(this.type=='SCRIPT')
		{
			task_node.setAttribute('name', this.name);
			
			let script_node = task_node.appendChild(xmldoc.createElement('script'));
			if(script_type=='static')
				script_node.appendChild(xmldoc.createTextNode(this.script_source));
			else if(script_type=='dynamic')
			{
				let value_node = script_node.appendChild(xmldoc.createElement('value'));
				value_node.setAttribute('select', this.script_xpath);
			}
		}
		task_node.setAttribute('output-method', this.output_method);
		task_node.setAttribute('merge-stderr', this.merge_stderr?'yes':'no');
		if(this.wd)
			task_node.setAttribute('wd', this.wd);
		if(this.condition)
			task_node.setAttribute('condition', this.condition);
		if(this.loop)
			task_node.setAttribute('loop', this.loop);
		if(this.iteration_condition)
			task_node.setAttribute('iteration-condition', this.iteration_condition);
		if(this.retry_schedule)
			task_node.setAttribute('retry_schedule', this.retry_schedule);
		if(this.retry_retval)
			task_node.setAttribute('retry_retval', this.retry_retval);
		task_node.setAttribute('parameters-mode', this.parametersmode);
		if(this.queue)
			task_node.setAttribute('queue', this.queue);
		if(this.queue_host)
			task_node.setAttribute('queue_host', this.queue_host);
		if(this.user)
			task_node.setAttribute('user', this.user);
		if(this.host)
			task_node.setAttribute('host', this.host);
		if(this.use_agent)
			task_node.setAttribute('use-agent', this.use_agent?'yes':'no');
		
		for(let i=0;i<this.inputs.length;i++)
			task_node.appendChild(this.inputs[i].toXML(xmldoc));
		
		if(this.stdin.parts.length>0)
		{
			let stdin_node = task_node.appendChild(xmldoc.createElement('stdin'));
			for(let i=0;i<this.stdin.parts.length;i++)
				stdin_node.appendChild(this.stdin.parts[i].toXML(xmldoc));
		}
		
		return task_node;
	}
}
