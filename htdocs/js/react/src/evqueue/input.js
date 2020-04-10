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

import {input_part} from './input-part.js';
import {DOMUtils} from '../utils/DOM.js';

export class input {
	constructor(desc = {}, workflow)
	{
		if(input.global===undefined)
		{
			input.global = {
				id: 1
			};
		}
		
		this.name = '';
		this.condition = '';
		this.loop = '';
		this.parts = [];
		
		this._id = input.global.id++;
		this._workflow = workflow;
		
		if(desc instanceof Element)
			this.fromXML(desc);
		else if(typeof desc=='object')
			this.fromObject(desc);
	}
	
	getWorkflow() {
		return this._workflow;
	}
	
	getTask() {
		return this._parent;
	}
	
	addPart(part, copy) {
		var parts = this.parts;
		if(copy)
			parts = this.parts.concat();
		
		if(part===undefined)
			part = this._workflow.createInputPart();
		
		part._parent = this;
		parts.push(part);
		
		return parts;
	}
	
	removePart(idx, copy) {
		var parts = this.parts;
		if(copy)
			parts = this.parts.concat();
		
		parts.splice(idx, 1);
		
		return parts;
	}
	
	fromObject(desc) {
		Object.assign(this, desc);
	}
	
	fromXML(input_node) {
		this.fromObject(DOMUtils.nodeToObject(input_node));
		
		this.load_input_parts(input_node);
	}
	
	load_input_parts(input_node) {
		var part_node = input_node.firstChild;
		while(part_node) {
			if(part_node.nodeType==Node.TEXT_NODE)
				this.addPart(this._workflow.createInputPart({type: 'text', value: part_node.nodeValue}));
			else if(part_node.nodeType==Node.ELEMENT_NODE)
				this.addPart(this._workflow.createInputPart({type: part_node.nodeName, value: part_node.getAttribute('select')}));
				
			part_node = part_node.nextSibling;
		}
	}
	
	toXML(xmldoc) {
		let input_node = xmldoc.createElement('input');
		
		for(let i=0;i<this.parts.length;i++)
			input_node.appendChild(this.parts[i].toXML(xmldoc));
		
		return input_node;
	}
}
