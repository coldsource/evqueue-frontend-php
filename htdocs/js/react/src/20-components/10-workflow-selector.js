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

class WorkflowSelector extends evQueueComponent {
	constructor(props) {
		super(props);
		
		this.state.workflows = [];
		
		this.changeWorkflow = this.changeWorkflow.bind(this);
	}
	
	componentDidMount() {
		var self = this;
		this.API({group:'workflows',action:'list'}).then( (data) => {
			var workflows = this.xpath('/response/workflow',data.documentElement);
			
			var groupped_workflows = {};
			for(var i=0;i<workflows.length;i++)
			{
				var group = workflows[i].group?workflows[i].group:'No group';
				if(groupped_workflows[group] === undefined)
					groupped_workflows[group] = [];
				groupped_workflows[group].push(workflows[i]);
			}
			
			for(var group in groupped_workflows)
				groupped_workflows[group].sort(function(a,b) {return a.name.toLowerCase()<=b.name.toLowerCase()?-1:1});
			
			self.setState({workflows:groupped_workflows});
		});
	}
	
	renderWorkflows() {
		var ret_groups = [];
		var groups = Object.keys(this.state.workflows);
		groups.sort(function(a,b) { return a.toLowerCase()<=b.toLowerCase()?-1:1});
		for(var i=0;i<groups.length;i++)
		{
			var group = groups[i];
			var ret_wfs = [];
			for(var j=0;j<this.state.workflows[group].length;j++)
			{
				var wf = this.state.workflows[group][j];
				var value = this.props.valueType=='id'?wf.id:wf.name;
				ret_wfs.push(<option key={wf.name} value={value}>{wf.name}</option>);
			}
			ret_groups.push(<optgroup key={group} label={group}>{ret_wfs}</optgroup>);
		}
		return ret_groups;
	}
	
	changeWorkflow(event) {
		this.setState({value:event.target.value});
		if(this.props.onChange)
			this.props.onChange(event);
	}
	
	render() {
		return (
			<select value={this.props.value} name={this.props.name} onChange={this.changeWorkflow}>
				<option value={this.props.valueType=='id'?0:''}>Choose a workflow</option>
				{this.renderWorkflows()}
			</select>
		);
	}
}