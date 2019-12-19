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

class evQueueComponent extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = {
			refresh: true,
		};
		
		this.toggleAutorefresh = this.toggleAutorefresh.bind(this);
		
		this.node = 0;
	}
	
	toggleAutorefresh() {
		this.setState({refresh:!this.state.refresh});
	}
	
	componentDidMount() {
		this.evqueue = new evQueueWS(this,this.evQueueEvent); 
		
		if(this.node=='*' || this.node=='any')
			return this.evqueue.Connect('*');
		else
			return this.evqueue.Connect(this.node);
	}
	
	componentWillUnmount() {
		this.evqueue.Close();
	}
}