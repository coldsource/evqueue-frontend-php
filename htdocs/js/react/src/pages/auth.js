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

import {CryptoJS} from '../evqueue/cryptojs/core.js';
import {App} from '../components/base/app.js';
import {evQueueCluster} from '../evqueue/evqueue-cluster.js';
import {HeaderMenu} from '../components/menus/header.js';

export class PageAuth extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			user: '',
			password: '',
			error: false,
		};
		
		this.connect = this.connect.bind(this);
	}
	
	renderError() {
		if(!this.state.error)
			return;
		
		return (<div className="error">{this.state.error}</div>);
	}
	
	connect() {
		window.localStorage.user = this.state.user;
		window.localStorage.password  = CryptoJS.SHA1(this.state.password).toString(CryptoJS.enc.Hex);
		var evq = new evQueueCluster(App.global.cluster_config);
		evq.API({group: 'ping'}).then(
			(data) => {
				evq.Close();
				
				window.localStorage.authenticated = 'true';
				App.changeURL('/');
			},
			(reason) => this.setState({error: reason})
		);
	}
	
	render() {
		return (
			<div id="login" onKeyDown={ (e) => { if(e.keyCode === 13) this.connect(e) } }>
				<fieldset>
					<div className="logo">
						<img src="images/evQueue.svg" />
					</div>
					<div className="form">
						{ this.renderError() }
						<input autoFocus type="text" placeholder="User" onChange={ (e) => this.setState({user: e.target.value}) }/><br/><br/>
						<input type="password" placeholder="Password" onChange={ (e) => this.setState({password: e.target.value}) } /><br/><br/>
						<button onClick={this.connect}>Log In</button>
					</div>
				</fieldset>
			</div>
		);
	}
}
