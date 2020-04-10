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

export class ScriptEditor extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			script: this.props.script
		};
		
		this.onClose = this.onClose.bind(this);
	}
	
	onClose() {
		var event = {
			target: {
				name: this.props.name,
				value: this.state.script
			}
		};
		
		this.props.onChange(event);
	}
	
	render() {
		return (
			<Dialog title="Script editor" width="600" onClose={this.onClose}>
				<div className="evq-script-editor">
					<h2>
						Script editor
						<Help>
							Write here your script. Remember to have a shebang (#!) on the first line !
						</Help>
					</h2>
					<textarea name="script" value={this.state.script} onChange={ (e) => this.setState({script: e.target.value}) } />
				</div>
			</Dialog>
		);
	}
}
