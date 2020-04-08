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
import {XPathHelper} from '../../base/xpath-helper.js';
import {Dialog} from '../../../ui/dialog.js';
import {Tabs} from '../../../ui/tabs.js';
import {Tab} from '../../../ui/tab.js';
import {Select} from '../../../ui/select.js';

export class ValueSelector extends evQueueComponent {
	constructor(props) {
		super(props);
		
		this.state.xpath_error = '';
		
		this.changeMode = this.changeMode.bind(this);
	}
	
	triggerPartChange(type, value) {
		var event = {
			target: {
				name: ['type', 'value'],
				value: [type, value]
			}
		};
		
		if(type!='text')
		{
			this.API({
				group: 'xpath',
				action: 'parse',
				attributes: { expression: value }
			}).then( (response) => {
				if(response.documentElement.hasAttribute('parse-error'))
					this.setState({xpath_error: response.documentElement.getAttribute('parse-error')});
				else
					this.setState({xpath_error: ''});
			});
		}
		
		this.props.onChange(event);
	}
	
	changeMode(e) {
		this.triggerPartChange(e.target.value, this.props.part.value);
	}
	
	renderXPathError() {
		if(!this.state.xpath_error)
			return;
		
		return(
			<div className="light-error">{this.state.xpath_error}</div>
		);
	}
	
	render() {
		var part = this.props.part;
		var input = this.props.workflow.getInput(part.getInputId());
		var task = this.props.workflow.getTask(input.getTaskId());
		
		var type = part.type!=''?part.type:'value';
		
		var path = this.props.workflow.getTaskPath(task._id);
		
		var active_tab;
		if(part.type=='text')
			active_tab = 0;
		else
			active_tab = (part.value=='' || XPathHelper.isValid(path, part.value))?1:2;
		
		return (
			<Dialog dlgid={this.props.dlgid} ref={this.dlg} title="Value selector helper" width="650" onClose={this.props.onClose}>
				<div className="evq-value-selector">
					<Tabs active={active_tab}>
						<Tab title="Simple text">
							<div>In simple text mode, the entered value is passed as-is to the task. Type below the value of your parameter.</div>
							<input type="text" name="simple_value" value={part.value} onChange={ (e) => this.triggerPartChange('text', e.target.value) } />
						</Tab>
						<Tab title="XPath">
							<div>
								{ type=='value'?
									"In XPath-value mode, the value is extracted from the output (or input) of a preceding task or from a workflow parameter. This allows dynamic values to be sent to tasks as parameters."
									:
									"In XPath-copy mode, the xml subtree is extracted from the output (or input) of a preceding task or from a workflow parameter. The resulting value is an XML subtree."
								}
							</div>
							<div>
								<br />
								XPath mode&#160;:&#160;
								<Select values={[{name: 'value', value: 'value'},{name: 'copy', value: 'copy'}]} value={type} filter={false} onChange={this.changeMode} />
							</div>
							<XPathHelper path={path} name="xpath_value" value={part.value} onChange={ (e) => this.triggerPartChange(type, e.target.value) } />
						</Tab>
						<Tab title="Advanced">
							<div>Enter here your XPath expression.</div>
							<div>
								<br />XPath mode&#160;:&#160;
								<Select values={[{name: 'value', value: 'value'},{name: 'copy', value: 'copy'}]} value={type} filter={false} onChange={this.changeMode} />
							</div>
							<input type="text" name="advanced" value={this.props.part.value} onChange={ (e) => this.triggerPartChange(this.props.part.type, e.target.value) } />
							{ this.renderXPathError() }
						</Tab>
					</Tabs>
				</div>
			</Dialog>
		);
	}
}