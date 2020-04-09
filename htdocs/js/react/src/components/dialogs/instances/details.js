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
import {WorkflowLauncher} from '../workflows/launcher.js';
import {TaskDetails} from '../tasks/details.js';
import {Dialogs} from '../../../ui/dialogs.js';
import {Dialog} from '../../../ui/dialog.js';
import {Tabs} from '../../../ui/tabs.js';
import {Tab} from '../../../ui/tab.js';
import {XML} from '../../../ui/xml.js';
import {Autocomplete} from '../../../ui/autocomplete.js';

export class InstanceDetails extends evQueueComponent {
	constructor(props) {
		super(props);
		
		this.details_dlg = [];
		
		this.state.workflowtags = [];
		this.state.tags = [];
		this.state.tags_id = [];
		this.state.tag_label = '';
		
		this.taskDetail = this.taskDetail.bind(this);
		this.relaunch = this.relaunch.bind(this);
		this.debug = this.debug.bind(this);
		this.kill = this.kill.bind(this);
		this.tag = this.tag.bind(this);
		this.untag = this.untag.bind(this);
		this.changeTag = this.changeTag.bind(this);
		
		this.evQueueEventWorkflow = this.evQueueEventWorkflow.bind(this);
		this.evQueueEventWorkflowTags = this.evQueueEventWorkflowTags.bind(this);
		this.evQueueEventTags = this.evQueueEventTags.bind(this);
	}
	
	componentDidMount() {
		var api = { node:this.props.node, group:'instance',action:'query',attributes:{id:this.props.id} };
		this.Subscribe('TASK_QUEUE',api,false,this.props.id,this.evQueueEventWorkflow);
		this.Subscribe('TASK_EXECUTE',api,false,this.props.id,this.evQueueEventWorkflow);
		this.Subscribe('TASK_TERMINATE',api,true,this.props.id,this.evQueueEventWorkflow);
		
		var api = { node:this.props.node, group:'instances',action:'list',attributes:{filter_id:this.props.id} };
		this.Subscribe('INSTANCE_TAGGED',api,false,this.props.id,this.evQueueEventWorkflowTags);
		this.Subscribe('INSTANCE_UNTAGGED',api,true,this.props.id,this.evQueueEventWorkflowTags);
		
		var api = { node:this.props.node, group:'tags',action:'list',attributes:{} };
		this.Subscribe('TAG_CREATED',api,false,0,this.evQueueEventTags);
		this.Subscribe('TAG_MODIFIED',api,false,0,this.evQueueEventTags);
		this.Subscribe('TAG_REMOVED',api,true,0,this.evQueueEventTags);
	}
	
	evQueueEventWorkflow(data) {
		this.setState({workflow: data});
		this.notifyTasksDetail();
	}
	
	evQueueEventWorkflowTags(data) {
		this.setState({workflowtags: this.xpath('/response/workflow/tags/tag',data.documentElement)});
	}
	
	evQueueEventTags(data) {
		var ret_tags = this.xpath('/response/tag',data.documentElement);
		var tags = [];
		var tags_id = [];
		for(var i=0;i<ret_tags.length;i++)
		{
			tags.push(ret_tags[i].label);
			tags_id.push(ret_tags[i].id);
		}
		
		this.setState({tags: tags, tags_id: tags_id});
	}
	
	relaunch() {
		var root = this.state.workflow.documentElement.firstChild;
		var user = root.getAttribute('user');
		var host = root.getAttribute('host');
		var name = root.getAttribute('name');
		
		var parameters = this.xpath('/response/workflow/parameters/parameter',this.state.workflow.documentElement);
		var parameters_obj = {};
		for(var i=0;i<parameters.length;i++)
			parameters_obj[parameters[i].name] = parameters[i].domnode.textContent;
		
		Dialogs.open(WorkflowLauncher,{
			node:this.props.node,
			name: name,
			user: user?user:'',
			host: host?host:'',
			parameters: parameters_obj
		});
	}
	
	debug() {
		this.simpleAPI({
				group: 'instance',
				action: 'debugresume',
				attributes: {id:this.props.id},
				node: this.props.node
			},'Debugging new instance '+this.props.id);
	}
	
	kill(task) {
		var task_name = task.name?task.name:task.path;
		
		this.simpleAPI({
				group: 'instance',
				action: 'killtask',
				attributes: { 'id':this.props.id, 'pid':task.pid },
				node: this.props.node
			},
			"Killed task "+task_name,
			"Are you sure you want to kill this task ?"
		);
	}
	
	changeTag(event) {
		this.setState({tag_label:event.target.value});
	}
	
	tag(tag) {
		this.setState({tag_label: ''});
		
		var idx = this.state.tags.indexOf(tag);
		if(idx==-1) {
			this.API({
				group: 'tag',
				action: 'create',
				attributes: { label: tag },
				node: this.props.node
			}).then( (xml) => {
				var tag_id = xml.documentElement.getAttribute('tag-id');
				return this._tag(tag_id, tag);
			});
		}
		else
			return this._tag(this.state.tags_id[idx], tag);
	}
	
	_tag(tag_id, tag) {
		this.simpleAPI({
			group: 'instance',
			action: 'tag',
			attributes: {id:this.props.id, tag_id:tag_id},
			node: this.props.node
		},'Tagged instance '+this.props.id+" with « "+tag+" »");
	}
	
	untag(tag_id) {
		this.simpleAPI({
			group: 'instance',
			action: 'untag',
			attributes: {id:this.props.id, tag_id:tag_id},
			node: this.props.node
		},'Untagged instance '+this.props.id);
	}
	
	title() {
		return (
			<span>Instance {this.props.id} <span className="faicon fa-rocket" title="Relaunch this instance" onClick={this.relaunch}></span></span>
		);
	}
	
	tabXML() {
		if(!this.state.workflow)
			return;
		
		return (<XML xml={this.state.workflow.documentElement.firstChild}/>);
	}
	
	tabWorkflow() {
		if(!this.state.workflow)
			return;
		
		return (
			<div>
				{this.renderWorkflow()}
			</div>
		);
	}
	
	workflowComment(workflow) {
		var comment = workflow.getAttribute('comment');
		
		if(comment)
			return (<div><i>{comment}</i></div>);
	}
	
	renderWorkflow() {
		var workflow = this.state.workflow.documentElement.firstChild;
		
		return (
			<div>
				{this.workflowComment(workflow)}
				<br />
				<div className="workflow">
					{
						this.xpath('subjobs/job',workflow).map( (node) => {
							return this.renderJob(node);
						})
					}
				</div>
			</div>
		);
	}
	
	jobStatus(job) {
		if(job.status=='SKIPPED')
			return (<div className="jobStatus skipped"><span className="faicon fa-remove" title={job.details+" "+job.condition}></span> job skipped</div>);
		else if(job.status=='ABORTED')
			return (<div class="jobStatus error"><span class="faicon fa-exclamation-circle" title={job.details}></span> job aborted</div>);
		else if(job.details)
			return (<div class="jobStatus"><span class="faicon fa-question-circle-o" title={job.details}></span></div>);
	}
	
	renderJob(job) {
		return (
			<div key={job.evqid} className="job" data-type="job" data-evqid={job.evqid}>
				<div className="tasks">
					{this.jobStatus(job)}
					{
						this.xpath('tasks/task',job.domnode).map( (task) => {
							return this.renderTask(task);
						})
					}
				</div>
				{
					this.xpath('subjobs/job',job.domnode).map( (job) => {
						return this.renderJob(job);
					})
				}
			</div>
		);
	}
	
	taskStatus(task) {
		if(task.status=='ABORTED')
			return (<span className="faicon fa-exclamation-circle error" title={task.status + " - " + task.error}></span>);
		else if(task.status=='QUEUED')
			return (<span className="faicon fa-hand-stop-o" title="QUEUED"></span>);
		else if(task.status=='EXECUTING')
			return (<span className="fa fa-spinner fa-pulse fa-fw"></span>);
		else if(task.status=='TERMINATED' && task.retry_at)
			return (<span className="faicon fa-clock-o" title={"Will retry at : "+task.retry_at}></span>);
		else if(task.status=='TERMINATED' && task.retval!=0)
			return (<span className="faicon fa-exclamation error" title={"Return value: "+task.retval}></span>);
		else if(task.status=='TERMINATED' && task.retval==0 && this.xpath('count(./output[@retval != 0])',task.domnode) > 0)
			return (<span className="faicon fa-check errorThenSuccess"></span>);
		else if(task.status=='TERMINATED' && task.retval==0)
			return (<span className="faicon fa-check success"></span>);
	}
	
	renderTask(task) {
		return (
			<div key={task.evqid}>
				<span className="task" data-evqid={task.evqid} onClick={() => { this.taskDetail(task.evqid) }}>
					<span className="taskState">{this.taskStatus(task)}</span>
					<span className="taskName">{task.type=='SCRIPT'?task.name:task.path}</span>
				</span>
				{task.status=='EXECUTING'?(<span className="faicon fa-bomb" title="Kill this instance" onClick={ () => this.kill(task) }></span>):''}
			</div>
		);
	}
	
	taskFromEvqid(evqid) {
		var task = this.xpath('//task[@evqid='+evqid+']',this.state.workflow.documentElement)[0];
		task.input = this.xpath('input',task.domnode,true);
		task.output = this.xpath('output',task.domnode,true);
		task.stderr = this.xpath('stderr',task.domnode);
		task.log = this.xpath('log',task.domnode);
		return task;
	}
	
	taskDetail(evqid) {
		var ref = Dialogs.open(TaskDetails,{task:this.taskFromEvqid(evqid),node:this.props.node});
		this.details_dlg.push({evqid:evqid,ref:ref});
	}
	
	notifyTasksDetail() {
		return this.details_dlg.map( (detail) => {
			detail.ref.current.setState({task:this.taskFromEvqid(detail.evqid)});
		});
	}
	
	tabParameters() {
		if(!this.state.workflow)
			return;
		
		return (
			<div className="tabbed">
				{this.renderParameters()}
			</div>
		);
	}
	
	tabTags() {
		return (
			<div className="workflowtags">
				<br />
				Tag instance : <Autocomplete name="tag" value={this.state.tag_label} autocomplete={this.state.tags} onChange={this.changeTag} onSubmit={this.tag} onChoose={this.tag} />
				<br /><br />
				<ul className="workflowtags">{this.renderTags()}</ul>
			</div>
		);
	}
	
	renderTags() {
		return this.state.workflowtags.map( (tag) => {
			return (<li key={tag.id}><span className="faicon fa-remove" onClick={() => { this.untag(tag.id); }}></span>&#160;{tag.label}</li>);
		});
	}
	
	tabDebug() {
		return (
			<div>
				Debug mode is used to clone an existing instance and restart it. Successful tasks will not be executed and their output will be kept.
				<br /><br />Loops and conditions that have already been evaluated will not be evaluated again.
				<br /><br />Error tasks will be restarted and their attributes will be reset.
				<br /><br />Modifications on the original workflow will not be taken into account as what is run is a clone of the previous instance.
				<br /><br />This mode is used for debugging tasks and workflows without launching each time your full treatment chain.
				<br /><br /><span className="faicon fa-step-forward" onClick={this.debug}> Relaunch this instance in debug mode</span>
			</div>
		);
	}
	
	renderParameters() {
		var parameters = this.xpath('/response/workflow/parameters/parameter',this.state.workflow.documentElement);
		return parameters.map( (parameter) => {
			return (
				<div key={parameter.name}>
					<div>{parameter.name}</div>
					<div>{parameter.domnode.textContent}</div>
				</div>
			);
		});
	}
	
	render() {
		if(this.state.subscriptions=='ERROR')
			return (<div></div>);
		
		return (
			<Dialog dlgid={this.props.dlgid} title={this.title()} width="400" height="auto">
				<Tabs>
					<Tab title="Tree">
						{ this.tabWorkflow() }
					</Tab>
					<Tab title="XML">
						{ this.tabXML() }
					</Tab>
					<Tab title="Parameters">
						{ this.tabParameters() }
					</Tab>
					<Tab title="Tags">
						{ this.tabTags() }
					</Tab>
					<Tab title="Debug">
						{ this.tabDebug() }
					</Tab>
				</Tabs>
			</Dialog>
		);
	}
}
