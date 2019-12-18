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

class TerminatedInstances extends ListInstances {
	constructor(props) {
		super(props);
		
		// Off-state attributes
		this.search_filters = {};
		this.current_page = 1;
		this.items_per_page = 30;
		
		// Bind actions
		this.nextPage = this.nextPage.bind(this);
		this.previousPage = this.previousPage.bind(this);
		this.node = 'any';
	}
	
	componentDidMount() {
		var self = this;
		super.componentDidMount().then( () => {
			var api = { group:'instances',action:'list' };
			self.evqueue.Subscribe('INSTANCE_TERMINATED',api);
		});
	}
	
	workflowDuration(wf) {
		return this.humanTime((Date.parse(wf.end_time)-Date.parse(wf.start_time))/1000);
	}
	
	workflowInfos(wf) {
		return ( <span className="faicon fa-comment-o" title={"Comment : " + wf.comment}></span> );
	}
	
	renderActions() {
		return (
			<td className="tdActions">
				<span className="faicon fa-remove" title="Delete this instance"></span>
			</td>
		);
	}
	
	WorkflowStatus(wf) {
		if(wf.status = 'TERMINATED' && wf.errors > 0)
			return <span className="faicon fa-exclamation error" title="Errors"></span>;
		
		if(wf.status = 'TERMINATED' && wf.errors == 0)
			return <span className="faicon fa-check success" title="Workflow terminated"></span>;
	}
	
	renderTitle() {
		return (
			<div className="boxTitle">
				<div id="nodes-status"></div>
				<span className="title">Terminated workflows</span>
				&#160;
				{ this.current_page>1?(<span className="faicon fa-backward" onClick={this.previousPage}></span>):'' }
				&#160;
				{ (this.current_page-1)*this.items_per_page + 1 } - { this.current_page*this.items_per_page } &#47; {this.state.workflows.rows}
				{ this.current_page*this.items_per_page<this.state.workflows.rows?(<span className="faicon fa-forward" onClick={this.nextPage}></span>):''}
				<span className={"faicon fa-refresh action"+(this.state.refresh?' fa-spin':'')} onClick={this.toggleAutorefresh}></span>
			</div>
		);
	}
	
	updateFilters(search_filters) {
		this.search_filters = search_filters;
		
		this.evqueue.UnsubscribeAll();
		
		search_filters.limit = this.items_per_page;
		search_filters.offset = (this.current_page-1)*this.items_per_page;
		this.evqueue.Subscribe('INSTANCE_TERMINATED','instances','list',search_filters);
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

//if(document.querySelector('#terminated-workflows'))
//	var terminated_instances = ReactDOM.render(<TerminatedInstances />, document.querySelector('#terminated-workflows'));