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
import {JobEditor} from '../dialogs/jobs/editor.js';

export class Job extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			add_task: false
		};
	}
	
	renderTasksList() {
		return this.props.desc.tasks.map( (task, idx) => {
			return (<div key={idx}>{task.path}</div>);
		});
	}
	
	renderTasks() {
		return (
			<div className="tasks">
				{ this.renderTasksList() }
				{ (this.state.add_task && this.props.onTaskAdd)?(<span className="faicon fa-plus" title="Add a new task to this job" onClick={ (e) => this.props.onTaskAdd(e, this.props.desc) }></span>):'' }
			</div>
		);
	}
	
	render() {
		var job = this.props.desc;
		
		return (
			<div className="job" draggable
				onDragStart={ (e) => this.props.onDragStart(e, this.props.desc) }
				onMouseEnter={ () => this.setState({add_task: true}) }
				onMouseLeave={ () => this.setState({add_task: false}) }
			>
				<div className="action title" onClick={ (e) => this.props.onChange?Dialogs.open(JobEditor, {desc:this.props.desc, onChange: this.props.onChange}) :false }>
					{ job.condition || job.iteration_condition?(<span className="faicon fa-code-fork"></span>):'' }
					{ job.loop?(<span className="faicon fa-repeat"></span>):'' }
					{ job.name }
				</div>
				{ this.renderTasks() }
			</div>
		);
	}
}
