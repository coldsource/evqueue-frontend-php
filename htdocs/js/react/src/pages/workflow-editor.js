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

import {WorkflowEditorMenu} from '../components/menus/workflow-editor.js';
import {WorkflowEditor} from '../components/editor/workflow-editor.js';

export class PageWorkflowEditor extends React.Component {
	constructor(props) {
		super(props);
		
		this.editor = React.createRef();
	}
	
	render() {
		return (
			<div>
				<WorkflowEditorMenu
					onProperties={ () => this.editor.current.openDialog('properties', 0) }
					onNewJob={ () => this.editor.current.newJob() }
					onUndo={ () => this.editor.current.undo() }
					onRedo={ () => this.editor.current.redo() }
				/>
				<WorkflowEditor ref={this.editor} />
			</div>
		);
	}
}
