'use strict';

class ListInstances extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			refresh: true,
			now: 0,
			workflows: {
				node: 'unknown',
				response: [],
			}
		};
		
		this.timerID = false;
		
		this.toggleAutorefresh = this.toggleAutorefresh.bind(this);
	}
	
	toggleAutorefresh() {
		this.setState({refresh:!this.state.refresh});
		/*if(this.refresh)
			this.forceUpdate();*/
	}
	
	now()
	{
		return Date.now();
		/*if(!this.evqueue)
			return Date.now();
		return Date.now()-this.evqueue.GetTimeDelta();*/
	}
	
	componentDidMount() {
		this.evqueue = new evQueueWS(this,this.evQueueEvent); 
		var evqueue_ready = this.evqueue.Connect();
		
		this.setState({now: this.now()});
		
		return evqueue_ready;
	}
	
	componentWillUnmount() {
		this.evqueue.Close();
	}
	
	evQueueEvent(context,data) {
		if(context.state.refresh)
			context.setState({workflows: data});
		else
			context.state.workflows = data;
	}
	
	humanTime(seconds) {
		if(seconds<0)
			seconds = 0;
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
	
	renderWorkflowsList() {
		return this.state.workflows.response.map((wf) => {
			return (
					<tr key={wf.id}
					    data-id={wf.id}
					    data-node={this.getNode(wf)}
					    data-running_tasks={wf.running_tasks}
					    data-retrying_tasks={wf.retrying_tasks}
					    data-queued_tasks={wf.queued_tasks}
					    data-error_tasks={wf.error_tasks}
					    data-waiting_conditions={wf.waiting_conditions}
					    >
						<td className="center">
							{ this.WorkflowStatus(wf) }
						</td>
						<td>
							<span className="action showWorkflowDetails" data-id={wf.id} data-node-name={this.getNode(wf)} data-status="{wf.status}">
								{wf.id} – {wf.name} { this.workflowInfos(wf) } ({this.workflowDuration(wf)})
							</span>
							&#160;
						</td>
						<td className="center">{this.getNode(wf)}</td>
						<td className="center">{wf.host?wf.host:'localhost'}</td>
						<td className="tdStarted">
							{this.timeSpan(wf.start_time,wf.end_time)}
						</td>
						{ this.renderActions() }
					</tr>
			);
		});
	}
	
	renderWorkflows() {
		if(this.state.workflows.node=='unknown')
			return (<div className="center"><br />Loading...</div>);
		
		if(this.state.workflows.response.length==0)
			return (<div className="center"><br />No workflow.</div>);
		
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
		this.state.now=this.now();
		
		return (
			<div>
				{ this.renderTitle() }
				
				{ this.renderWorkflows() }
			</div>
		);
	}
}