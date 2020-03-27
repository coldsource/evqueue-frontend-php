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

import {evQueueComponent} from '../../base/evqueue-component.js';

export class LogsFilters extends evQueueComponent {
	constructor(props) {
		super(props);
		
		this.state.opened = false;
		this.state.filters = {};
		
		this.toggleFilters = this.toggleFilters.bind(this);
	}
	
	componentDidMount() {
		this.API({
			node: '*',
			group: 'status',
			action: 'query',
			attributes: { type: 'configuration' }
		}).then( (data) => {
			for(var i=0;i<data.length;i++)
			{
				var filter = this.xpath("/response/configuration/entry[@name = 'logger.db.filter']",data[i].documentElement)[0].value;
				this.state.filters[data[i].documentElement.getAttribute('node')] = filter;
			}
		});
	}
	
	toggleFilters() {
		this.setState({opened:!this.state.opened});
	}
	
	evQueueEvent(response, ref) {
		var data = this.parseResponse(response,'/response/*');
		
		if(ref=='workflow')
		{
			var workflows = {};
			var group_workflows = {};
			var groups = [];
			var git_workflows = this.state.git_workflows;
			for(var i=0;i<data.response.length;i++)
			{
				let workflow = data.response[i];
				var group = workflow.group?workflow.group:'No group';
				
				if(group_workflows[group]===undefined)
				{
					group_workflows[group] = [];
					groups.push(group);
				}
				
				group_workflows[group].push(workflow);
				workflows[workflow.name] = workflow;
			}
			
			groups.sort((a, b) => {
				if(a=='No group')
					return 1;
				if(b=='No group')
					return -1;
				return a>b;
			});
			
			this.setState({workflows: workflows, group_workflows: group_workflows, groups: groups});
		}
	}
	
	renderFilters() {
		if(!this.state.opened)
			return;
		
		return (
			<table>
				<tbody>
					{ this.renderFiltersTable() }
				</tbody>
			</table>
		);
	}
	
	renderFiltersTable() {
		return this.state.cluster.nodes_names.map( (node, idx) => {
			return (
				<tr key={idx}>
					<td>{node}</td>
					<td className="right bold">{this.state.filters[node]?this.state.filters[node]:'UNKNOWN'}</td>
				</tr>
			);
		});
	}
	
	render() {
		var actions = [
			{icon:'fa-cloud', title: "Pull git repository", callback:this.gitPull},
			{icon:'fa-file-o', title: "Create new repository", callback:this.createWorkflow}
		];
		
		return (
			<div className="evq-logs-filters">
				<a className="action" onClick={this.toggleFilters}>Engine filters</a><span></span>
				{this.renderFilters()}
			</div>
		);
	}
}
