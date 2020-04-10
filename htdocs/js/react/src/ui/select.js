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

export class Select extends React.Component {
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
		this.changeFilter = this.changeFilter.bind(this);
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
		if(this.props.disabled)
			return;
		
		this.setState({dropdown_opened: !this.state.dropdown_opened});
	}
	
	changeFilter(event) {
		this.setState({filter: event.target.value});
	}
	
	applyFilter() {
		var filter = this.state.filter.toLowerCase();
		
		if(filter=='')
			return this.props.values;
		
		var values = [];
		for(var i=0;i<this.props.values.length;i++)
		{
			if(this.props.values[i].name.toLowerCase().includes(filter))
				values.push(this.props.values[i]);
		}
		
		return values;
	}
	
	changeValue(value) {
		var event = {
			target: {
				name: this.props.name,
				value: value
			}
		};
		
		this.setState({dropdown_opened:false});
		if(this.props.onChange)
			this.props.onChange(event);
	}
	
	getValueName(value) {
		for(var i=0;i<this.props.values.length;i++)
		{
			if(this.props.values[i].value==value)
				return this.props.values[i].name;
		}
		
		return undefined;
	}
	
	renderFilter() {
		if(this.props.filter!==undefined && !this.props.filter)
			return;
		
		return (<input autoFocus type="text" value={this.state.filter} onChange={this.changeFilter} />);
	}
	
	renderDropdown() {
		if(!this.state.dropdown_opened)
			return;
		
		return (
			<div className="evq-select-dropdown" style={{width:this.global_width}}>
				{this.renderFilter()}
				<div className="evq-select-list">
					{this.renderValues()}
				</div>
			</div>
		);
	}
	
	renderValues() {
		var values = this.applyFilter();
		
		if(values.length==0)
			return (<div>No results found</div>);
		
		var groupped_values = {};
		for(var i=0;i<values.length;i++)
		{
			var group = values[i].group?values[i].group:'No group';
			if(groupped_values[group]===undefined)
				groupped_values[group] = [];
			
			groupped_values[group].push(values[i]);
		}
		
		// No groups where set
		if(groupped_values['No group'] && groupped_values['No group'].length==values.length)
			return (<ul>{this.renderGroup(groupped_values['No group'])}</ul>);
		
		var ret = [];
		
		var groups = Object.keys(groupped_values);
		groups.sort(function(a,b) { return a.toLowerCase()<=b.toLowerCase()?-1:1});
		for(var i=0;i<groups.length;i++)
		{
			var group = groups[i];
			ret.push(<div className="evq-select-group" key={group}><h3 key={'group_'+group}>{groups.length>1?group:''}</h3><ul>{this.renderGroup(groupped_values[group])}</ul></div>);
		}
		
		return ret;
	}
	
	renderGroup(group) {
		return group.map( (value) => {
			return (<li key={value.value} onClick={ () => {this.changeValue(value.value)} }>{value.name}</li>);
		});
	}
	
	renderValue() {
		if(this.props.value!==undefined && this.getValueName(this.props.value)!==undefined)
			return (<span>{this.getValueName(this.props.value)}<span className="down faicon fa-chevron-down"></span></span>);
		
		if(this.props.placeholder)
			return (<span className="evq-select-placeholder">{this.props.placeholder}<span className="down faicon fa-chevron-down"></span></span>);
		
		return (<span>&#160;<span className="down faicon fa-chevron-down"></span></span>);
	}
	
	render() {
		var className = 'evq-select';
		if(this.props.className)
			className += ' '+this.props.className;
		
		var value_style = {
			borderRadius: this.state.dropdown_opened?'0.4rem 0.4rem 0rem 0rem':'0.4rem 0.4rem 0.4rem 0.4rem'
		};
		
		return (
			<div ref={this.ref} className={className}>
				<div className={"evq-select-value"+(this.props.disabled?' disabled':'')} style={value_style} onClick={this.toggleDropdown}>
					{this.renderValue()}
				</div>
				{this.renderDropdown()}
			</div>
		);
	}
}
