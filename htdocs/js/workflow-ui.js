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

$(document).ready(function() {
	if(workflow_id==-1)
	{
		wf = new Workflow($('#workflow'),"<workflow><subjobs><job /></subjobs></workflow>");
		wf.Draw();
	}
	else
	{
		Wait();
		
		evqueueAPI({
			group: 'workflow',
			action: 'get',
			attributes: {'id': workflow_id}
		}).done(function(xml) {
			var name = xml.documentElement.firstChild.getAttribute('name');
			var group = xml.documentElement.firstChild.getAttribute('group');
			var comment = xml.documentElement.firstChild.getAttribute('comment');
			
			xml.replaceChild(xml.documentElement.firstChild.firstChild,xml.documentElement);
			
			wf = new Workflow($('#workflow'),xml);
			wf.SetAttribute('name',name);
			wf.SetAttribute('group',group);
			wf.SetAttribute('comment',comment);
			
			evqueueAPI({
				group: 'workflow',
				action: 'list_notifications',
				attributes: {'id': workflow_id}
			}).done(function(xml) {
				var notifications = xml.Query('/response/notification',xml.documentElement);
				for(var i=0;i<notifications.length;i++)
					$('#subscribednotifications tr[data-id='+notifications[i].getAttribute('id')+'] input').prop('checked',true);
				
				Ready()
				
				wf.Draw();
			});
		});
	}
	
	task_editor = new TaskEditor();
	job_editor = new JobEditor();
	workflow_editor = new WorkflowEditor();
	
	if (workflow_id == -1)
		workflow_editor.Open();
	
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
			window.location = "workflow.php";
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
		$('#tasks-library').dialog({
			width:300,
			height:600,
			position: {my:"left top",at:"left top+10", of:"body"}
		});
	});

	$('#export_xml').click(function() {
		alert(wf.GetXML(true));
	});

	$('#import_xml').click(function() {
		$('#import_xml_dlg').dialog({width:720,height:580});
	});

	$('#import_xml_action').click(function() {
		wf = new Workflow($('#workflow'),$('#import_xml_dlg textarea').val());
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
	if(workflow_id==-1)
	{
		evqueueAPI({
			group: 'workflow',
			action: 'create',
			attributes: {
				name: wf.GetAttribute('name'),
				group: wf.GetAttribute('group'),
				comment: wf.GetAttribute('comment'),
				content: b64EncodeUnicode(wf.GetXML(true))
				}
		}).done(function(xml) {
			workflow_id = xml.firstChild.getAttribute('workflow-id');
			
			SaveNotifications(true).always(function() {
				$('#message').html('Workflow has been created');
				$('#message').show();
				$('#message').delay(2000).fadeOut();
				
				if(want_exit)
					window.location = "workflow.php";
			});
		});
	}
	else
	{
		evqueueAPI({
			group: 'workflow',
			action: 'edit',
			attributes: {
				id: workflow_id,
				name: wf.GetAttribute('name'),
				group: wf.GetAttribute('group'),
				comment: wf.GetAttribute('comment'),
				content: b64EncodeUnicode(wf.GetXML(true))
			}
		}).done(function(xml) {
			SaveNotifications(false).always(function() {
				$('#message').html('Workflow has been saved');
				$('#message').show();
				$('#message').delay(2000).fadeOut();
				
				if(want_exit)
					window.location = "workflow.php";
			});
		});
	}
}

function SaveNotifications(create)
{
	var promise = new jQuery.Deferred();  // global promise to return, which waits for all evqueueAPI calls
	
	var subscribed_notifications = [];
	$('#subscribednotifications input:checked').each(function() {
		subscribed_notifications[$(this).parents('tr').data('id')] = false;
	});
	
	evqueueAPI({
		group: 'workflow',
		action: 'list_notifications',
		attributes: {'id': workflow_id}
	}).done(function(xml) {
		var notifications = xml.Query('/response/notification',xml.documentElement);
		for(var i=0;i<notifications.length;i++)
			subscribed_notifications[notifications[i].getAttribute('id')] = true;
		
		var deferreds = [];
		$('#subscribednotifications input:checked').each(function() {
			var notification_id = $(this).parents('tr').data('id');
			if(!subscribed_notifications[notification_id])
			{
				var d = evqueueAPI({
					group: 'workflow',
					action: 'subscribe_notification',
					attributes: {id:workflow_id,notification_id:notification_id}
				});
				deferreds.push(d);
			}
		});
		
		$.when.apply($,deferreds).done( function () {
			if(create)
			{
				for(var notif_id in subscribed_notifications)
					$('#subscribednotifications tr[data-id='+notif_id+'] input').prop('checked',true);
					
				Ready()
				
				wf.Draw();
				
				promise.resolve();
			}
			else
			{
				var deferreds = [];
				
				for(var notif_id in subscribed_notifications)
				{
					if(subscribed_notifications[notif_id] && !$('#subscribednotifications tr[data-id='+notif_id+'] input').prop('checked'))
					{
						var d = evqueueAPI({
							group: 'workflow',
							action: 'unsubscribe_notification',
							attributes: {id:workflow_id,notification_id:notif_id}
						});
						deferreds.push(d);
					}
				}
				
				$.when.apply($,deferreds).done( function () {
					promise.resolve();
				});
			}
		});
		
		
	});
	
	return promise;
}
