function TaskEditor()
{
	this.id = false;
	this.task = false;
	
	var me = this;
	
	evqueueAPI({
		group: 'queuepool',
		action: 'list',
	}).done(function(xml) {
		$(xml).find('queue').each(function(index, value) {
			$('#task-editor select#queue').append($('<option>', {value: $(value).attr('name'),text:$(value).attr('name')+" ("+$(value).attr('concurrency')+")"}));
		});
	});
	
	$('#task-editor select#retryschedule').append($('<option>', {value: '',text:'None'}));
	evqueueAPI({
		group: 'retry_schedules',
		action: 'list'
	}).done(function(xml) {
		$(xml).find('schedule').each(function(index, value) {
			$('#task-editor select#retryschedule').append($('<option>', {value: $(value).attr('name'),text:$(value).attr('name')}));
		});
	});
	
	$('#task-editor select#retryretval').append($('<option>', {value: '',text:'All error codes'}));
	for(var i=1;i<256;i++)
		$('#task-editor select#retryretval').append($('<option>', {value: i,text:'Code '+i}));
	
	
	$('#add-input').click(this.AddInput);
	
	$('#tab-conditionsloops span.fa-magic').click(function() {
		var input = $(this).parent().find('input');
		
		OpenXPathHelper();
		
		$('#xpath-selector #add_xpath_node').off('click').on('click', function() {
			$('#xpath-selector').dialog('close');
			
			input.val(XPathHelperPath($('#xpath-selector')));
		});
	});
}

TaskEditor.prototype.Open = function(id)
{
	this.id = id;
	this.task = wf.GetTaskByID(this.id);
	this.wfbackupdone = false;
	
	this.RefreshInputs();
	
	InitializeXPathHelper(this.task,'task');
	
	var condition = this.task.GetAttribute("condition");
	$('#task-editor input#condition').val(condition);
	
	var loop = this.task.GetAttribute("loop");
	$('#task-editor input#loop').val(loop);
	
	var iterationcondition = this.task.GetAttribute("iteration-condition");
	$('#task-editor input#iteration-condition').val(iterationcondition);
	
	var queue = this.task.GetAttribute('queue');
	$("#task-editor select#queue option[value='"+queue+"']").attr("selected", "selected");
	
	var retry_schedule = this.task.GetAttribute('retry_schedule');
	$("#task-editor select#retryschedule").val(retry_schedule);
	$("#task-editor select#retryschedule").change(function() {
		if($(this).val()=='')
		{
			$("#task-editor select#retryretval").val('');
			$("#task-editor select#retryretval").attr('disabled','disabled');
		}
		else
			$("#task-editor select#retryretval").removeAttr('disabled');
	});
	
	var retry_retval = this.task.GetAttribute('retry_retval');
	if(retry_schedule=='')
	{
		$("#task-editor select#retryretval").val('');
		$("#task-editor select#retryretval").attr('disabled','disabled');
	}
	else
	{
		$("#task-editor select#retryretval").val(retry_retval);
		$("#task-editor select#retryretval").removeAttr('disabled');
	}
	
	var stdin_mode = this.task.GetAttribute('stdinmode');
	$("#task-editor select#stdinmode").val(stdin_mode);
	
	var me = this;
	$('#task-editor').dialog({
		width:900,
		height:400,
		title:"Edit task '"+this.task.GetName()+"'",
		close:function() {
			me.SaveAttribute('condition',condition,$('#task-editor input#condition').val());
			me.SaveAttribute('loop',loop,$('#task-editor input#loop').val());
			me.SaveAttribute('iteration-condition',iterationcondition,$('#task-editor input#iteration-condition').val());
			me.SaveAttribute('queue',queue,$("#task-editor select#queue").val());
			me.SaveAttribute('retry_schedule',retry_schedule,$("#task-editor select#retryschedule").val());
			me.SaveAttribute('retry_retval',retry_retval,$("#task-editor select#retryretval").val());
			me.SaveAttribute('user',queue,$("#task-editor input#user").val());
			me.SaveAttribute('host',queue,$("#task-editor input#host").val());
			me.SaveAttribute('queue_host',queue,$("#task-editor input#queue_host").val());
			me.SaveAttribute('stdinmode',stdin_mode,$("#task-editor select#stdinmode").val());
			
			wf.Draw();
		}
	});
}

TaskEditor.prototype.SaveAttribute = function(name,old_val,new_val)
{
	if(old_val==new_val)
		return;
	
	if(!this.wfbackupdone)
	{
		wf.Backup();
		this.wfbackupdone = true;
	}
	
	this.task.SetAttribute(name,new_val);
}

TaskEditor.prototype.RefreshInputs = function()
{
	if(this.id==false)
		return;
	
	//  Refresh task
	this.task = wf.GetTaskByID(this.id);
	
	var inputs = this.task.GetInputs();
	
	$('#tab-inputs .inputs').html('');
	$('#tab-stdin .value').html('');
	
	for(var i=0;i<inputs.length;i++)
	{
		if(inputs[i].type=='input')
		{
			var div = $("<div class='input_line' data-inputtype='input' >");
			
			var input_div = $("<div class='input'>");
			input_div.append("<span class='faicon fa-remove' title='Delete input'></span>&nbsp;");
			var input_name_span = $("<span>",{class:'input_name',text:inputs[i].name!=''?inputs[i].name:"Input "+(i+1)});
			if(inputs[i].name=="")
				input_name_span.addClass('greyed');
			input_div.append(input_name_span);
			div.append(input_div);
			
			var value_div = $("<div class='value'>");
			div.append(value_div);
			this.RefreshInputParts(inputs[i],value_div);
			$('#tab-inputs .inputs').append(div);
		}
		else if(inputs[i].type=='stdin')
			this.RefreshInputParts(inputs[i],$('#tab-stdin .value'));
	}
	
	$('#tab-inputs .input span.input_name').click(function() {
		var el = $(this);
		el.hide();
		var input_el = $('<input />');
		input_el.val(el.text());
		input_el.css('width','130px');
		el.after(input_el);
		input_el.focus();
		
		input_el.blur(function() {
			wf.Backup();
			
			task_editor.task.RenameInput(input_el.parent().parent().index(),input_el.val());
			input_el.remove();
			el.show();
			
			task_editor.RefreshInputs();
		});
	});
	
	$('#tab-inputs .input span.fa-remove').click(this.DeleteInput);
	
	$('#tab-inputs .value span.fa-remove,#tab-stdin .value span.fa-remove').click(function() {
		wf.Backup();
		
		var idx;
		if($(this).parent().parent().parent().data('inputtype')=='input')
			idx = $(this).parent().parent().parent().index();
		else
			idx = 'stdin';
		
		task_editor.task.DeleteInputPart(idx,$(this).parent().index());
		task_editor.RefreshInputs();
	});
	
	$('#tab-inputs .value .input_part,#tab-stdin .value .input_part').click(function() {
		var idx;
		if($(this).parent().parent().data('inputtype')=='input')
			idx = $(this).parent().parent().index();
		else
			idx = 'stdin';
		
		var part_idx = $(this).index();
		
		OpenValueSelector($(this).data('type'),$(this).data('val'));
		
		$('#value-selector .add_value').off('click').on('click',function() {
			wf.Backup();
	
			$('#value-selector').dialog('close');
			
			var type = $(this).data('type');
			var val;
			if(type=='text')
				val = $('#value-selector .input_type_text').val();
			else if(type=='xpathvalue')
				val = XPathHelperPath($('#value-selector #tab-value'));
			else if(type=='xpathcopy')
				val = XPathHelperPath($('#value-selector #tab-copy'));
			else if(type=='advanced')
			{
				val = $('#value-selector .input_type_advanced').val();
				type = $('#value-selector #advanced_mode').val();
			}
			
			task_editor.task.EditInputPart(idx,part_idx,val);
			task_editor.RefreshInputs();
		});
	});
	
	$('#tab-inputs .value span.fa-plus,#tab-stdin .value span.fa-plus').click(function() {
		var idx;
		if($(this).parent().parent().data('inputtype')=='input')
			idx = $(this).parent().parent().index();
		else
			idx = 'stdin';
		
		OpenValueSelector();
		
		$('#value-selector .add_value').off('click').on('click',function() {
			wf.Backup();
	
			$('#value-selector').dialog('close');
			
			var type = $(this).data('type');
			var val;
			if(type=='text')
				val = $('#value-selector .input_type_text').val();
			else if(type=='xpathvalue')
				val = XPathHelperPath($('#value-selector #tab-value'));
			else if(type=='xpathcopy')
				val = XPathHelperPath($('#value-selector #tab-copy'));
			else if(type=='advanced')
			{
				val = $('#value-selector .input_type_advanced').val();
				type = $('#value-selector #advanced_mode').val();
			}
			
			task_editor.task.AddInputPart(idx,type,val);
			task_editor.RefreshInputs();
		});
	});
}

TaskEditor.prototype.RefreshInputParts = function(input,value_div)
{
	for(var j=0;j<input.value.length;j++)
	{
		var title = '';
		var part = input.value[j];
		if(part.type=='text')
			val = part.val;
		else
		{
			if(part.type=='xpathvalue')
				title += " (value)";
			else
				title += " (copy)";
			
			if(part.task && part.node)
				val = "task:"+part.task+", node:"+part.node;
			else if(part.parameter)
				val = "parameter:"+part.parameter;
			else
				val = part.val;
		}
		
		var value_part_div = $("<div>",{class:"input_part input_part_type_"+part.type,title:part.val+title,text:val,'data-type':part.type,'data-val':part.val});
		value_part_div.append(" <span class='faicon fa-remove' title='Remove input part'></span>");
		value_div.append(value_part_div);
	}
	value_div.append("<span class='faicon fa-plus' title='Add input part'></span>");
}

TaskEditor.prototype.AddInput = function()
{
	var name = prompt("Input name", "");
	if(name==null)
		return;
	
	wf.Backup();
	
	if(task_editor.task.AddInput(name))
		task_editor.RefreshInputs();
}

TaskEditor.prototype.DeleteInput = function()
{
	wf.Backup();
	
	if(task_editor.task.DeleteInput($(this).parent().parent().index()))
		task_editor.RefreshInputs();
}
