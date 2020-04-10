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

export class input_part {
	constructor(desc = {}, workflow)
	{
		if(input_part.global===undefined)
		{
			input_part.global = {
				id: 1
			};
		}
		
		this.type = '';
		this.value = '';
		
		if(typeof desc=='object') {
			Object.assign(this, desc);
		}
		
		this._id = input_part.global.id++;
		this._workflow = workflow;
	}
	
	getWorkflow() {
		return this._workflow;
	}
	
	getInput() {
		return this._parent;
	}
	
	toXML(xmldoc) {
		if(this.type=='text')
			return xmldoc.createTextNode(this.value);
		
		let node
		if(this.type=='value')
			node = xmldoc.createElement('value');
		else
			node = xmldoc.createElement('copy');
		
		node.setAttribute('select', this.value);
		
		return node;
	}
}
