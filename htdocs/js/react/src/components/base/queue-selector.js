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

export class QueueSelector extends evQueueComponent {
	constructor(props) {
		super(props);
		
		this.state.values = [];
	}
	
	componentDidMount() {
		var api = { node:this.props.node, group:'queuepool',action:'list',attributes:{} };
		this.Subscribe('QUEUE_CREATED',api,false,this.props.id);
		this.Subscribe('QUEUE_MODIFIED',api,false,this.props.id);
		this.Subscribe('QUEUE_REMOVED',api,true,this.props.id);
	}
	
	evQueueEvent(data) {
		var queues = this.xpath('/response/queue',data.documentElement);
		
		var values = [];
		for(var i=0;i<queues.length;i++)
		{
			var queue = queues[i];
			values.push({name: queue.name, value: queue.name});
		}
		
		this.setState({values: values});
	}
	
	render() {
		return (
			<Select value={this.props.value} values={this.state.values} name={this.props.name} onChange={this.props.onChange}>
			</Select>
		);
	}
}
