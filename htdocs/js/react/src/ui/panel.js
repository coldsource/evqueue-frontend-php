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

export class Panel extends React.Component {
	constructor(props) {
		super(props);
	}
	
	renderActions() {
		if(!this.props.actions)
			return;
		
		var ret = [];
		for(var idx=this.props.actions.length-1;idx>=0;idx--)
		{
			var action = this.props.actions[idx];
			ret.push(<span key={idx} className={'action faicon '+ action.icon} onClick={action.callback}></span>);
		}
		return ret;
	}
	
	render() {
		return (
			<div className="evq-pannel">
				<div className="evq-pannel-title">
					{this.props.left?this.props.left:''}
					<span className="evq-pannel-title">{this.props.title}</span>
					{this.renderActions()}
				</div>
				<div className="evq-pannel-content">
					{this.props.children}
				</div>
			</div>
		);
	}
}
