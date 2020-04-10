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
import {XPathInput} from '../../base/xpath-input.js';
import {MagicWand} from '../../base/magic-wand.js';

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
					<input type="text" name="name" value={this.props.job.name} onChange={this.props.onChange} />
				</div>
			</div>
		);
	}
	
	renderTabConditionsLoop() {
		var job = this.props.job;
		
		var wait_condition = this.props.job.condition.substr(0,8)=="evqWait(";
		var wait_iteration_condition = this.props.job.iteration_condition.substr(0,8)=="evqWait(";
		
		return (
			<div className="formdiv">
				<div>
					<label>Condition</label>
					<XPathInput name="condition" value={this.props.job.condition} onChange={this.props.onChange} />
					<MagicWand name="condition" job={job} onChange={this.props.onChange} />
				</div>
				<div>
					<label>Wait for condition to become true</label>
					<Checkbox name="wait_condition" value={wait_condition} onChange={ (e) => this.changeWait(e,'condition',this.props.job.condition) } />
				</div>
				<div>
					<label>Loop</label>
					<XPathInput name="loop" value={this.props.job.loop} onChange={this.props.onChange} />
					<MagicWand name="loop" job={job} onChange={this.props.onChange} />
				</div>
				<div>
					<label>Iteration condition</label>
					<XPathInput name="iteration_condition" value={this.props.job.iteration_condition} onChange={this.props.onChange} />
					<MagicWand name="iteration_condition" job={job} onChange={this.props.onChange} />
				</div>
				<div>
					<label>Wait for condition to become true</label>
					<Checkbox name="wait_iteration_condition" value={wait_iteration_condition} onChange={ (e) => this.changeWait(e,'iteration_condition',this.props.job.iteration_condition) } />
				</div>
			</div>
		);
	}
	
	render() {
		var name = this.props.job.name?this.props.job.name:'unnamed';
		return (
			<Dialog title={"Edit job « "+name+" »"} width="800" onClose={ this.props.onClose }>
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
