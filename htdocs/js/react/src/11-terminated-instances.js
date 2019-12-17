'use strict';

class TerminatedInstances extends ListInstances {
	constructor(props) {
		super(props);
		
		this.current_page = 1;
		this.items_per_page = 30;
	}
	
	componentDidMount() {
		var self = this;
		super.componentDidMount().then( () => {
			self.evqueue.Subscribe('INSTANCE_TERMINATED','instances','list');
		});
	}
	
	getNode(wf)
	{
		return wf.node_name;
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
				{ this.current_page>1?(<span className="faicon fa-backward"></span>):'' }
				&#160;
				{ (this.current_page-1)*this.items_per_page + 1 } - { this.current_page*this.items_per_page } &#47; {this.state.workflows.rows}
				{ this.current_page*this.items_per_page<this.state.workflows.rows?(<span className="faicon fa-forward"></span>):''}
				<span className="faicon fa-refresh action evq-autorefresh-toggle"></span>
			</div>
		);
	}
	
	updateFilters(search_filters,current_page) {
		this.current_page = current_page;
		
		this.evqueue.UnsubscribeAll();
		
		search_filters.limit = this.items_per_page;
		search_filters.offset = (current_page-1)*this.items_per_page;
		this.evqueue.Subscribe('INSTANCE_TERMINATED','instances','list',search_filters);
	}
}

var terminated_instances = ReactDOM.render(<TerminatedInstances />, document.querySelector('#terminated-workflows'));