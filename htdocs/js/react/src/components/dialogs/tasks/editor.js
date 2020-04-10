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

import {Help} from '../../../ui/help.js';
import {Checkbox} from '../../../ui/checkbox.js';
import {Dialogs} from '../../../ui/dialogs.js';
import {Dialog} from '../../../ui/dialog.js';
import {Select} from '../../../ui/select.js';
import {Tabs} from '../../../ui/tabs.js';
import {Tab} from '../../../ui/tab.js';
import {FilesystemAutocomplete} from '../../base/filesystem-autocomplete.js';
import {MagicWand} from '../../base/magic-wand.js';
import {QueueSelector} from '../../base/queue-selector.js';
import {XPathInput} from '../../base/xpath-input.js';
import {RetryScheduleSelector} from '../../base/retry-schedule-selector.js';
import {ReturnCodeSelector} from '../../base/return-code-selector.js';
import {Sortable} from '../../../ui/sortable.js';
import {SortableHandle} from '../../../ui/sortable-handle.js';
import {TaskInput} from './input.js';
import {ScriptEditor} from './script-editor.js';

export class TaskEditor extends React.Component {
	constructor(props) {
		super(props);
		
		this.changeWait = this.changeWait.bind(this);
		this.addInput = this.addInput.bind(this);
		this.changeInputs = this.changeInputs.bind(this);
		this.inputChanged = this.inputChanged.bind(this);
		this.removeInput = this.removeInput.bind(this);
	}
	
	changeWait(e, condition_name, condition_value) {
		if(e.target.value)
			condition_value = "evqWait("+condition_value+")";
		else
		{
			condition_value = condition_value.substr(8);
			condition_value = condition_value.substr(0,condition_value.length-1);
		}
		
		var event = {
			target: {
				name: condition_name,
				value: condition_value
			}
		};
		
		this.props.onChange(event);
	}
	
	triggerInputsChange(value) {
		var event = {
			target: {
				name: 'inputs',
				value: value
			}
		};
		
		this.props.onChange(event);
	}
	
	addInput(e) {
		this.triggerInputsChange(this.props.task.addInput(undefined,true));
	}
	
	removeInput(e, input) {
		this.triggerInputsChange(this.props.task.removeInput(input,true));
	}
	
	changeInputs(e, inputs) {
		this.triggerInputsChange(inputs);
	}
	
	inputChanged(e) {
		this.triggerInputsChange(this.props.task.inputs);
	}
	
	renderTabPath() {
		var task = this.props.task;
		
		return (
			<div>
				<h2>
					Path
					<Help>
						If you want to call an existing binary command, choose 'binary' type and enter its path. The path can contain arguments. If path is relative (not starting with a /), it will be relative the the core.wd configuration directive.
						<br /><br />You can still add dynamic inputs from evQueue. These inputs will be added to the command line arguments or sent as environment variables depending on the task configuration.
						<br /><br />If you choose 'script' type and 'static' script type, you can write here a small script that will be executed.
						<br /><br />If you select 'dynamic' script type, the content of the script will be taken from the output of an earlier task. For both cases, if you plan remote execution, you must enable the evQueue agent in the 'Remote execution' section.
					</Help>
				</h2>
				<div className="formdiv">
					<div>
						<label>Type</label>
						<Select name="type" value={task.type} values={[{name: 'binary', value: 'BINARY'}, {name: 'script', value: 'SCRIPT'}]} filter={false} onChange={this.props.onChange} />
					</div>
					{ task.type=='BINARY'?
					(
						<div>
							<label>Path</label>
							<FilesystemAutocomplete name="path" type="file" value={task.path} onChange={this.props.onChange} />
						</div>
					):
					(
						<div>
							<label>Name</label>
							<input name="name" type="text" value={task.name} onChange={this.props.onChange} />
						</div>
					)
					}
					<div>
						<label>Working directory</label>
						<FilesystemAutocomplete name="wd" type="directory" value={task.wd} onChange={this.props.onChange} />
					</div>
					{ this.renderScriptTask() }
				</div>
			</div>
		);
	}
	
	renderScriptTask() {
		var task = this.props.task;
		
		if(task.type=='BINARY')
			return;
		
		return (
			<React.Fragment>
				<div>
					<label>Script type</label>
					<Select name="script_type" value={task.script_type} values={[{name: 'Static', value: 'static'},{name: 'Dynamic', value: 'dynamic'}]} filter={false} onChange={this.props.onChange} />
				</div>
				{task.script_type=='static'?
					(
						<div>
							<label>Script source</label>
							<span className="faicon fa-code" onClick={ (e) => Dialogs.open(ScriptEditor, {name: 'script_source', script: task.script_source, onChange: this.props.onChange}) } />
						</div>
					):
					(
						<div>
							<label>Script xpath source</label>
							<XPathInput name="script_xpath" value={task.script_xpath} onChange={this.props.onChange} />
							<MagicWand name="script_xpath" task={task} onChange={this.props.onChange} />
						</div>
					)
				}
			</React.Fragment>
		);
	}
	
	renderTabInputs() {
		var task = this.props.task;
		
		return(
			<div>
				<h2>
					Inputs
					<Help>
						The inputs are passed to the task that will be executed.
						<br /><br />Parameters mode defines how parameters will be passed to the task. 'Command line' is the traditional way to send arguments to a binary (like in a shell prompt). 'Environment variables' will set named environment variables in the task's ENV.
						<br /><br />Input values can be static (simple text), or dynamic by fetching output of parent tasks in the workflow.
						<br /><br />Optionally, tasks can have loops or conditions.
					</Help>
				</h2>
				<div className="formdiv">
					<div>
						<label>Parameters mode</label>
						<Select name="parametersmode" value={task.parametersmode} values={[{name: 'Command line', value: 'CMDLINE'}, {name: 'Environement variables', value: 'ENV'}]} filter={false} onChange={this.props.onChange} />
					</div>
				</div>
				<div className="inputs">
					<Sortable component={TaskInput} props={{onChange: this.props.onChange, removeInput: this.removeInput, openDialog: this.props.openDialog}} items={task.inputs} itemName="input" onChange={this.changeInputs}/>
					<span className="faicon fa-plus" title="Add new input to this task" onClick={this.addInput} />
				</div>
				<br />
				<h2>
					Stdin stream
					<Help>
						Task stdin is used to pipe data to the task. It has the same utility as the 'pipe' character in a shell.
						<br /><br />
						Data can be piped to XML or text format. If the text format is chosen, XML markup tags will be stripped to keep only text values.
					</Help>
				</h2>
				<div className="inputs">
					<TaskInput input={task.stdin} editable={false} onChange={this.props.onChange} openDialog={this.props.openDialog} />
				</div>
			</div>
		);
	}
	
	renderTabOutput() {
		var task = this.props.task;
		
		return (
			<div>
				<h2>
					Output method
					<Help>
						How task output should be considered. You will only be able to use loops and conditions on XML type of output.
						<br /><br />
						Merging stderr with stdout is the traditional 2>&1 redirection.
					</Help>
				</h2>
				<div className="formdiv">
					<div>
						<label>Output method</label>
						<Select name="output_method" value={task.output_method} values={[{name: 'Text', value: 'TEXT'},{name: 'XML', value: 'XML'}]} filter={false} onChange={this.props.onChange} />
					</div>
					<div>
						<label>Merge stderr with stdout</label>
						<Checkbox name="merge_stderr" value={task.merge_stderr} onChange={this.props.onChange} />
					</div>
				</div>
			</div>
		);
	}
	
	renderTabConditionsLoop() {
		var task = this.props.task;
		
		var wait_condition = task.condition.substr(0,8)=="evqWait(";
		var wait_iteration_condition = task.iteration_condition.substr(0,8)=="evqWait(";
		
		return (
			<div>
				<h2>
					Conditions and loops
					<Help>
						It is possible to loop on a task output to execute one action several times. Loop context can be used to access the current value of the loop iteration.
						<br /><br />
						Condition is used to skip one task. This condition is evaluated before the loop. Iteration condition is evaluated after the loop, on each task. It can refer to loop context.
					</Help>
 				</h2>
				<div className="formdiv">
					<div>
						<label>Condition</label>
						<XPathInput name="condition" value={task.condition} onChange={this.props.onChange} />
						<MagicWand name="condition" task={task} onChange={this.props.onChange} />
					</div>
					<div>
						<label>Wait for condition to become true</label>
						<Checkbox name="wait_condition" value={wait_condition} onChange={ (e) => this.changeWait(e,'condition',task.condition) } />
					</div>
					<div>
						<label>Loop</label>
						<XPathInput name="loop" value={task.loop} onChange={this.props.onChange} />
						<MagicWand name="loop" task={task} onChange={this.props.onChange} />
					</div>
					<div>
						<label>Iteration condition</label>
						<XPathInput name="iteration_condition" value={task.iteration_condition} onChange={this.props.onChange} />
						<MagicWand name="iteration_condition" task={task} onChange={this.props.onChange} />
					</div>
					<div>
						<label>Wait for condition to become true</label>
						<Checkbox name="wait_iteration_condition" value={wait_iteration_condition} onChange={ (e) => this.changeWait(e,'iteration_condition',task.iteration_condition) } />
					</div>
				</div>
			</div>
		);
	}
	
	renderTabQueueRetry() {
		var task = this.props.task;
		
		return (
			<div>
				<h2>
					Queue and retry
					<Help>
						Queues are used to limit tasks parallelisation depending on the queue concurrency. A conncurrency of 1 will limit execution to one task at a time.
						<br /><br />
						Retry schedules are used to retry failed tasks. The task will not be considered faild as long as retries are still scheduled.
					</Help>
 				</h2>
				<div className="formdiv">
					<div>
						<label>Queue</label>
						<QueueSelector name="queue" value={task.queue} onChange={this.props.onChange} />
					</div>
					<div>
						<label>Retry schedule</label>
						<RetryScheduleSelector name="retry_schedule" value={task.retry_schedule} onChange={this.props.onChange} />
					</div>
					<div>
						<label>Retry on</label>
						<ReturnCodeSelector name="retry_retval" value={task.retry_retval} disabled={task.retry_schedule==''} onChange={this.props.onChange} />
					</div>
				</div>
			</div>
		);
	}
	
	renderTabRemoteExecution() {
		var task = this.props.task;
		
		return (
			<div>
				<h2>
					Remote execution
					<Help>
						If the task should not be executed locally, enter the user and host used for remote SSH connection.
						<br /><br />
						If you are using dynamic a dynamic queue, the used will be used by default to create the dynamic queue name.
						<br /><br />
						It is possible to use dynamic queues with local execution with the queue host attribute. This can be useful for tasks operating on distant machines without SSH (SQL connections, rsync...) on which you want to limit concurrency for performance reasons.
						<br /><br />
						All these values can incorporate dynamic XPath parts surrounded with braces.
						<br /><br />
						evQueue agent can be used to enable advanced functionalities such as dedicated log and real time task progression. If you intend to use the agent, you must first deploy it on all needed machines.
					</Help>
 				</h2>
				<div className="formdiv">
					<div>
						<label>User</label>
						<XPathInput type="attribute" name="user" value={task.user} onChange={this.props.onChange} />
						<MagicWand name="user" task={task} onChange={this.props.onChange} />
					</div>
					<div>
						<label>Host</label>
						<XPathInput type="attribute" name="host" value={task.host} onChange={this.props.onChange} />
						<MagicWand name="host" task={task} onChange={this.props.onChange} />
					</div>
					<div>
						<label>Queue host</label>
						<XPathInput type="attribute" name="queue_host" value={task.queue_host} onChange={this.props.onChange} />
						<MagicWand name="queue_host" task={task} onChange={this.props.onChange} />
					</div>
					<div>
						<label>Use evQueue agent</label>
						<Checkbox name="use_agent" value={task.use_agent} onChange={this.props.onChange} />
					</div>
				</div>
			</div>
		);
	}
	
	render() {
		var task = this.props.task;
		
		return (
			<Dialog title={"Edit task « "+task.getPath()+" »"} width="800" onClose={ this.props.onClose }>
				<div className="evq-task-editor">
					<Tabs>
						<Tab title="Path">
							{ this.renderTabPath() }
						</Tab>
						<Tab title="Inputs">
							{ this.renderTabInputs() }
						</Tab>
						<Tab title="Output">
							{ this.renderTabOutput() }
						</Tab>
						<Tab title="Conditions & loop">
							{ this.renderTabConditionsLoop() }
						</Tab>
						<Tab title="Queue & retry">
							{ this.renderTabQueueRetry() }
						</Tab>
						<Tab title="Remote execution">
							{ this.renderTabRemoteExecution() }
						</Tab>
					</Tabs>
				</div>
			</Dialog>
		);
	}
}
