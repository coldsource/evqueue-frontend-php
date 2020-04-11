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

export class Prompt extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			value: ''
		};
		
		this.dlg = React.createRef();
		
		this.confirm = this.confirm.bind(this);
		this.cancel = this.cancel.bind(this);
	}
	
	confirm() {
		this.props.confirm(this.state.value);
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
		var width = this.props.width?this.props.width:300;
		return (
			<Dialog ref={this.dlg} dlgid={this.props.dlgid} width={width} modal={true} hasTitle={false}>
				<div className="evq-prompt" onKeyDown={ (e) => { if(e.keyCode === 13) this.confirm() } }>
					<div className="evq-content">{this.renderContent()}</div>
					<div className="center">
						<input name="value" type="text" placeholder={this.props.placeholder} onChange={ (e) => this.setState({value: e.target.value}) } />
					</div>
					<div className="evq-buttons">
						<button onClick={this.cancel}>Cancel</button>
						<button onClick={this.confirm}>OK</button>
					</div>
				</div>
			</Dialog>
		);
	}
}
