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

class TagSelector extends evQueueComponent {
	constructor(props) {
		super(props);
		
		this.state.values = [];
		
		this.changeTag = this.changeTag.bind(this);
	}
	
	componentDidMount() {
		var self = this;
		this.API({
			group: 'tags',
			action: 'list'
		}).then( (data) => {
			var tags = this.xpath('/response/tag',data.documentElement);
			
			var values = [];
			for(var i=0;i<tags.length;i++)
				values.push({name: tag.label, value: tag.id});
			this.setState({values: values});
		});
	}
	
	changeTag(event) {
		this.setState({value:event.target.value});
		if(this.props.onChange)
			this.props.onChange(event);
	}
	
	render() {
		return (
			<Select value={this.props.value} values={this.state.values} name={this.props.name} placeholder="Choose a tag" onChange={this.changeTag}>
			</Select>
		);
	}
}