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

import {Dialogs} from './dialogs.js';

export const DialogContext = React.createContext({});

export class Dialog extends React.Component {
	constructor(props) {
		super(props);
		
		// Activate this dialog
		if(Dialogs.global.active!==undefined)
			Dialogs.global.active.setState({active:false});
		
		// Add this instance to global state
		this.dlgid = Dialogs.instance.dlgid++;
		var zindex = this.props.modal?1001:Dialogs.global.max_z++;
		Dialogs.global.active = this;
		
		if(Dialogs.instance.state[this.dlgid]!==undefined)
			Dialogs.instance.state[this.dlgid].instance = this;
		
		
		// Local state
		var top = window.pageYOffset+200;
		var left = 500;
		var width = props.width?parseInt(props.width):200;
		var height = (props.height && props.height!='auto')?parseInt(props.height):200;
		
		if(this.props.modal)
		{
			left = (window.innerWidth-width)/2;
			top = window.pageYOffset+(window.innerHeight-height)/2;
		}
		
		this.state = {
			top:top,
			left:left,
			width:width,
			height:height,
			zindex:zindex,
			moving:false,
			resizing:false,
			active:true
		};
		
		this.closed = false;
		
		// Global styles
		this.height_delta = 0;
		this.resize_border = 7;
		this.auto_height = !props.height || props.height=='auto'?true:false;
		
		// Referenes
		this.dlg_outer = React.createRef();
		this.dlg_inner = React.createRef();
		this.dlg_title = React.createRef();
		this.dlg_content = React.createRef();
		
		// Bind local methods
		this.beginMove = this.beginMove.bind(this);
		this.endMove = this.endMove.bind(this);
		this.move = this.move.bind(this);
		this.beginResize = this.beginResize.bind(this);
		this.endResize = this.endResize.bind(this);
		this.resize = this.resize.bind(this);
		this.close = this.close.bind(this);
		this.activate = this.activate.bind(this);
		
		this.componentDidUpdate = this.componentDidUpdate.bind(this);
	}
	
	componentDidMount() {
		this.node = ReactDOM.findDOMNode(this);
		
		this.height_delta += parseInt(window.getComputedStyle(this.dlg_outer.current).getPropertyValue('padding-top'));
		this.height_delta += parseInt(window.getComputedStyle(this.dlg_outer.current).getPropertyValue('padding-bottom'));
		this.height_delta += parseInt(window.getComputedStyle(this.dlg_inner.current).getPropertyValue('padding-top'));
		this.height_delta += parseInt(window.getComputedStyle(this.dlg_inner.current).getPropertyValue('padding-bottom'));
		if(this.props.hasTitle)
		{
			this.height_delta += parseInt(window.getComputedStyle(this.dlg_title.current).getPropertyValue('padding-top'));
			this.height_delta += parseInt(window.getComputedStyle(this.dlg_title.current).getPropertyValue('padding-bottom'));
			this.height_delta += parseInt(window.getComputedStyle(this.dlg_title.current).getPropertyValue('height'));
		}
		
		if(this.auto_height)
			this.componentDidUpdate();
	}
	
	componentWillUnmount() {
		if(!this.closed)
			this.close();
	}
	
	componentDidUpdate() {
		if(this.state.resizing || this.state.moving || !this.auto_height)
			return;
		
		var old_height = this.state.height;
		var new_height = this.node.querySelector(".evq-dlg-content").clientHeight+this.height_delta;
		if(old_height!=new_height)
			this.setState({height: new_height});
	}
	
	beginMove(event) {
		event.preventDefault();
		
		if(!this.state.active)
			this.activate();
		
		document.addEventListener('mousemove',this.move);
		this.setState({moving:true});
		
		this.cursor_start_pos = {
				x:event.clientX,
				y:event.clientY,
		};
		
		this.dlg_start_pos = {
			x:this.state.left,
			y:this.state.top
		};
	}
	
	endMove() {
		event.preventDefault();
		
		document.removeEventListener('mousemove',this.move);
		this.setState({moving:false});
		delete this.cursor_start_pos;
		delete this.dls_start_pos;
	}
	
	move(event) {
		event.preventDefault();
		
		if(event.target==document)
		{
			this.endMove();
			return;
		}
		
		this.setState({
			top:this.dlg_start_pos.y+event.clientY-this.cursor_start_pos.y,
			left:this.dlg_start_pos.x+event.clientX-this.cursor_start_pos.x,
		});
	}
	
	beginResize(event) {
		event.preventDefault();
		
		this.resize_type = event.target.dataset.pos;
		
		this.cursor_start_pos = {
				x:event.clientX,
				y:event.clientY,
		};
		
		this.dlg_start_pos = {
			x:this.state.left,
			y:this.state.top
		};
		
		this.dlg_start_size = {
			width:this.state.width,
			height:this.state.height
		};
		
		document.addEventListener('mousemove',this.resize);
		this.setState({resizing:true});
	}
	
	endResize() {
		delete this.resize_type;
		delete this.cursor_start_pos;
		delete this.dlg_start_pos;
		delete this.dlg_start_size ;
		
		document.removeEventListener('mousemove',this.resize);
		this.setState({resizing:false});
		this.auto_height = false;
	}
	
	resize(event) {
		event.preventDefault();
		
		if(event.target==document)
		{
			this.endResize();
			return;
		}
		
		var delta_x = event.clientX-this.cursor_start_pos.x;
		var delta_y = event.clientY-this.cursor_start_pos.y;
		if(this.resize_type==1)
			this.setState({width:this.dlg_start_size.width-delta_x,height:this.dlg_start_size.height-delta_y,top:this.dlg_start_pos.y+delta_y,left:this.dlg_start_pos.x+delta_x});
		else if(this.resize_type==2)
			this.setState({height:this.dlg_start_size.height-delta_y,top:this.dlg_start_pos.y+delta_y});
		else if(this.resize_type==3)
			this.setState({width:this.dlg_start_size.width+delta_x,height:this.dlg_start_size.height-delta_y,top:this.dlg_start_pos.y+delta_y});
		else if(this.resize_type==4)
			this.setState({width:this.dlg_start_size.width+delta_x});
		else if(this.resize_type==5)
			this.setState({width:this.dlg_start_size.width+delta_x,height:this.dlg_start_size.height+delta_y});
		else if(this.resize_type==6)
			this.setState({height:this.dlg_start_size.height+delta_y});
		else if(this.resize_type==7)
			this.setState({width:this.dlg_start_size.width-delta_x,height:this.dlg_start_size.height+delta_y,left:this.dlg_start_pos.x+delta_x});
		else if(this.resize_type==8)
			this.setState({width:this.dlg_start_size.width-delta_x,left:this.dlg_start_pos.x+delta_x});
	}
	
	close() {
		this.closed = true;
		
		if(this.props.onClose!==undefined)
			this.props.onClose();
		
		if(Dialogs.instance.state[this.dlgid]!==undefined)
			Dialogs.close(this.dlgid);
		
		if(Dialogs.global.active==this)
		{
			if(Object.keys(Dialogs.instance.state).length==0)
				Dialogs.global.active=undefined;
			else
			{
				Dialogs.global.active = Dialogs.instance.state[Object.keys(Dialogs.instance.state)[0]].instance;
				Dialogs.global.active.setState({active:true});
			}
		}
	}
	
	activate() {
		if(Dialogs.global.active==this)
			return;
		
		var cur_z = this.state.zindex;
		
		if(Dialogs.global.active!==undefined)
			Dialogs.global.active.setState({active:false});
		
		Object.keys(Dialogs.instance.state).map( (key) => {
			if(Dialogs.instance.state[key].instance.state.zindex>=cur_z)
				Dialogs.instance.state[key].instance.setState({zindex:Dialogs.instance.state[key].instance.state.zindex-1});
		});
		
		this.setState({zindex:Dialogs.global.max_z,active:true});
		Dialogs.global.active = this;
	}
	
	renderTitle() {
		if(!this.props.hasTitle)
			return;
		
		return (
			<div ref={this.dlg_title} className="evq-dlg-title" onMouseDown={this.beginMove} onMouseUp={this.endMove}>
				{ this.props.title }
				<span className="evq-dlg-close faicon fa-remove" onClick={this.close}></span>
			</div>
		);
	}
	
	render() {
		var style = {
			top:this.state.top,
			left:this.state.left,
			width:this.state.width,
			height:this.state.height,
			zIndex: this.state.zindex,
		};
		
		return (
			<DialogContext.Provider value={{onComponentUpdate: this.componentDidUpdate}}>
				<div className="evq-dialog" style={style}>
					<div ref={this.dlg_outer} className="evq-dialog-outer" style={{backgroundColor:(this.state.active && !this.props.modal)?'rgba(61,174,233,0.2)':''}}>
						<div ref={this.dlg_inner} className="evq-dialog-inner" style={{borderTopWidth:this.hasTitle?0:1}} onMouseDown={this.activate}>
							{this.renderTitle()}
							<div ref={this.dlg_content} className="evq-dlg-content" style={!this.auto_height?{height:this.state.height-this.height_delta}:{}}>
								{ this.props.children }
							</div>
							
							<div data-pos="2" style={{width:'100%',height:this.resize_border,position:'absolute',top:0,left:0,cursor:'ns-resize'}} onMouseDown={this.beginResize} onMouseUp={this.endResize}></div>
							<div data-pos="4" style={{width:this.resize_border,height:'100%',position:'absolute',top:0,right:0,cursor:'ew-resize'}} onMouseDown={this.beginResize} onMouseUp={this.endResize}></div>
							<div data-pos="6" style={{width:'100%',height:this.resize_border,position:'absolute',bottom:0,left:0,cursor:'ns-resize'}} onMouseDown={this.beginResize} onMouseUp={this.endResize}></div>
							<div data-pos="8" style={{width:this.resize_border,height:'100%',position:'absolute',top:0,left:0,cursor:'ew-resize'}} onMouseDown={this.beginResize} onMouseUp={this.endResize}></div>
							<div data-pos="1" style={{width:this.resize_border,height:this.resize_border,position:'absolute',top:0,left:0,cursor:'nwse-resize'}} onMouseDown={this.beginResize} onMouseUp={this.endResize}></div>
							<div data-pos="3" style={{width:this.resize_border,height:this.resize_border,position:'absolute',top:0,right:0,cursor:'nesw-resize'}} onMouseDown={this.beginResize} onMouseUp={this.endResize}></div>
							<div data-pos="5" style={{width:this.resize_border,height:this.resize_border,position:'absolute',bottom:0,right:0,cursor:'nwse-resize'}} onMouseDown={this.beginResize} onMouseUp={this.endResize}></div>
							<div data-pos="7" style={{width:this.resize_border,height:this.resize_border,position:'absolute',bottom:0,left:0,cursor:'nesw-resize'}} onMouseDown={this.beginResize} onMouseUp={this.endResize}></div>
						</div>
					</div>
				</div>
				{this.props.modal?(<div className="evq-modal"></div>):''}
			</DialogContext.Provider>
		);
	}
}

Dialog.defaultProps = {
	modal: false,
	hasTitle: true
};
