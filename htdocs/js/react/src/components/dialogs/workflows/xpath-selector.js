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
import {XPathHelper} from '../../base/xpath-helper.js';
import {Dialog} from '../../../ui/dialog.js';
import {Select} from '../../../ui/select.js';

export class XPathSelector extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			value: ''
		};
		
		this.dlg = React.createRef();
	}
	
	render() {
		if(this.props.task)
			var path = this.props.task.getWorkflow().getTaskPath(this.props.task._id);
		else if(this.props.job)
			var path = this.props.job.getWorkflow().getJobPath(this.props.job._id);
		
		return (
			<Dialog dlgid={this.props.dlgid} ref={this.dlg} title="Value selector helper" width="650" onClose={this.props.onClose}>
				<div className="evq-xpath-selector">
					<div>This helper allows you to write XPath expression to match a specific node in the workflow document.</div>
					<XPathHelper path={path} name="xpath" value={this.state.value} onChange={ (e) => this.setState({value: e.target.value}) } />
					<br />
					<button className="submit" onClick={ (e) => { this.props.onSubmit(this.state.value); this.dlg.current.close(); } }>Select this node</button>
				</div>
			</Dialog>
		);
	}
}
