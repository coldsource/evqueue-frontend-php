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

export class DatePicker extends React.Component {
	constructor(props) {
		super(props);
		
		var now = new Date();
		this.state = {
			year: now.getFullYear(),
			month: now.getMonth(),
			displayCalendar: false,
		};
		
		this.ref = React.createRef();
		this.input_ref = React.createRef();
		
		this.weeks = [];
		
		this.prevMonth = this.prevMonth.bind(this);
		this.nextMonth = this.nextMonth.bind(this);
		this.changeDate = this.changeDate.bind(this);
		this.pickDate = this.pickDate.bind(this);
		this._onFocus = this._onFocus.bind(this);
		this._mouseDown = this._mouseDown.bind(this);
	}
	
	componentDidMount() {
		document.addEventListener('mousedown', this._mouseDown);
	}
	
	componentWillUnmount() {
		document.removeEventListener('mousedown', this._mouseDown);
  }
	
	changeDate(event) {
		console.log(event);
		if(this.props.onChange)
			this.props.onChange(event);
	}
	
	pickDate(date) {
		var month = ''+(this.state.month+1);
		var date = ''+date;
		var date = this.state.year+'-'+month.padStart(2,'0')+'-'+date.padStart(2,'0');
		
		var event = {
			target: {
				name: this.props.name,
				value: date
			}
		};
		
		this.setState({displayCalendar:false});
		if(this.props.onChange)
			this.props.onChange(event);
	}
	
	prevMonth() {
		var month = this.state.month;
		var year = this.state.year;
		month--;
		if(month<0)
		{
			month = 11;
			year--;
		}
		
		this.setState({month: month,year: year});
	}
	
	nextMonth() {
		var month = this.state.month;
		var year = this.state.year;
		month++;
		if(month>11)
		{
			month = 0;
			year++;
		}
		
		this.setState({month: month,year: year});
	}
	
	computeWeeks() {
		var days = [];
		
		var base = new Date();
		base.setDate(1);
		base.setMonth(this.state.month);
		base.setFullYear(this.state.year);
		
		var cur = base;
		
		while(cur.getMonth()==base.getMonth())
		{
			days.push({
				day: cur.getDay(),
				date: cur.getDate()
			});
			
			cur = new Date(cur.getTime()+86400*1000);
		}
		
		var pre_days = [];
		for(var i=0;i<days[0].day;i++)
			pre_days.push({day:i});
		
		var post_days = [];
		for(var i=days[days.length-1].day+1;i<=6;i++)
			post_days.push({day:i});
		
		var padded_days = pre_days.concat(days).concat(post_days);
		this.weeks = [];
		for(var i=0;i<padded_days.length;i+=7)
			this.weeks.push(padded_days.slice(i,i+7));
	}
	
	renderMonthYear() {
		var months_names = ['January','February','March','April','May','June','July','August','September','October','November','December'];
		return (<span className="evq-datepicker-title">&#160;{months_names[this.state.month]} {this.state.year}&#160;</span>);
	}
	
	renderWeekdays() {
		var ret = [];
		return ['Su','Mo','Tu','We','Th','Fr','Sa'].map( (weekday,idx) => {
			return (<td key={idx}>{weekday}</td>);
		});
	}
	
	renderDays(days) {
		return days.map( (day,idx) => {
			return (<td key={idx} onClick={() => { this.pickDate(day.date) }}>{day.date}</td>);
		});
	}
	
	renderWeeks() {
		this.computeWeeks();
		
		return this.weeks.map( (week,idx) => {
			return (<tr key={idx}>{this.renderDays(week)}</tr>);
		});
	}
	
	renderCalendar() {
		if(!this.state.displayCalendar)
			return;
		
		return (
			<div className="evq-datepicker-calendar">
				<div>
					<span className="faicon fa-backward" onClick={this.prevMonth}></span>{this.renderMonthYear()}<span className="faicon fa-forward" onClick={this.nextMonth}></span>
				</div>
				<table>
					<thead>
						<tr>{this.renderWeekdays()}</tr>
					</thead>
					<tbody>
						{this.renderWeeks()}
					</tbody>
				</table>
			</div>
		);
	}
	
	render() {
		return (
			<div ref={this.ref} className="evq-datepicker">
				<input ref={this.input_ref} name={this.props.name} value={this.props.value} onChange={this.changeDate} onFocus={this._onFocus} type="text" />
				{this.renderCalendar()}
			</div>
		);
	}
	
	_onFocus(event) {
		this.setState({displayCalendar:true});
	}
	
	_mouseDown(event) {
		if(this.ref.current && !this.ref.current.contains(event.target))
			this.setState({displayCalendar:false});
	}
}
