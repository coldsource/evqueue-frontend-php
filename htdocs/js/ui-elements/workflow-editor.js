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

function WorkflowEditor()
{
	this.workflow = false;
	
	var me = this;
	$('#add-parameter').click(function() {
		var name = prompt("Parameter name", "");
		if(name==null)
			return;
		
		me.workflow.Backup();
		
		if(me.workflow.AddParameter(name))
			me.RefreshParameters();
	});
}

WorkflowEditor.prototype.Open = function(id)
{
	this.workflow = wf;
	this.wfbackupdone = false;
	
	this.RefreshParameters();
	
	var wfname = this.workflow.GetAttribute('name');
	$('#workflow-editor input#wfname').val(wfname);
	
	var wfgroup = this.workflow.GetAttribute('group');
	$('#workflow-editor input#wfgroup').val(wfgroup);
	
	var wfcomment = this.workflow.GetAttribute('comment');
	$('#workflow-editor input#wfcomment').val(wfcomment);
	
	var me = this;
	$('#workflow-editor').dialog({
		width:900,
		height:300,
		close:function() {
			me.SaveAttribute('name',wfname,$('#workflow-editor input#wfname').val());
			me.SaveAttribute('group',wfgroup,$('#workflow-editor input#wfgroup').val());
			me.SaveAttribute('comment',wfcomment,$('#workflow-editor input#wfcomment').val());
			
			wf.Draw();
		}
	});
}

WorkflowEditor.prototype.SaveAttribute = function(name,old_val,new_val)
{
	if(old_val==new_val)
		return;
	
	if(!this.wfbackupdone)
	{
		wf.Backup();
		this.wfbackupdone = true;
	}
	
	this.workflow.SetAttribute(name,new_val);
}

WorkflowEditor.prototype.RefreshParameters = function()
{
	if(this.id==false || !this.workflow)
		return;
	
	var parameters = this.workflow.GetParameters();
	
	var node = $('#tab-workflowparameters .parameters');
	
	node.html('');
	
	for(var i=0;i<parameters.length;i++)
	{
		var parameter_div = $('<div>');
		node.append(parameter_div);
		parameter_div.append("<span class='faicon fa-remove' title='Delete parameter'></span>&nbsp;");
		parameter_div.append(parameters[i]);
	}
	
	var me = this;
	$('#tab-workflowparameters span.fa-remove').click(function() {
		me.workflow.Backup();
		me.workflow.DeleteParameter($(this).parent().index());
		me.RefreshParameters();
	});
}
