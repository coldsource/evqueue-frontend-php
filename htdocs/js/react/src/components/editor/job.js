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
import {Task} from './task.js';

export class Job extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			add_task: false
		};
		
		this.addTask = this.addTask.bind(this);
	}
	
	addTask(e) {
		this.props.job.addTask();
		
		var event = {
			target: {
				name: 'tasks',
				value: this.props.job.tasks
			}
		};
		
		this.props.onChange(event);
	}
	
	renderTasksList() {
		return this.props.job.tasks.map( (task, idx) => {
			return (
				<Task
					task={task}
					key={idx}
					onDragStart={ (e) => this.props.onTaskDragStart(e, task) }
					openDialog={ this.props.openDialog }
				/>
			);
		});
	}
	
	renderTasks() {
		return (
			<div className="tasks">
				{ this.renderTasksList() }
				{ (this.state.add_task && this.props.openDialog)?(<span className="faicon fa-plus" title="Add a new task to this job" onClick={ this.addTask }></span>):'' }
			</div>
		);
	}
	
	render() {
		var job = this.props.job;
		
		return (
			<div className="job" draggable
				onDragStart={ (e) => this.props.onJobDragStart(e, this.props.job) }
				onDragOver={ this.props.onJobDragOver }
				onDragLeave={ this.props.onJobDragLeave }
				onDrop={ this.props.onJobDrop }
				onMouseEnter={ () => this.setState({add_task: true}) }
				onMouseLeave={ () => this.setState({add_task: false}) }
			>
				<div className="action title" onClick={ (e) => this.props.openDialog?this.props.openDialog('job', job._id) :false }>
					<div className="icons">
						{ job.condition || job.iteration_condition?(<span className="faicon fa-code-fork" title="This job has a condition"></span>):'' }
						{ job.loop?(<span className="faicon fa-repeat" title="This job has a loop"></span>):'' }
					</div>
					{ job.name?job.name:"\xa0" }
				</div>
				{ this.renderTasks() }
			</div>
		);
	}
}
