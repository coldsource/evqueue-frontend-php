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

import {App} from '../../base/app.js';
import {evQueueComponent} from '../../base/evqueue-component.js';
import {Panel} from '../../../ui/panel.js';
import {Tabs} from '../../../ui/tabs.js';
import {Tab} from '../../../ui/tab.js';
import {Dialogs} from '../../../ui/dialogs.js';
import {Prompt} from '../../../ui/prompt.js';

export class WorkflowsList extends evQueueComponent {
	constructor(props) {
		super(props);
		
		this.state.workflows = {};
		this.state.group_workflows = {};
		this.state.groups = [];
		this.state.git_workflows = {};
		this.state.git_only_workflows = [];
		
		this.gitPull = this.gitPull.bind(this);
		this.gitLoad = this.gitLoad.bind(this);
		this.gitSave = this.gitSave.bind(this);
		this.removeWorkflow = this.removeWorkflow.bind(this);
	}
	
	componentDidMount() {
		var api = {node:'*', group:'workflows',action:'list', ref: 'workflow'};
		this.Subscribe('WORKFLOW_CREATED',api);
		this.Subscribe('WORKFLOW_MODIFIED',api);
		this.Subscribe('WORKFLOW_REMOVED',api);
		this.Subscribe('GIT_SAVED',api,true);
		this.Subscribe('GIT_LOADED',api,true);
		
		var api = {node:'*', group:'git',action:'list_workflows', ref: 'git'};
		this.Subscribe('GIT_PULLED',api);
		this.Subscribe('GIT_SAVED',api);
		this.Subscribe('GIT_REMOVED',api,true);
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
		
		if(ref=='git')
		{
			var workflows = this.state.workflows;
			var git_workflows = {};
			for(var i=0;i<data.response.length;i++)
			{
				let workflow = data.response[i];
				git_workflows[workflow.name] = workflow;
			}
			
			this.setState({git_workflows: git_workflows});
		}
		
		var git_only_workflows = [];
		for(const name in git_workflows)
		{
			let workflow = git_workflows[name];
			if(workflows[workflow.name]===undefined)
				git_only_workflows.push(workflow);
		}
		
		this.setState({git_only_workflows: git_only_workflows});
	}
	
	createWorkflow() {
		App.changeURL('/workflow-editor');
	}
	
	gitPull() {
		this.simpleAPI({
			group: 'git',
			action: 'pull'
		}, "Git pulled");
	}
	
	gitLoad(name) {
		this.simpleAPI({
			group: 'git',
			action: 'load_workflow',
			attributes: { name: name }
		}, "Imported workflow « "+name+" » from git");
	}
	
	gitSave(name) {
		Dialogs.open(Prompt,{
			content: "Please enter your commit log",
			placeholder: "Git commit log",
			width: 500,
			confirm: (commit_log) => {
				this.simpleAPI({
					group: 'git',
					action: 'save_workflow',
					attributes: {name: name, commit_log: commit_log }
				},"Workflow saved in git");
			}
		});
	}
	
	gitRemove(name) {
		Dialogs.open(Prompt,{
			content: "Workflow «\xA0"+name+"\xA0» will be removed from git. Please enter your commit log",
			placeholder: "Git commit log",
			width: 500,
			confirm: (commit_log) => {
				this.simpleAPI({
					group: 'git',
					action: 'remove_workflow',
					attributes: {name: name, commit_log: commit_log }
				},"Workflow removed from git");
			}
		});
	}
	
	removeWorkflow(id, name) {
		this.simpleAPI({
			group: 'workflow',
			action: 'delete',
			attributes: { id: id }
		}, "Workflow has been deleted","You are about to delete workflow «\xA0"+name+"\xA0»");
	}
	
	renderGroups() {
		return this.state.groups.map( (group) => {
			return (
				<React.Fragment key={"group_"+group}>
					<tr className="group"><td colSpan="4">{group}</td></tr>
					{ this.renderWorkflows(group) }
					{ this.renderSpacer(group) }
				</React.Fragment>
			);
		});
	}
	
	renderSpacer(group) {
		if(this.state.groups[this.state.groups.length-1]==group)
			return;
		return (<tr className="groupspace"><td colSpan="4"></td></tr>);
	}
	
	renderWorkflows(group) {
		return this.state.group_workflows[group].map( (workflow, idx) => {
			var git_workflow = this.state.git_workflows[workflow.name];
			var is_in_git = false;
			if(git_workflow!==undefined)
			{
				is_in_git = true;
				var same_git_version = (git_workflow.lastcommit==workflow.lastcommit);
				var git_status;
				var git_msg;
				if(same_git_version && workflow.modified==0)
				{
					git_status = 'uptodate';
					git_msg = "Up-to-date with git version";
				}
				else if(same_git_version && workflow.modified==1)
				{
					git_status = 'needpush';
					git_msg = "You have local modifications that can be pushed to git";
				}
				else if(workflow.lastcommit!='' && !same_git_version && workflow.modified==0)
				{
					git_status = 'needpull';
					git_msg = "Git version is more recent, update local version to avoid conflicts";
				}
				else
				{
					git_status = 'conflict';
					git_msg = "Conflict with git version";
				}
			}
			
			return (
				<tr key={"workflow"+workflow.name}>
					<td>
						{workflow.name}
						{ is_in_git?(<span className={"faicon fa-git git_"+git_status} title={git_msg}></span>):''}
					</td>
					<td>{workflow.comment}</td>
					<td>
						{ !is_in_git || git_status=='needpush' || git_status=='conflict' ? (<span className="faicon fa-cloud-upload" title="Commit this workflow to Git" onClick={() => this.gitSave(workflow.name) }></span>): '' }
						{ is_in_git && (git_status=='needpull' || git_status=='conflict') ? (<span className="faicon fa-cloud-upload" title="Load Git version" onClick={() => this.gitLoad(workflow.name) }></span>):''}
					</td>
					<td className="tdActions">
						<span className="faicon fa-edit" title="Edit this instance" onClick={() => { this.editWorkflow(workflow.id); }}></span>
						<span className="faicon fa-remove" title="Delete this instance" onClick={() => { this.removeWorkflow(workflow.id, workflow.name); }}></span>
					</td>
				</tr>
			);
		});
	}
	
	renderGitWorkflows() {
		if(this.state.git_only_workflows.length==0)
			return;
		
		return this.state.git_only_workflows.map( (workflow, idx) => {
			return (
				<tr key={"workflow"+workflow.name}>
					<td>{workflow.name}</td>
					<td>{workflow.comment}</td>
					<td>
						<span className="faicon fa-cloud-download" title="Import from git" onClick={() => { this.gitLoad(workflow.name); }}></span>
					</td>
					<td className="tdActions">
						<span className="faicon fa-remove" title="Delete this instance" onClick={() => { this.gitRemove(workflow.name); }}></span>
					</td>
				</tr>
			);
		});
	}
	
	render() {
		var actions = [
			{icon:'fa-cloud', title: "Pull git repository", callback:this.gitPull},
			{icon:'fa-file-o', title: "Create new workflow", callback:this.createWorkflow}
		];
		
		return (
			<div className="evq-workflows-list">
				<Panel noborder left="" title="Workflows" actions={actions}>
					<table className="border">
						<thead>
							<tr>
								<th>Name</th>
								<th>Comment</th>
								<th>Git</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{ this.renderGroups() }
							<tr className="groupspace"><td colSpan="4"></td></tr>
							<tr className="group"><td colSpan="4">These workflows are in the git repository but are not present locally</td></tr>
							{ this.renderGitWorkflows() }
						</tbody>
					</table>
				</Panel>
			</div>
		);
	}
}
