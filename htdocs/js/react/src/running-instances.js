'use strict';

class RunningInstances extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			now: Date.now(),
			workflows: {
				node: 'unknown',
				response: [],
			}
		};
		
		this.timerID = false;
	}
	
	componentDidMount() {
		this.evqueue = new evQueueWS(this,this.evQueueEvent); 
		
		this.timerID = setInterval(() => this.setState({now: Date.now()}),1000);
	}
	
	componentWillUnmount() {
		clearInterval(this.timerID);
	}
	
	evQueueEvent(context,data) {
		context.setState({workflows: data});
	}
	
	humanTime(seconds) {
		seconds = Math.floor(seconds);
		return (seconds/86400 >= 1 ? Math.floor(seconds/86400)+' days, ' : '') +
                (seconds/3600 >= 1 ? (Math.floor(seconds/3600)%24)+'h ' : '') +
                (seconds/60 >= 1 ? (Math.floor(seconds/60)%60)+'m ' : '') +
                (seconds%60)+'s';
	}
	
	timeSpan (dt1, dt2='') {
		var duration = (Date.parse(dt2) - Date.parse(dt1))/1000;

		if (dt1.split(' ')[0] == dt2.split[0])
			dt2.replace(/^\d{4}-\d{2}-\d{2}/,''); // don't display same date twice

		var dts = [dt1,dt2];
		var today = new Date().toISOString().substr(0,10);
		var yesterday = new Date(Date.now() - 86400000).toISOString().substr(0,10);
		var tomorrow = new Date(Date.now() + 86400000).toISOString().substr(0,10);
		for(var i=0;i<2;i++) {
			dts[i] = dts[i].replace(new RegExp('^'+today),'');  // don't display today's date
			dts[i] = dts[i].replace(new RegExp('^'+yesterday),'yesterday');  // 'yesterday' instead of date
			dts[i] = dts[i].replace(new RegExp('^'+tomorrow),'tomorrow');  // 'tomorrow' instead of date
			dts[i] = dts[i].replace(/:\d+$/,'');  // don't display seconds
		}

		if(duration < 60)
			dts[1] = false;

		return dts[1] ? dts[0] + '→' + dts[1] : dts[0];
	}
	
	WorkflowStatus(wf) {
		if(wf.running_tasks - wf.queued_tasks > 0)
			return <span className="fa fa-spinner fa-pulse fa-fw" title="Task(s) running"></span>;
		
		if(wf.queued_tasks > 0)
			return <span className="faicon fa-hand-stop-o" title="Task(s) queued"></span>;
		
		if(wf.retrying_tasks > 0)
			return <span className="faicon fa-clock-o" title="A task ended badly and will retry"></span>;
		
		if(wf.status = 'TERMINATED' && wf.errors > 0)
			return <span class="faicon fa-exclamation error" title="Errors"></span>;
		
		if(wf.status = 'TERMINATED' && wf.errors == 0)
			return <span class="faicon fa-check success" title="Workflow terminated"></span>;
	}
	
	renderWorkflowsList() {
		var node = this.state.workflows.node;
		return this.state.workflows.response.map((wf) => {
			return (
					<tr key={wf.id} data-id={wf.id} data-node={node}>
						<td className="center">
							{ this.WorkflowStatus(wf) }
						</td>
						<td>
							<span className="action showWorkflowDetails" data-id="{@wf.id}" data-node-name="{node}" data-status="{wf.status}">
								{wf.id} – {wf.name} <span className="faicon fa-info"></span> ({this.humanTime((this.state.now-Date.parse(wf.start_time))/1000)})
							</span>
							&#160;
						</td>
						<td className="center">{node}</td>
						<td className="center">{wf.host?wf.host:'localhost'}</td>
						<td className="tdStarted">
							{this.timeSpan(wf.start_time)}
						</td>
						<td className="tdActions">
							<span className="faicon fa-ban" title="Cancel this instance"></span>
							<span className="faicon fa-bomb" title="Kill this instance"></span>
						</td>
					</tr>
			);
		});
	}
	
	renderWorkflows() {
		if(this.state.workflows.response.length==0)
			return (<div className="center"><br />No EXECUTING workflow.</div>);
		
		return (
			<div className="workflow-list">
				<table>
					<thead>
						<tr>
							<th style={{width:'80px'}} className="center">State</th>
							<th>ID &#8211; Name</th>
							<th>Node</th>
							<th className="thStarted">Host</th>
							<th className="thStarted">Time</th>
							<th className="thActions">Actions</th>
						</tr>
					</thead>
					<tbody>{ this.renderWorkflowsList() }</tbody>
				</table>
			</div>
		);
	}

	render() {
		this.state.now=Date.now();
		
		return (
			<div>
				<div className="boxTitle">
					<div id="nodes-status"></div>
					<span className="title">Executing workflows</span>&#160;({this.state.workflows.response.length})
					<span className="faicon fa-refresh action evq-autorefresh-toggle"></span>
					<span className="faicon fa-rocket action" title="Launch a new workflow"></span>
					<span className="faicon fa-clock-o action" title="Retry all pending tasks"></span>
				</div>
				
				{ this.renderWorkflows() }
				
			</div>
		);
	}
}

let domContainer = document.querySelector('#executing-workflows');
ReactDOM.render(<RunningInstances />, domContainer);