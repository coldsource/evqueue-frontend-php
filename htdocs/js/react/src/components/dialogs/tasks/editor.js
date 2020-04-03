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

import {Checkbox} from '../../../ui/checkbox.js';
import {Dialog} from '../../../ui/dialog.js';
import {Select} from '../../../ui/select.js';
import {Tabs} from '../../../ui/tabs.js';
import {Tab} from '../../../ui/tab.js';

export class TaskEditor extends React.Component {
	constructor(props) {
		super(props);
	}
	
	changeWait(e, condition_name, condition_value) {
		if(e.target.value)
			condition_value = "evqWait("+condition_value+")";
		else
		{
			condition_value = condition_value.substr(8);
			condition_value = condition_value.substr(0,condition_value.length-1);
		}
		
		var event = {
			target: {
				name: condition_name,
				value: condition_value
			}
		};
		
		this.props.onChange(event);
	}
	
	renderTabPath() {
		var task = this.props.task;
		
		return (
			<div className="formdiv">
				<div>
					<label>Type</label>
					<Select name="type" value={task.type} values={[{name: 'binary', value: 'BINARY'}, {name: 'script', value: 'SCRIPT'}]} filter={false} onChange={this.props.onChange} />
				</div>
				<div>
					<label>Path</label>
					<input type="text" name="path" value={task.path} onChange={this.props.onChange} />
				</div>
				<div>
					<label>Working directory</label>
					<input type="text" name="wd" value={task.wd} onChange={this.props.onChange} />
				</div>
			</div>
		);
	}
	
	renderTabInputs() {
		return;
	}
	
	renderTabOutput() {
		return;
	}
	
	renderTabConditionsLoop() {
		var task = this.props.task;
		
		var wait_condition = task.condition.substr(0,8)=="evqWait(";
		var wait_iteration_condition = task.iteration_condition.substr(0,8)=="evqWait(";
		
		return (
			<div className="formdiv">
				<div>
					<label>Condition</label>
					<input type="text" name="condition" value={task.condition} onChange={this.props.onChange} />
				</div>
				<div>
					<label>Wait for condition to become true</label>
					<Checkbox name="wait_condition" value={wait_condition} onChange={ (e) => this.changeWait(e,'condition',task.condition) } />
				</div>
				<div>
					<label>Loop</label>
					<input type="text" name="loop" value={task.loop} onChange={this.props.onChange} />
				</div>
				<div>
					<label>Iteration condition</label>
					<input type="text" name="iteration_condition" value={task.iteration_condition} onChange={this.props.onChange} />
				</div>
				<div>
					<label>Wait for condition to become true</label>
					<Checkbox name="wait_iteration_condition" value={wait_iteration_condition} onChange={ (e) => this.changeWait(e,'iteration_condition',task.iteration_condition) } />
				</div>
			</div>
		);
	}
	
	renderTabQueueRetry() {
		return;
	}
	
	renderTabRemoteExecution() {
		return;
	}
	
	renderTabStdin() {
		return;
	}
	
	render() {
		var task = this.props.task;
		
		return (
			<Dialog title={"Edit task « "+task.path+" »"} width="800" height="300" onClose={ this.props.onClose }>
				<Tabs>
					<Tab title="Path">
						{ this.renderTabPath() }
					</Tab>
					<Tab title="Inputs">
						{ this.renderTabInputs() }
					</Tab>
					<Tab title="Output">
						{ this.renderTabOutput() }
					</Tab>
					<Tab title="Conditions & loop">
						{ this.renderTabConditionsLoop() }
					</Tab>
					<Tab title="Queue & retry">
						{ this.renderTabQueueRetry() }
					</Tab>
					<Tab title="Remote execution">
						{ this.renderTabRemoteExecution() }
					</Tab>
					<Tab title="Stdin">
						{ this.renderTabStdin() }
					</Tab>
				</Tabs>
			</Dialog>
		);
	}
}
