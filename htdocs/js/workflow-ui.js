$(document).ready(function() {
	$('.tabs').tabs();
	
	$('html').css('height','100%');
	$('body').css('height','100%');
	$('body').css("cursor", "wait");
	
	evqueueAPI(false,'workflow','get',{'id':workflow_id},[],function(xml) {
		var name = xml.documentElement.firstChild.getAttribute('name');
		var group = xml.documentElement.firstChild.getAttribute('group');
		var comment = xml.documentElement.firstChild.getAttribute('comment');
		
		xml.replaceChild(xml.documentElement.firstChild.firstChild,xml.documentElement);
		
		wf = new Workflow($('#workflow'),xml);
		wf.SetAttribute('name',name);
		wf.SetAttribute('group',group);
		wf.SetAttribute('comment',comment);
		
		$('body').css('cursor', 'default');
		$('html').css('height','auto');
		$('body').css('height','auto');
		
		wf.Draw();
	});
	
	task_editor = new TaskEditor();
	job_editor = new JobEditor();
	workflow_editor = new WorkflowEditor();
	
	want_exit = false;
	
	tasks_library = new TasksLibrary();
	
	$('#trash').droppable({
		drop: function(event, ui) {
			wf.Backup();
			
			var type = ui.draggable.data('type');
			
			if(type=='branch')
			{
				var current_job_id = ui.draggable.find('.node:first').data('id');
				var current_job = wf.GetJobByID(current_job_id);
				current_job.Delete(true);
			}
			else if(type=='node')
			{
				var current_job_id = ui.draggable.data('id');
				var current_job = wf.GetJobByID(current_job_id);
				current_job.Delete(false);
			}
		
			wf.Draw();
		}
	});
	
	$('#save').click(function() {
		SaveWorkflow();
	});
	
	$('#exit').click(function() {
		if(confirm("Do you want to save your modifications"))
		{
			want_exit = true;
			SaveWorkflow();
		}
		else
			window.location = "list-workflows.php";
	});
	
	$('#open-workflow-editor').click(function() {
		workflow_editor.Open();
	});
	
	$('#undo').click(function() {
		wf.Undo();
		wf.Draw();
		task_editor.RefreshInputs();
		workflow_editor.RefreshParameters();
	});

	$('#redo').click(function() {
		wf.Redo();
		wf.Draw();
		task_editor.RefreshInputs();
		workflow_editor.RefreshParameters();
	});

	$('#open-tasks-library').click(function() {
		$('#tasks-library').dialog({width:600,height:400});
	});

	$('#export_xml').click(function() {
		alert(wf.GetXML(true));
	});

	$('#import_xml').click(function() {
		$('#import_xml_dlg').dialog({width:720,height:580});
	});

	$('#import_xml_action').click(function() {
		wf = new Workflow($('#import_xml_dlg textarea').val());
		wf.Draw();
		$('#import_xml_dlg').dialog('close');
	});

	$('#add_text_value').click(function() {
		$('#task-input-selector').dialog('close');
		var val = $('#input_type_text').val();
		$('#task_input').append("<div class='input_part input_type_text'>"+val+"</div>");
	});

	$('#add_xpath_value').click(function() {
		$('#task-input-selector').dialog('close');
		var val = "task:"+$('#input_type_xpathvalue').val();
		val+= "&nbsp; node:"+$('#input_type_xpathvalue_nodes').val();
		$('#task_input').append("<div class='input_part input_type_xpathvalue'>"+val+"</div>");
	});
});

function SaveWorkflow()
{
	evqueueAPI(false,'workflow','edit',{
		'id':workflow_id,
		'name':wf.GetAttribute('name'),
		'group':wf.GetAttribute('group'),
		'comment':wf.GetAttribute('comment'),
		'content':btoa(wf.GetXML(true))
		},[],function(xml) {
			$('#message').html('Workflow has been saved');
			$('#message').show();
			$('#message').delay(2000).fadeOut();
			
			if(want_exit)
				window.location = "list-workflows.php";
		;
	});
}
