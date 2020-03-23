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
import {Page404} from '../../pages/404.js';
import {PageAuth} from '../../pages/auth.js';

export class App extends React.Component {
	constructor(props) {
		super(props);
		
		App.global = {instance: this};
		
		this.state = {
			path: this.getPath(),
			ready: false,
		};
		
		document.querySelector('#pre-content').style.display='none';
		
		window.onpopstate = (e) => {
			console.log("popstate");
			return false;
		};
		
		document.addEventListener('click', (e) => {
			var el = e.target;
			while(el)
			{
				if(el.tagName=='A')
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
	
	route() {
		var path = this.state.path;
		
		if(this.state.path!='/auth' && (window.localStorage.authenticated===undefined || window.localStorage.authenticated!='true'))
		{
			window.history.pushState('','','/auth');
			path = '/auth';
		}
		
		if(path=='/')
			return (<PageHome />);
		if(path=='/auth')
			return (<PageAuth />);
		if(path=='/system-state')
			return (<PageSystemState />);
		
		return (<Page404 />);
	}
	
	render() {
		if(!this.state.ready)
			return (<div></div>);
		
		return (
			<div>
				{ this.route() }
			</div>
		);
	}
}

ReactDOM.render(<App />, document.querySelector('#content'));
