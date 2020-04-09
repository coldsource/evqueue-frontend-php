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

import {Dialogs} from '../../ui/dialogs.js';
import {XPathSelector} from '../dialogs/workflows/xpath-selector.js';

export class MagicWand extends React.Component {
	constructor(props) {
		super(props);
		
		this.change = this.change.bind(this);
	}
	
	change(value) {
		var event = {
			target: {
				name: this.props.name,
				value: value
			}
		};
		
		this.props.onChange(event);
	}
	
	render() {
		var props = {
			onSubmit: this.change
		};
		if(this.props.task)
			props.task = this.props.task;
		else if(this.props.job)
			props.job = this.props.job;
		
		return (
			<span className="faicon fa-magic" onClick={ (e) => Dialogs.open(XPathSelector, props)}/>
		);
	}
}
