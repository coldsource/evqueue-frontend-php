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

import {Dialogs} from '../../../ui/dialogs.js';
import {SortableHandle} from '../../../ui/sortable-handle.js';
import {ValueSelector} from '../workflows/value-selector.js';
import {XPathHelper} from '../../base/xpath-helper.js';

export class TaskInput extends React.Component {
	constructor(props) {
		super(props);
		
		this.addPart = this.addPart.bind(this);
		this.removePart = this.removePart.bind(this);
	}
	
	triggerPartsChange(value) {
		var event = {
			target: {
				name: 'parts',
				value: value
			}
		};
		
		this.props.onChange(event, this.props.input);
	}
	
	addPart(e) {
		var parts = this.props.input.addPart(undefined, true);
		this.triggerPartsChange(parts);
		
		this.props.openDialog('task-input-select', parts[parts.length-1]._id)
	}
	
	removePart(e, idx) {
		var parts = this.props.input.removePart(idx, true);
		this.triggerPartsChange(parts);
	}
	
	renderParts() {
		var input = this.props.input;
		var task = input.getTask();
		var workflow = task.getWorkflow();
		var path = workflow.getTaskPath(task._id);
		
		return input.parts.map( (part, idx) => {
			let name = "\xa0";
			if(part.value)
			{
				let composed = XPathHelper.parseValue(path, part.value);
				if(composed.path)
				{
					let parts = composed.path.split('/');
					let cmd = parts[parts.length-1];
					
					let cmd_parts = cmd.split(' ');
					name = 'Task: '+cmd_parts[cmd_parts.length-1];
					if(composed.xpath)
						name += ', node: '+composed.xpath;
				}
				else if(composed.name)
				{
					name = composed.name;
					if(composed.xpath)
						name += ', node: '+composed.xpath;
				}
				else
					name = part.value;
			}
			
			return (
				<div key={idx} className="input-part">
					<span onClick={ (e) => this.props.openDialog('task-input-select', part._id) }>{name}</span>
					<span className="faicon fa-remove" title="Remove this input part" onClick={ (e) => this.removePart(e, idx) }></span>
				</div>
			);
		});
	}
	
	render() {
		var input = this.props.input;
		var name = input.name?input.name:'<no name>';
		
		return (
			<div className="input">
				<div className="input-name">
					{ this.props.removeInput?(<span className="faicon fa-remove" onClick={ (e) => this.props.removeInput(e, this.props.input) }>&#160;</span>):false }
					<SortableHandle>
						<span className="action" onClick={ (e) => this.props.editable===false?false:this.props.openDialog('task-input', input._id) }>
							{name}
							{ input.condition ?(<span className="faicon fa-code-fork" title="This input has a condition"></span>):'' }
							{ input.loop?(<span className="faicon fa-repeat" title="This input has a loop"></span>):'' }
						</span>
					</SortableHandle>
				</div>
				<div className="input-value">
					{ this.renderParts() }
					<span className="faicon fa-plus" title="Add a new part to this input" onClick={ this.addPart }></span>
				</div>
			</div>
		);
	}
}
