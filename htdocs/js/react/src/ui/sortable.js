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

export const SortableContext = React.createContext({});

export class Sortable extends React.Component {
	constructor(props) {
		super(props);
		
		this.start_idx = false;
		
		this.onDragStart = this.onDragStart.bind(this);
		this.onDragOver = this.onDragOver.bind(this);
	}
	
	onDragStart(e, idx) {
		this.start_idx = idx;
	}
	
	onDragOver(e, idx) {
		if(idx==this.start_idx)
			return;
		
		var rect = e.currentTarget.getBoundingClientRect();
		
		if(e.clientY>rect.top+rect.height/2)
			idx++;
		
		if(idx==this.start_idx)
			return;
		
		if(this.start_idx<idx)
			idx--;
		
		var items = this.props.items.concat(); // Clone array
		var orig = items[this.start_idx];
		items.splice(this.start_idx, 1);
		items.splice(idx, 0, orig);
		
		this.start_idx = idx;
		
		this.props.onChange(e, items);
	}
	
	onDragEnd(e, root) {
		root.current.setAttribute('draggable', "false");
	}
	
	onMouseDown(e, root) {
		root.current.setAttribute('draggable', "true");
	}
	
	renderItems() {
		return this.props.items.map( (item, idx) => {
			var ref = React.createRef();
			
			var child_props = this.props.props;
			if(this.props.itemName)
				child_props[this.props.itemName] = item;
			else
				child_props['data'] = item;
			
			return (
				<SortableContext.Provider key={idx} value={{root: ref, onMouseDown: this.onMouseDown, onDragStart: this.onDragStart}}>
					<div
						ref={ref}
						onDragStart={ (e) => this.onDragStart(e, idx) }
						onDragOver={ (e) => this.onDragOver(e, idx) }
						onDragEnd={ (e) => this.onDragEnd(e, ref) }
					>
						{ React.createElement(this.props.component, child_props) }
					</div>
				</SortableContext.Provider>
			)
		});
	}
	
	render() {
		return (
			<div>
				{ this.renderItems() }
			</div>
		);
	}
}
