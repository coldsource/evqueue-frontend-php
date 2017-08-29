$(document).ready( function() {
	RefreshPage();
	
	$('input[type=radio][name=what]').change(function() {
		$('#what_workflow').toggle();
		$('#what_workflow form').toggleClass('nosubmit');
		
		$('#what_script').toggle();
		$('#what_script form').toggleClass('nosubmit');
	});
	
	$('input[type=radio][name=when]').change(function() {
		$('#when_daily').toggle();
		$('#when_daily form').toggleClass('nosubmit');
		
		$('#when_custom').toggle();
		$('#when_custom form').toggleClass('nosubmit');
	});
	
	$('select[name=workflow_id').change(function(event,schedule_xml) {
		$('#what_workflow form .parameter').remove();
		
		if($(this).val()=='')
			return;
		
		evqueueAPI({
			group: 'workflow',
			action: 'get',
			attributes: {id: $(this).val()}
		}).done(function(xml) {
			$(xml).find('parameter').each(function() {
				$('#what_workflow form').append('<div class="parameter"><label>'+$(this).attr('name')+'</label><input name="parameter_'+$(this).attr('name')+'"></input></div>');
			});
			
			$(schedule_xml).find('parameter').each(function() {
				$('#what_workflow form input[name=parameter_'+$(this).attr('name')+']').val($(this).attr('value'));
			});
		});
	});
	
	$('.custom-schedule-select').on('select2:select',function(e) {
		if(e.params.data.id=='any')
			$(this).find("option[value!=any]").prop('selected',false);
		else
			$(this).find("option[value=any]").prop('selected',false);
		
		$(this).change();
	});
	
	
	$('.custom-schedule-select').on('select2:unselect',function() {
		if($(this).find('option:selected').length==0)
		{
			$(this).find("option[value=any]").prop('selected',true);
			$(this).change();
		}
	});
	
	$('#when_custom .custom-schedule-select').change(calculateSchedule);
	
	$('#when_daily input[name=time]').on('autocompletechange',function() {
		if($(this).val()!='')
			$('#when_daily input[name=schedule]').val(";"+$(this).val().substr(3,2)+";"+$(this).val().substr(0,2)+";;;");
	});
	
	$('#when_daily form input[name=schedule]').change(function() {
		if($(this).val()=='')
		{
			$(this).val(';;;;;');
			return;
		}
		
		var schedule = $(this).val().split(';');
		var seconds = schedule[0].split(',');
		var minutes = schedule[1].split(',');
		var hours = schedule[2].split(',');
		var days = schedule[3].split(',');
		var months = schedule[4].split(',');
		var weekdays = schedule[5].split(',');
		if(schedule[0]=='' && schedule[1]!='' && minutes.length==1 && schedule[2]!='' && hours.length==1 && schedule[3]=='' && schedule[4]=='' && schedule[5]=='')
		{
			if(!$('input[name=when][value=Daily]').prop('checked'))
				$('input[name=when][value=Daily]').prop('checked',true).trigger('change');
			
			$('form input[name=time]').val(('00'+hours[0]).slice(-2)+':'+('00'+minutes[0]).slice(-2));
		}
		else
		{
			if(!$('input[name=when][value=Custom]').prop('checked'))
				$('input[name=when][value=Custom]').prop('checked',true).trigger('change');
			
			$('form select[name=seconds]').val(schedule[0]==''?['any']:seconds).trigger('change');
			$('form select[name=minutes]').val(schedule[1]==''?['any']:minutes).trigger('change');
			$('form select[name=hours]').val(schedule[2]==''?['any']:hours).trigger('change');
			$('form select[name=days]').val(schedule[3]==''?['any']:days).trigger('change');
			$('form select[name=months]').val(schedule[4]==''?['any']:months).trigger('change');
			$('form select[name=weekdays]').val(schedule[5]==''?['any']:weekdays).trigger('change');
		}
	});
});

function RefreshPage()
{
	Wait();
	
	$.ajax({url: "ajax/list-workflow-schedules.php"}).done(function(data) {
		$('#list-workflow-schedules').html(data);
		
		Ready();
		
		$(document).delegate('.fa-file-o','click', function () {
			
		});
		
		$('.fa-file-o').click({
			form_div:$('#wfs-editor'),
			group:'workflow_schedule',
			title:'Create workflow schedule',
			message:'Schedule created',
			prehandler:WFSFormHandler
		}, evqueueCreateFormHandler);
		
		$('.tdActions .fa-edit').click({
			form_div:$('#wfs-editor'),
			group:'workflow_schedule',
			title:'Edit workflow schedule',
			message:'Schedule saved',
			prehandler:WFSFormHandler
		}, evqueueEditFormHandler);
		
		
		$('.tdActions .fa-lock').click(function() {
			evqueueAPI({
				group: 'workflow_schedule',
				action: 'unlock',
				attributes: { 'id': $(this).parents('tr').data('id') }
			}).done(function() {
				Message('Schedule is now active');
				RefreshPage();
			});
		});
		
		$('.tdActions .fa-check').click(function() {
			evqueueAPI({
				group: 'workflow_schedule',
				action: 'lock',
				attributes: { 'id': $(this).parents('tr').data('id') }
			}).done(function() {
				Message('Schedule is now inactive');
				RefreshPage();
			});
		});
		
		$('.tdActions .fa-remove').click(function() {
			evqueueAPI({
				confirm: 'You are about to delete the selected schedule',
				group: 'workflow_schedule',
				action: 'delete',
				attributes: { 'id': $(this).parents('tr').data('id') }
			}).done(function() {
				Message('Schedule has been deleted');
				RefreshPage();
			});
		});
		
		$('#list-workflow-schedules tr').each(function() {
			if($(this).data('id'))
			{
				var tr_el = $(this);
				evqueueAPI({group:'instances',action:'list',attributes:{filter_schedule_id:$(this).data('id'),limit:1}}).done(function(xml) {
					if(xml.documentElement.firstChild)
					{
						tr_el.find('td:eq(4)').text(xml.documentElement.firstChild.getAttribute('start_time'));
						var instance_id = xml.documentElement.firstChild.getAttribute('id');
						if(xml.documentElement.firstChild.getAttribute('errors')==0)
							tr_el.find('td:eq(4)').append('<a href="index.php?filter_id='+instance_id+'"><span class="faicon fa-check" title="Instance has been successfully executed"></span></a>');
						else
							tr_el.find('td:eq(4)').append('<a href="index.php?filter_id='+instance_id+'"><span class="faicon fa-exclamation" title="Errors executing instance"></span></a>');
					}
				});
			}
		});
	});
}

function calculateSchedule() {
	var schedule = [];
	$.each( ['seconds', 'minutes', 'hours', 'days', 'months', 'weekdays'], function () {
		schedule.push( $('select[name='+this+'] option:checked').map(function(){return $(this).val()=='any'?'':$(this).val();}).toArray().join(',') );
	});
	
	$('input[name=schedule]').val(schedule.join(';'));
}

function WFSFormHandler()
{
	if(!$('input[name=what][value=script]').prop('checked'))
		return new jQuery.Deferred().resolve();
	
	if($('#what_script input[name=workflow_id]').val()!='')
		return new jQuery.Deferred().resolve();
	
	name = $('input[name=workflow_name]').val();
	group = $('input[name=workflow_group]').val();
	comment = $('input[name=comment]').val();
	script = $('input[name=script]').val();
	
	// Create a simple workflow to execute script
	xmldoc = document.implementation.createDocument(null,null);
	
	var workflow_node = xmldoc.createElement('workflow');
	xmldoc.appendChild(workflow_node);
	
	var subjobs_node = xmldoc.createElement('subjobs');
	workflow_node.appendChild(subjobs_node);
	
	var job_node = xmldoc.createElement('job');
	subjobs_node.appendChild(job_node);
	
	var tasks_node = xmldoc.createElement('tasks');
	job_node.appendChild(tasks_node);
	
	var task_node = xmldoc.createElement('task');
	task_node.setAttribute('name','!'+script);
	task_node.setAttribute('queue','default');
	tasks_node.appendChild(task_node);
	
	var workflow = btoa(new XMLSerializer().serializeToString(xmldoc));
	
	return evqueueAPI({
		group: 'workflow',
		action: 'create',
		attributes: {name:name,content:workflow,group:group,comment:comment}
	}).done(function(xml) {
		$('#what_script input[name=workflow_id]').val(xml.documentElement.getAttribute('workflow-id'));
	});
}
