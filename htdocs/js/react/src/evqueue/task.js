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
	constructor(desc = {})
	{
		if(task.global===undefined)
		{
			task.global = {
				id: 1
			};
		}
		
		this.type = 'BINARY';
		this.path = '';
		this.wd = '';
		this.condition = '';
		this.loop = '';
		this.iteration_condition = '';
		this.retry_schedule = '';
		this.parametersmode = 'CMDLINE';
		this.inputs = [];
		
		if(typeof desc=='object') {
			Object.assign(this, desc);
		}
		
		this._id = task.global.id++;
	}
	
	addInput(inputobj, copy) {
		var inputs = this.inputs;
		if(copy)
			inputs = this.inputs.concat();
		
		if(inputobj===undefined)
			inputobj = new input();
		
		inputobj._parent_id = this._id;
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
