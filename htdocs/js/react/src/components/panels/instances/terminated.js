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

import {ListInstances} from './list.js';
import {Panel} from '../../../ui/panel.js';

export class TerminatedInstances extends ListInstances {
	constructor(props) {
		super(props,'any');
		
		// Off-state attributes
		this.search_filters = {};
		this.current_page = 1;
		this.items_per_page = 30;
		
		// Bind actions
		this.nextPage = this.nextPage.bind(this);
		this.previousPage = this.previousPage.bind(this);
		this.removeInstance = this.removeInstance.bind(this);
		this.updateFilters = this.updateFilters.bind(this);
	}
	
	componentDidMount() {
		var api = { node:'*',group:'instances',action:'list' };
		this.Subscribe('INSTANCE_REMOVED',api);
		this.Subscribe('INSTANCE_TERMINATED',api,true);
	}
	
	workflowDuration(wf) {
		return this.humanTime((Date.parse(wf.end_time)-Date.parse(wf.start_time))/1000);
	}
	
	workflowInfos(wf) {
		return ( <span className="faicon fa-comment-o" title={"Comment : " + wf.comment}></span> );
	}
	
	renderActions(wf) {
		return (
			<td className="tdActions">
				<span className="faicon fa-remove" title="Delete this instance" onClick={() => { this.removeInstance(wf.id); }}></span>
			</td>
		);
	}
	
	removeInstance(id) {
		this.simpleAPI({
			group: 'instance',
			action: 'delete',
			attributes: { 'id': id }
		}, 'Instance '+id+' removed', "You are about to remove instance "+id);
	}
	
	WorkflowStatus(wf) {
		if(wf.status = 'TERMINATED' && wf.errors > 0)
			return <span className="faicon fa-exclamation error" title="Errors"></span>;
		
		if(wf.status = 'TERMINATED' && wf.errors == 0)
			return <span className="faicon fa-check success" title="Workflow terminated"></span>;
	}
	
	renderTitle() {
		var title = (
			<span>
				Terminated workflows
				&#160;
				{ this.current_page>1?(<span className="faicon fa-backward" onClick={this.previousPage}></span>):'' }
				&#160;
				{ (this.current_page-1)*this.items_per_page + 1 } - { this.current_page*this.items_per_page } &#47; {this.state.workflows.current.rows}
				{ this.current_page*this.items_per_page<this.state.workflows.current.rows?(<span className="faicon fa-forward" onClick={this.nextPage}></span>):''}
			</span>
			
		);
		
		var actions = [
			{icon:'fa-refresh '+(this.state.refresh?' fa-spin':''), callback:this.toggleAutorefresh}
		];
		
		return (
			<Panel left="" title={title} actions={actions} />
		);
	}
	
	updateFilters(search_filters) {
		Object.assign(this.search_filters, search_filters);
		
		this.Unsubscribe('INSTANCE_TERMINATED');
		
		this.search_filters.limit = this.items_per_page;
		this.search_filters.offset = (this.current_page-1)*this.items_per_page;
		
		var api = {
			group: 'instances',
			action: 'list',
			attributes: search_filters
		};
		
		this.Subscribe('INSTANCE_TERMINATED',api,true);
	}
	
	nextPage() {
		this.current_page++;
		this.updateFilters(this.search_filters,this.current_page);
	}
	
	previousPage() {
		this.current_page--;
		this.updateFilters(this.search_filters,this.current_page);
	}
}
