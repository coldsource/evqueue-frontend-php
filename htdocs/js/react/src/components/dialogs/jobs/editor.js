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
import {Tabs} from '../../../ui/tabs.js';
import {Tab} from '../../../ui/tab.js';

export class JobEditor extends React.Component {
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
	
	renderTabDescription() {
		return (
			<div className="formdiv">
				<div>
					<label>Name</label>
					<input type="text" name="name" value={this.props.desc.name} onChange={this.props.onChange} />
				</div>
			</div>
		);
	}
	
	renderTabConditionsLoop() {
		var wait_condition = this.props.desc.condition.substr(0,8)=="evqWait(";
		var wait_iteration_condition = this.props.desc.iteration_condition.substr(0,8)=="evqWait(";
		
		return (
			<div className="formdiv">
				<div>
					<label>Condition</label>
					<input type="text" name="condition" value={this.props.desc.condition} onChange={this.props.onChange} />
				</div>
				<div>
					<label>Wait for condition to become true</label>
					<Checkbox name="wait_condition" value={wait_condition} onChange={ (e) => this.changeWait(e,'condition',this.props.desc.condition) } />
				</div>
				<div>
					<label>Loop</label>
					<input type="text" name="loop" value={this.props.desc.loop} onChange={this.props.onChange} />
				</div>
				<div>
					<label>Iteration condition</label>
					<input type="text" name="iteration_condition" value={this.props.desc.iteration_condition} onChange={this.props.onChange} />
				</div>
				<div>
					<label>Wait for condition to become true</label>
					<Checkbox name="wait_iteration_condition" value={wait_iteration_condition} onChange={ (e) => this.changeWait(e,'iteration_condition',this.props.desc.iteration_condition) } />
				</div>
			</div>
		);
	}
	
	render() {
		var name = this.props.desc.name?this.props.desc.name:'unnamed';
		return (
			<Dialog title={"Edit job « "+name+" »"} width="800" height="300" onClose={ this.props.onClose }>
				<Tabs>
					<Tab title="Description">
						{ this.renderTabDescription() }
					</Tab>
					<Tab title="Conditions & loop">
					{ this.renderTabConditionsLoop() }
					</Tab>
				</Tabs>
			</Dialog>
		);
	}
}
