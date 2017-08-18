function TaskEditor()
{
	this.id = false;
	this.task = false;
	
	
	$('#add-input').click(this.AddInput);
	
	$('#add_text_value').click(this.AddTextInputPart);
	$('#add_xpath_value').click(this.AddValueInputPart);
}

TaskEditor.prototype.Open = function(id)
{
	this.id = id;
	
	this.RefreshInputs();
	
	$('#task-editor').dialog({width:900,height:400});
}

TaskEditor.prototype.RefreshInputs = function()
{
	if(this.id==false)
		return;
	
	this.task = wf.GetTaskByID(this.id);
	var inputs = this.task.GetInputs();
	
	$('#tab-inputs .inputs').html('');
	for(var i=0;i<inputs.length;i++)
	{
		var html = '';
		html += "<div class='input_line'>";
		html += "<div class='input' data-name='"+inputs[i].name+"'><span class='faicon fa-remove' title='Delete input'></span> "+inputs[i].name+"</div>";
		html += "<div class='value'>";
		for(var j=0;j<inputs[i].value.length;j++)
		{
			var part = inputs[i].value[j];
			if(part.type=='text')
				val = part.val;
			else
			{
				if(part.task && part.node)
					val = "task:"+part.task+", node:"+part.node;
				else if(part.parameter)
					val = "parameter:"+part.parameter;
				else
					val = part.val;
			}
				
			html += "<div class='input_part input_part_type_"+part.type+"'>"+val+"</div>";
		}
		html += "<span class='faicon fa-plus' title='Add input part'></span></div>";
		html += "</div>";
		$('#tab-inputs .inputs').append(html);
	}
	
	$('#tab-inputs .input span.fa-remove').click(this.DeleteInput);
	
	$('#tab-inputs .value span.fa-plus').click(function() {
		$('#value_selector_input_name').val($(this).parent().prev().data('name'));
		$('#input_type_text').val('');
		$('#input_type_xpath').val('');
		
		$('#input_type_xpathvalue').html('');
		
		var wfparameters = wf.GetParameters();
		if(wfparameters.length>0)
		{
			$('#input_type_xpathvalue').append($('<optgroup>', {label: "Workflow parameters"}));
			for(var i=0;i<wfparameters.length;i++)
				$('#input_type_xpathvalue').append($('<option>', {value: "evqGetWorkflowParameter('"+wfparameters[i]+"')",text:wfparameters[i]}));
		}
		
		var job = task_editor.task.GetParentJob();
		var i = 1;
		while(job = job.GetParent())
		{
			var tasks = job.GetTasks();
			for(var j=0;j<tasks.length;j++)
			{
				if(j==0)
					 $('#input_type_xpathvalue').append($('<optgroup>', {label: "Parent job"+i}));
				$('#input_type_xpathvalue').append($('<option>', {value: "evqGetParentJob("+(i-1)+")/evqGetOutput('"+tasks[j].GetName()+"')",text:tasks[j].GetName()}));
			}
			
			i++;
		}
		
		$('#value-selector').dialog({width: 800,height: 300});
	});
}

TaskEditor.prototype.AddInput = function()
{
	wf.Backup();
	
	var name = prompt("Task name", "");
	if(task_editor.task.AddInput(name))
		task_editor.RefreshInputs();
}

TaskEditor.prototype.DeleteInput = function()
{
	wf.Backup();
	
	if(task_editor.task.DeleteInput($(this).parent().data('name')))
		task_editor.RefreshInputs();
}

TaskEditor.prototype.AddTextInputPart = function()
{
	$('#value-selector').dialog('close');
	var name = $('#value_selector_input_name').val();
	var val = $('#input_type_text').val();
	if(task_editor.task.AddInputPart(name,'text',val))
		task_editor.RefreshInputs();
}

TaskEditor.prototype.AddValueInputPart = function()
{
	$('#value-selector').dialog('close');
	var name = $('#value_selector_input_name').val();
	
	var parent_task = $('#input_type_xpathvalue').val();
	var node = $('#input_type_xpathvalue_nodes').val();
	var val = parent_task;
	if(node)
		val += "/"+node;
	
	if(task_editor.task.AddInputPart(name,'xpathvalue',val))
		task_editor.RefreshInputs();
}