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

import {PageHome} from '../../pages/home.js';
import {PageSystemState} from '../../pages/system-state.js';
import {PageWorkflows} from '../../pages/workflows.js';
import {PageEngineLogs} from '../../pages/enginelogs.js';
import {PageWorkflowEditor} from '../../pages/workflow-editor.js';
import {Page404} from '../../pages/404.js';
import {PageAuth} from '../../pages/auth.js';

export class App extends React.Component {
	constructor(props) {
		super(props);
		
		App.global = {instance: this};
		
		this.state = {
			path: this.getPath(),
			ready: false,
			messages: [],
		};
		
		document.querySelector('#pre-content').style.display='none';
		
		var self = this;
		window.onpopstate = (e) => {
			self.changeURL(document.location.pathname);
			return true;
		};
		
		document.addEventListener('click', (e) => {
			var el = e.target;
			while(el)
			{
				if(el.tagName=='A' && el.hasAttribute('href'))
				{
					e.preventDefault();
			
					this.changeURL(el.getAttribute('href'));
					return false;
				}
				
				el = el.parentNode;
			}
			
			return true;
		}, false);
		
		this.loadClusterConfig();
		
		App.notice = this.notice.bind(this);
		App.warning = this.warning.bind(this);
		App.changeURL = this.changeURL.bind(this);
	}
	
	loadClusterConfig() {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', 'conf/cluster.json');
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.onload = () => {
			App.global.cluster_config = JSON.parse(xhr.responseText);
			this.setState({ready: true});
			document.querySelector('#content').style.display='block';
		}
		xhr.send();
	}
	
	changeURL(path)
	{
		window.history.pushState('','',path);
		this.setState({path: path});
	}
	
	getPath() {
		var url = new URL(document.location);
		return url.pathname;
	}
	
	notice(msg)	{
		return this.message('notice', msg);
	}
	
	warning(msg)	{
		return this.message('warning', msg);
	}
	
	message(severity, msg) {
		var messages = this.state.messages;
		messages.push({
			severity: severity,
			content: msg
		});
		
		this.setState({messages: messages});
		
		var timeout = 3000;
		if(severity=='warning')
			timeout = 7000;
		var self = this;
		setTimeout( () => {
			var messages = this.state.messages;
			messages.splice(0,1);
			this.setState({messages: messages});
		}, timeout);
	}
	
	route() {
		var path = this.state.path;
		
		if(this.state.path!='/auth' && (window.localStorage.authenticated===undefined || window.localStorage.authenticated!='true'))
		{
			window.history.pushState('','','/auth');
			path = '/auth';
		}
		
		if(path=='/')
			return (<PageHome />);
		else if(path=='/auth')
			return (<PageAuth />);
		else if(path=='/system-state')
			return (<PageSystemState />);
		else if(path=='/workflows')
			return (<PageWorkflows />);
		else if(path=='/logs-engine')
			return (<PageEngineLogs />);
		else if(path=='/workflow-editor')
			return (<PageWorkflowEditor />);
		
		return (<Page404 />);
	}
	
	renderMessages() {
		if(this.state.messages.length==0)
			return;
		
		return this.state.messages.map( (msg, idx) => {
			if(msg.severity=='notice')
				return (<div key={idx}><span className="notice">{msg.content}</span></div>);
			if(msg.severity=='warning')
				return (<div key={idx}><span className="warning">{msg.content}</span></div>);
		});
	}
	
	render() {
		if(!this.state.ready)
			return (<div></div>);
		
		return (
			<div>
				{ this.route() }
				<div className="evq-messages">
					{ this.renderMessages() }
				</div>
			</div>
		);
	}
}

ReactDOM.render(<App />, document.querySelector('#content'));
