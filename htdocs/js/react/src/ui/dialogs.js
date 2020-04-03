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

export class Dialogs extends React.Component {
	constructor(props) {
		super(props);
		
		this.dlgid = 1;
		
		this.state = {
		};
		
		// Instanciate global state for all dialogs
		Dialogs.global = {
			max_z:100,
			active:undefined
		};
	}
	
	componentDidMount() {
		Dialogs.instance = this;
	}
	
	static open(dlg,props)
	{
		return Dialogs.instance._open(dlg,props);
	}
	
	_open(dlg,props) {
		props.ref=React.createRef();
		this.setState({[this.dlgid]:{dlg:dlg,props:props}});
		return props.ref;
	}
	
	static close(id)
	{
		return Dialogs.instance._close(id);
	}
	
	_close(id) {
		var state = this.state;
		delete state[id];
		this.setState(state);
	}
	
	renderDialogs() {
		return Object.keys(this.state).map( (key) => {
			var dlg = this.state[key];
			var props = dlg.props;
			props.key = key;
			props.dlgid = key;
			return React.createElement(dlg.dlg,props);
		});
	}
	
	render() {
		return (
			<div>
				{this.renderDialogs()}
			</div>
		);
	}
}

if(!document.querySelector('#evq-dialogs'))
{
	var dialogs = document.createElement("div");
	dialogs.setAttribute("id","evq-dialogs");
	document.querySelector('body').appendChild(dialogs);
	ReactDOM.render(<Dialogs />, dialogs);
}
