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

export class TagSelector extends evQueueComponent {
	constructor(props) {
		super(props);
		
		this.state.values = [];
		
		this.tags = {};
		
		this.changeTag = this.changeTag.bind(this);
	}
	
	componentDidMount() {
		var api = { node:this.props.node, group:'tags',action:'list',attributes:{} };
		this.Subscribe('TAG_CREATED',api,false,this.props.id);
		this.Subscribe('TAG_MODIFIED',api,false,this.props.id);
		this.Subscribe('TAG_REMOVED',api,true,this.props.id);
	}
	
	evQueueEvent(data) {
		var tags = this.xpath('/response/tag',data.documentElement);
		
		var values = [];
		for(var i=0;i<tags.length;i++)
		{
			var tag = tags[i];
			values.push({name: tag.label, value: tag.id});
			this.tags[tag.id] = tag.label;
		}
		
		this.setState({values: values});
	}
	
	changeTag(event) {
		this.setState({value:event.target.value});
		if(this.props.onChange)
			this.props.onChange(event, this.tags[event.target.value]);
	}
	
	render() {
		return (
			<Select
				value={this.props.value}
				values={this.state.values}
				name={this.props.name}
				placeholder="Choose a tag"
				onChange={this.changeTag}
				onSubmit={this.props.onSubmit}
			/>
		);
	}
}
