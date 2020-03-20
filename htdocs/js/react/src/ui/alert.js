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

import {Dialog} from './dialog.js';

export class Alert extends React.Component {
	constructor(props) {
		super(props);
		
		this.dlg = React.createRef();
		
		this.confirm = this.confirm.bind(this);
	}
	
	confirm() {
		this.dlg.current.close(this.props.dlgid);
	}
	
	render() {
		return (
			<Dialog ref={this.dlg} dlgid={this.props.dlgid} width="300" modal={true} hasTitle={false}>
				<div className="evq-alert">
					<div className="evq-content">{this.props.content}</div>
					<div className="evq-buttons">
						<button onClick={this.confirm}>OK</button>
					</div>
				</div>
			</Dialog>
		);
	}
}
