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
import {Autocomplete} from '../../ui/autocomplete.js';

export class GroupAutocomplete extends evQueueComponent {
	constructor(props) {
		super(props);
		
		this.state.groups = [];
	}
	
	componentDidMount() {
		this.API({
			group: 'workflows',
			action: 'list'
		}).then( (xml) => {
			let data = this.parseResponse(xml);
			let groups = {};
			for(let i=0;i<data.response.length;i++)
				groups[data.response[i].group] = "";
			
			this.setState({groups: Object.keys(groups)});
		});
	}
	
	render() {
		return (
			<Autocomplete value={this.props.value} autocomplete={this.state.groups} name={this.props.name} onChange={this.props.onChange} />
		);
	}
}
