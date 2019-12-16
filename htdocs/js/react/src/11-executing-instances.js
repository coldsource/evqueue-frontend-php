'use strict';

class ExecutingInstances extends ListInstances {
	constructor(props) {
		super(props);
		
		this.subscriptions = [
			{
				api: "<status action='query' type='workflows' />",
				event:"INSTANCE_STARTED"
			},
			{
				api: "<status action='query' type='workflows' />",
				event:"INSTANCE_TERMINATED"
			}
		];
	}
	
	getNode(wf)
	{
		return this.state.workflows.node;
	}
	
	workflowDuration(wf) {
		return this.humanTime((this.state.now-Date.parse(wf.start_time))/1000);
	}
	
	renderActions() {
		return (
			<td className="tdActions">
				<span className="faicon fa-ban" title="Cancel this instance"></span>
				<span className="faicon fa-bomb" title="Kill this instance"></span>
			</td>
		);
	}
	
	WorkflowStatus(wf) {
		if(wf.running_tasks - wf.queued_tasks > 0)
			return <span className="fa fa-spinner fa-pulse fa-fw" title="Task(s) running"></span>;
		
		if(wf.queued_tasks > 0)
			return <span className="faicon fa-hand-stop-o" title="Task(s) queued"></span>;
		
		if(wf.retrying_tasks > 0)
			return <span className="faicon fa-clock-o" title="A task ended badly and will retry"></span>;
	}
	
	renderTitle() {
		return (
			<div className="boxTitle">
				<div id="nodes-status"></div>
				<span className="title">Executing workflows</span>&#160;({this.state.workflows.response.length})
				<span className="faicon fa-refresh action evq-autorefresh-toggle"></span>
				<span className="faicon fa-rocket action" title="Launch a new workflow"></span>
				<span className="faicon fa-clock-o action" title="Retry all pending tasks"></span>
			</div>
		);
	}
}

ReactDOM.render(<ExecutingInstances />, document.querySelector('#executing-workflows'));