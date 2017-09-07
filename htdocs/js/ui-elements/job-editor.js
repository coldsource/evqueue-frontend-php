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

function JobEditor()
{
	this.id = false;
	this.job = false;
	
	$('#job-editor span.fa-magic').click(function() {
		var input = $(this).parent().find('input');
		
		OpenXPathHelper();
		
		$('#xpath-selector #add_xpath_node').off('click').on('click', function() {
			$('#xpath-selector').dialog('close');
			
			input.val(XPathHelperPath($('#xpath-selector')));
		});
	});
	
	$('#job-editor #condition, #job-editor #iteration-condition').on('input', function() {
		var checkbox = $(this).parent().next().find('input');
		if($(this).val().substr(0,8)=="evqWait(" && $(this).val().substr($(this).val().length-1)==")")
			checkbox.prop('checked',true);
		else
			checkbox.prop('checked',false);
	});
	
	$('#job-editor #waitcondition, #job-editor #waititerationcondition').change(function() {
		var input = $(this).parent().prev().find('input');
		if($(this).is(":checked"))
			input.val("evqWait("+input.val()+")");
		else
			input.val(input.val().substr(8,input.val().length-9));
	});
}

JobEditor.prototype.Open = function(id)
{
	this.id = id;
	this.job = wf.GetJobByID(this.id);
	this.wfbackupdone = false;
	
	InitializeXPathHelper(this.job,'job');
	
	var jobname = this.job.GetAttribute("name");
	$('#job-editor input#jobname').val(jobname);
	
	var condition = this.job.GetAttribute("condition");
	$('#job-editor input#condition').val(condition);
	
	var loop = this.job.GetAttribute("loop");
	$('#job-editor input#loop').val(loop);
	
	var iterationcondition = this.job.GetAttribute("iteration-condition");
	$('#job-editor input#iteration-condition').val(iterationcondition);
	
	var me = this;
	$('#job-editor').dialog({
		width:900,
		height:400,
		title:"Edit job '"+this.job.GetAttribute('name')+"'",
		close:function() {
			me.SaveAttribute('name',jobname,$('#job-editor input#jobname').val());
			me.SaveAttribute('condition',condition,$('#job-editor input#condition').val());
			me.SaveAttribute('loop',loop,$('#job-editor input#loop').val());
			me.SaveAttribute('iteration-condition',iterationcondition,$('#job-editor input#iteration-condition').val());
			
			wf.Draw();
		}
	});
}

JobEditor.prototype.SaveAttribute = function(name,old_val,new_val)
{
	if(old_val==new_val)
		return;
	
	if(!this.wfbackupdone)
	{
		wf.Backup();
		this.wfbackupdone = true;
	}
	
	this.job.SetAttribute(name,new_val);
}
