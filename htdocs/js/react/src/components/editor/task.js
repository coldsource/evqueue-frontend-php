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

import {Dialogs} from '../../ui/dialogs.js';

export class Task extends React.Component {
	constructor(props) {
		super(props);
	}
	
	renderName() {
		var task = this.props.task;
		
		let path = task.getPath()
		if(path=='')
			return (<span className="cmd action error">empty task</span>);
		
		var parts = path.split('/');
		
		var cmd = parts[parts.length-1];
		var params = '';
		
		var idx = cmd.indexOf(' ');
		if(idx!=-1)
		{
			params = cmd.substr(idx);
			cmd = cmd.substr(0,idx);
		}
		
		if(cmd=='')
			return (<span className="cmd action error">incomplete filename</span>);
		
		return (
			<span>
				<span className="cmd action">{cmd}</span>
				<span className="params">{params}</span>
				{ task.condition || task.iteration_condition?(<span className="faicon fa-code-fork" title="This task has a condition"></span>):'' }
				{ task.loop!=''?(<span className="faicon fa-repeat" title="This task has a loop"></span>):'' }
				{ task.retry_schedule!=''?(<span className="faicon fa-bug" title="This task has a retry schedule"></span>):'' }
			</span>
		);
	}
	
	render() {
		return (
			<div draggable className="task" onDragStart={this.props.onDragStart} onClick={ (e) => this.props.openDialog('task', this.props.task._id) }>
				{ this.renderName() }
			</div>
		);
	}
}
