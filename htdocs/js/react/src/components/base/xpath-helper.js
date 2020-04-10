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

import {Select} from '../../ui/select.js';

export class XPathHelper extends React.Component {
	constructor(props) {
		super(props);
		
		this.composed = {
			node: '',
			xpath: ''
		};
		
		this.changeValue = this.changeValue.bind(this);
	}
	
	changeValue(e, type) {
		if(this.composed.xpath=='' && e.target.value=='/')
			return;
		
		var val;
		if(e.target.name=='node')
			val = e.target.value + '/' + this.composed.xpath;
		else
			val = this.composed.node + '/' + e.target.value;
		
		var event = {
			target: {
				name: this.props.name,
				value: val
			}
		};
		
		this.props.onChange(event);
	}
	
	static parseValue(path, value) {
		var composed = {
			node: '',
			name: '',
			path: '',
			xpath: ''
		};
		
		for(var i=0;i<path.length;i++)
		{
			var xpath_value = path[i].value;
			if(value.substr(0,xpath_value.length+1)==xpath_value+'/' || value==xpath_value)
			{
				composed.node = xpath_value;
				composed.name = path[i].name;
				if(path[i].path!==undefined)
					composed.path = path[i].path;
				composed.xpath = value.substr(xpath_value.length+1);
				break;
			}
		}
		
		return composed;
	}
	
	static isValid(path, value) {
		var composed = XPathHelper.parseValue(path, value);
		return composed.node!='';
	}
	
	render() {
		var path = this.props.path;
		var value = this.props.value;
		
		this.composed = XPathHelper.parseValue(path, value);
		
		return (
			<div className="evq-xpath-helper">
				<fieldset>
					<legend>Choose task</legend>
					<Select name="node" values={path} value={this.composed.node} filter={false} onChange={ (e) => this.changeValue(e, 'value') } />
				</fieldset>
				<fieldset>
					<legend>Choose output node</legend>
					<input type="text" name="xpath_value_node" value={this.composed.xpath} onChange={ (e) => this.changeValue(e, 'value') } />
				</fieldset>
			</div>
		);
	}
}
