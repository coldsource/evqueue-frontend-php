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

import {evQueueComponent} from './evqueue-component.js';
import {Select} from '../../ui/select.js';

export class WorkflowSelector extends evQueueComponent {
	constructor(props) {
		super(props);
		
		this.state.values = [];
		
		this.changeWorkflow = this.changeWorkflow.bind(this);
	}
	
	componentDidMount() {
		var self = this;
		this.API({group:'workflows',action:'list'}).then( (data) => {
			var workflows = this.xpath('/response/workflow',data.documentElement);
			
			var values = [];
			for(var i=0;i<workflows.length;i++)
			{
				values.push({
					group: workflows[i].group?workflows[i].group:'No group',
					name: workflows[i].name,
					value: this.props.valueType=='id'?workflows[i].id:workflows[i].name
				});
			}
			
			this.setState({values: values});
		});
	}
	
	changeWorkflow(event) {
		this.setState({value:event.target.value});
		if(this.props.onChange)
			this.props.onChange(event);
	}
	
	render() {
		return (
			<Select value={this.props.value} values={this.state.values} name={this.props.name} placeholder="Choose a workflow" onChange={this.changeWorkflow}>
			</Select>
		);
	}
}
