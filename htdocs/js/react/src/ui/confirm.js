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

export class Confirm extends React.Component {
	constructor(props) {
		super(props);
		
		this.dlg = React.createRef();
		
		this.confirm = this.confirm.bind(this);
		this.cancel = this.cancel.bind(this);
	}
	
	confirm() {
		this.props.confirm();
		this.dlg.current.close(this.props.dlgid);
	}
	
	cancel() {
		this.dlg.current.close(this.props.dlgid);
	}
	
	renderContent() {
		return this.props.content.split("\n").map( (line,idx) => {
			return (<div key={idx}>{line}</div>);
		});
	}
	
	render() {
		return (
			<Dialog ref={this.dlg} dlgid={this.props.dlgid} width="300" modal={true} hasTitle={false}>
				<div className="evq-confirm">
					<div className="evq-content">{this.renderContent()}</div>
					<div className="evq-buttons">
						<button onClick={this.cancel}>Cancel</button>
						<button onClick={this.confirm}>OK</button>
					</div>
				</div>
			</Dialog>
		);
	}
}
