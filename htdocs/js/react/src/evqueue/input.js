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

export class input {
	constructor(desc = {})
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
		
		if(typeof desc=='object') {
			Object.assign(this, desc);
		}
		
		this._id = input.global.id++;
	}
	
	getTaskId() {
		return this._parent_id;
	}
	
	addPart(part, copy) {
		var parts = this.parts;
		if(copy)
			parts = this.parts.concat();
		
		if(part===undefined)
			part = new input_part();
		
		part._parent_id = this._id;
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
}
