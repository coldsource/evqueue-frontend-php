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

class Autocomplete extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			dropdown_opened: false,
			filter: ''
		};
		
		this.ref = React.createRef();
		
		this.toggleDropdown = this.toggleDropdown.bind(this);
		this._mouseDown = this._mouseDown.bind(this);
		this.applyFilter = this.applyFilter.bind(this);
		this.changeValue = this.changeValue.bind(this);
	}
	
	componentDidMount() {
		document.addEventListener('mousedown', this._mouseDown);
		
		this.global_width = window.getComputedStyle(this.ref.current).getPropertyValue('width');
	}
	
	componentWillUnmount() {
		document.removeEventListener('mousedown', this._mouseDown);
  }
  
  _mouseDown(event) {
		if(this.ref.current && !this.ref.current.contains(event.target))
			this.setState({dropdown_opened:false});
	}
	
	toggleDropdown() {
		this.setState({dropdown_opened: !this.state.dropdown_opened});
	}
	
	applyFilter() {
		var filter = this.props.value.toLowerCase();
		
		if(filter=='')
			return this.props.autocomplete;
		
		var autocomplete = [];
		for(var i=0;i<this.props.autocomplete.length;i++)
		{
			if(this.props.autocomplete[i].toLowerCase().includes(filter))
				autocomplete.push(this.props.autocomplete[i]);
		}
		
		return autocomplete;
	}
	
	changeValue(value) {
		var event = {
			target: {
				name: this.props.name,
				value: value
			}
		};
		
		if(this.props.onChange)
			this.props.onChange(event);
	}
	
	renderDropdown() {
		if(!this.state.dropdown_opened)
			return;
		
		return (
			<div className="evq-autocomplete-dropdown" style={{width:this.global_width}}>
				<ul>{this.renderAutocomplete()}</ul>
			</div>
		);
	}
	
	renderAutocomplete() {
		var autocomplete = this.applyFilter();
		
		if(autocomplete.length==0)
			return (<li>No results found</li>);
		
		return autocomplete.map( (value) => {
			return (<li key={value} onClick={ () => {this.setState({dropdown_opened:false}); this.changeValue(value)} }>{value}</li>);
		});
	}
	
	render() {
		var className = 'evq-autocomplete';
		if(this.props.className)
			className += ' '+this.props.className;
		
		return (
			<div ref={this.ref} className={className}>
				<input type="text" value={this.props.value} onChange={ (event) => {this.changeValue(event.target.value)} } onFocus={this.toggleDropdown} />
				{this.renderDropdown()}
			</div>
		);
	}
}