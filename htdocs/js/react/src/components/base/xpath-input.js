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

export class XPathInput extends evQueueComponent {
	constructor(props) {
		super(props);
		
		this.state.xpath_error = '';
		
		this.type = 'expression';
		if(this.props.type!==undefined)
			this.type = 'attribute';
		
		this.onChange = this.onChange.bind(this);
	}
	
	checkXPath(value) {
		this.API({
			group: 'xpath',
			action: 'parse',
			attributes: { expression: value }
		}).then( (response) => {
			if(response.documentElement.hasAttribute('parse-error'))
				this.setState({xpath_error: response.documentElement.getAttribute('parse-error')});
			else
				this.setState({xpath_error: ''});
		});
	}
	
	onChange(e) {
		if(this.type=='expression')
			this.checkXPath(e.target.value);
		else {
			var matches = [...e.target.value.matchAll(/({[^}]+})/g)];
			
			if(matches.length==0)
				this.setState({xpath_error: ''});
			else
			{
				for(var i=0;i<matches.length;i++)
				{
					var xpath = matches[i][0];
					xpath = xpath.substr(1);
					xpath = xpath.substr(0,xpath.length-1);
					this.checkXPath(xpath);
				}
			}
		}
		
		this.props.onChange(e);
	}
	
	renderXPathError() {
		if(!this.state.xpath_error)
			return;
		
		return(
			<div className="light-error evq-xpath-input-error">{this.state.xpath_error}</div>
		);
	}
	
	render() {
		return (
			<div className="evq-xpath-input">
				<input ref={this.input_ref} type="text" name={this.props.name} value={this.props.value} onChange={this.onChange} />
				{ this.renderXPathError() }
			</div>
		);
	}
}
