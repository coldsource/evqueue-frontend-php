'use strict';

class TerminatedInstances extends ListInstances {
	constructor(props) {
		super(props);
		
		this.subscriptions = [
			{
				api: "<instances action='list' />",
				event:"INSTANCE_TERMINATED"
			}
		];
	}
	
	getNode(wf)
	{
		return wf.node_name;
	}
	
	workflowDuration(wf) {
		return this.humanTime((Date.parse(wf.end_time)-Date.parse(wf.start_time))/1000);
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
				<span className="title">Terminated workflows</span>&#160;({this.state.workflows.response.length})
				<span className="faicon fa-refresh action evq-autorefresh-toggle"></span>
			</div>
		);
	}
}

ReactDOM.render(<TerminatedInstances />, document.querySelector('#terminated-workflows'));