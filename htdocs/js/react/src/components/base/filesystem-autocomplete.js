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

export class FilesystemAutocomplete extends evQueueComponent {
	constructor(props) {
		super(props);
		
		this.state.paths = [];
		
		this.onChange = this.onChange.bind(this);
	}
	
	componentDidMount() {
		var val = this.props.value;
		
		var parts = val.split('/');
		parts[parts.length-1] = '';
		var path = parts.join('/');;
		this.fillAutocomplete(path);
	}
	
	fillAutocomplete(val) {
		var type = this.props.type?this.props.type:'file';
		
		if (val.substr(val.length - 1) == "/" || val == "") {
			this.API({
				group: 'filesystem',
				action: 'list',
				attributes: {path: val}
			}).then( (response) => {
				var data = this.parseResponse(response,'/response/*');
				var paths = [];
				for(var i=0;i<data.response.length;i++)
				{
					if(type=='file')
						paths.push(val+data.response[i].name);
					else if(type=='directory' && data.response[i].type=='directory')
						paths.push(val+data.response[i].name);
				}
				
				this.setState({paths: paths});
			});
		}
	}
	
	onChange(e) {
		this.fillAutocomplete(e.target.value);
		
		this.props.onChange(e);
	}
	
	render() {
		return (
			<Autocomplete value={this.props.value} autocomplete={this.state.paths} name={this.props.name} onChange={this.onChange} />
		);
	}
}
