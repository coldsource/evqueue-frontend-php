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

export class Checkbox extends React.Component {
	constructor(props) {
		super(props);
		
		this.changeValue = this.changeValue.bind(this);
	}
	
	changeValue(e) {
		var event = {
			target: {
				name: this.props.name,
				value: !this.props.value
			}
		};
		
		if(this.props.onChange)
			this.props.onChange(event);
	}
	
	render() {
		var icon = this.props.value?'fa-check-square-o':'fa-square-o';
		return (
			<span className={"evq-checkbox faicon "+icon} onClick={ this.changeValue }></span>
		);
	}
}
