$(document).ready(function() {
	$('.tabs').tabs();
	
	$('html').css('height','100%');
	$('body').css('height','100%');
	$('body').css("cursor", "wait");
	
	evqueueAPI(false,'workflow','get',{'id':8},[],function(xml) {
		xml.replaceChild(xml.documentElement.firstChild.firstChild,xml.documentElement);
		wf = new Workflow($('#workflow'),xml);
		
		$('body').css('cursor', 'default');
		$('html').css('height','auto');
		$('body').css('height','auto');
		
		wf.Draw();
	});
	
	tasks_library = new TasksLibrary();
	
	task_editor = new TaskEditor();
	job_editor = new JobEditor();
	
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

	$('#undo').click(function() {
		wf.Undo();
		wf.Draw();
		task_editor.RefreshInputs();
	});

	$('#redo').click(function() {
		wf.Redo();
		wf.Draw();
		task_editor.RefreshInputs();
	});

	$('#open-tasks-library').click(function() {
		$('#tasks-library').dialog({width:600,height:400});
	});

	$('#export_xml').click(function() {
		alert(wf.GetXML());
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
