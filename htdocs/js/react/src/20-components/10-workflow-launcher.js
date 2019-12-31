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

class WorkflowLauncher extends evQueueComponent {
	constructor(props) {
		super(props);
		
		this.state.wfid = 0;
		this.state.workflows = [];
		
		this.state.api = {
			group: 'instance',
			action: 'launch',
			attributes: {},
			parameters: {}
		};
		
		if(this.props.node!==undefined)
			this.state.api.node = this.props.node;
		if(this.props.name!==undefined)
			this.state.api.attributes.name = this.props.name;
		if(this.props.user!==undefined)
			this.state.api.attributes.user = this.props.user;
		if(this.props.host!==undefined)
			this.state.api.attributes.host = this.props.host;
		if(this.props.parameters!==undefined)
			this.state.api.parameters = this.props.parameters;
		
		this.dlg = React.createRef();
		
		this.changeWorkflow = this.changeWorkflow.bind(this);
		this.launch = this.launch.bind(this);
	}
	
	componentDidMount() {
		var self = this;
		var wfid = 0;
		this.API({group:'workflows',action:'list'}).then( (data) => {
			var workflows = this.xpath('/response/workflow',data.documentElement);
			
			var groupped_workflows = {};
			for(var i=0;i<workflows.length;i++)
			{
				if(self.props.name && workflows[i].name==self.props.name)
					wfid = workflows[i].id;
				
				var group = workflows[i].group?workflows[i].group:'No group';
				if(groupped_workflows[group] === undefined)
					groupped_workflows[group] = [];
				groupped_workflows[group].push(workflows[i]);
			}
			
			for(var group in groupped_workflows)
				groupped_workflows[group].sort(function(a,b) {return a.name.toLowerCase()<=b.name.toLowerCase()?-1:1});
			
			self.setState({wfid:wfid,workflows:groupped_workflows});
		});
	}
	
	changeWorkflow(event) {
		var id = event.target.value;
		this.API({group:'workflow',action:'get',attributes:{id:id}}).then( (data) => {
			var workflow = this.xpath('/response/workflow',data.documentElement)[0];
			
			var parameters = this.xpath('/response/workflow/workflow/parameters/parameter',data.documentElement);
			
			var api = this.state.api;
			api.attributes.name = data.documentElement.firstChild.getAttribute('name');
			api.parameters = {};
			for(var i=0;i<parameters.length;i++)
				api.parameters[parameters[i].name] = '';
			
			this.setState({wfid:id,api:api});
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
				ret_wfs.push(<option key={wf.name} value={wf.id}>{wf.name}</option>);
			}
			ret_groups.push(<optgroup key={group} label={group}>{ret_wfs}</optgroup>);
		}
		return ret_groups;
	}
	
	renderParameters() {
		var self = this;
		return Object.keys(this.state.api.parameters).map( (parameter) => {
			return (
				<div key={parameter}>
					<label>{parameter}</label>
					<input type="text" name={"parameter_"+parameter} value={self.state.api.parameters[parameter]} onChange={self.prepareAPI} />
				</div>
			);
		});
	}
	
	renderNodes() {
		return this.GetNodes().map( (name) => {
			return (<option key={name} value={name}>{name}</option>);
		});
	}
	
	launch() {
		var self = this;
		this.API(this.state.api).then( (data) => {
			var instance_id = data.documentElement.getAttribute('workflow-instance-id');
			Message("Launched instance "+instance_id);
			self.dlg.current.close();
		});
	}
	
	render() {
		return (
			<Dialog dlgid={this.props.dlgid} ref={this.dlg} title="Launch a new workflow instance" width="600">
				<Tabs updateNotify={this.dlg}>
					<Tab title="Workflow">
						<h2>
							Select workflow
							<Help>
								Select the workflow to launch.
								<br /><br />If the workflow needs parameters, you will be prompted for them.
								<br /><br />If needed, you can add an optional comment that will not be used by the engine.
							</Help>
						</h2>
						<div className="formdiv">
							<form>
								<div>
									<label>Workflow</label>
									<select value={this.state.wfid} name="workflow" onChange={this.changeWorkflow}>
										{this.renderWorkflows()}
									</select>
								</div>
								{this.renderParameters()}
								<div>
									<label>Comment</label>
									<input type="text" name="comment" onChange={this.prepareAPI} />
								</div>
							</form>
						</div>
					</Tab>
					<Tab title="Remote">
						<h2>
							Remote execution
							<Help>The workflow or task can be launched through SSH on a distant machine. Enter the user and host used for SSH connection.</Help>
						</h2>
						<div className="formdiv">
							<form>
								<div>
									<label>User</label>
									<input name="user" onChange={this.prepareAPI} />
								</div>
								<div>
									<label>Host</label>
									<input name="host" onChange={this.prepareAPI} />
								</div>
							</form>
						</div>
					</Tab>
					<Tab title="Node">
						<h2>
							Cluster node
							<Help>If you are using evQueue in a clustered environement, specify here the node on which the workflow will be launched.</Help>
						</h2>
						<div className="formdiv">
							<form>
								<div>
									<label>Node</label>
									<select name="node" value={this.state.api.node} onChange={this.prepareAPI}>
										{this.renderNodes()}
									</select>
								</div>
							</form>
						</div>
					</Tab>
				</Tabs>
				<button className="submit" onClick={this.launch}>Launch new workflow instance</button>
			</Dialog>
		);
	}
}