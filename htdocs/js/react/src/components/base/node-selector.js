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

export class NodeSelector extends evQueueComponent {
	constructor(props) {
		super(props);
	}
	
	render() {
		var nodes = this.state.cluster.nodes_names;
		var values = [];
		if(this.props.all)
			values.push({name: 'All', value: ''});
		for(var i=0;i<nodes.length;i++)
			values.push({name: nodes[i], value: nodes[i]});
		
		return (
			<Select filter={false} value={this.props.value} values={values} name={this.props.name} placeholder="Choose a node" onChange={this.props.onChange}>
			</Select>
		);
	}
}
