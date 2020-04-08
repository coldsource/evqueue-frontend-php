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

import {Dialog} from '../../../ui/dialog.js';
import {Help} from '../../../ui/help.js';

export class TaskInputEditor extends React.Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		return (
			<Dialog title="Input properties" width="600" onClose={ this.props.onClose }>
				<h2>
					Input properties
					<Help>
						Input name is used when passing inputs as environement variables.
						<br /><br />Input condition can be used to optionally pass a flag to the task. The flag will be passed to the task if the condition evaluates to true, otherwise the input will be ignored.
						<br /><br />Loops are used to pass a list of inputs based on a preceding task output. This could be a list of files, databases...
					</Help>
				</h2>
				<div className="formdiv">
					<div>
						<label>Name</label>
						<input name="name" value={this.props.input.name} onChange={ (e) => this.props.onChange(e, this.props.input) } />
					</div>
					<div>
						<label>Condition</label>
						<input name="condition" value={this.props.input.condition} onChange={this.props.onChange} />
					</div>
					<div>
						<label>Loop</label>
						<input name="loop" value={this.props.input.loop} onChange={this.props.onChange} />
					</div>
				</div>
			</Dialog>
		);
	}
}
