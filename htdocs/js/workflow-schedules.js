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
	
	$('select[name=workflow_id').change(function() {
		evqueueAPI(false,'workflow','get',{id:$(this).val()},[],function(xml) {
			$('#what_workflow form .parameter').remove();
			$(xml).find('parameter').each(function() {
				$('#what_workflow form').append('<div class="parameter"><label>'+$(this).attr('name')+'</label><input name="parameter_'+$(this).attr('name')+'"></input></div>');
			});
		});
	});
	
	$('.custom-schedule-select').select2();
	
	$('.custom-schedule-select').on('select2:select',function() {
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
		console.log("adjust");
		$('#when_daily input[name=schedule]').val(";"+$(this).val().substr(3,2)+";"+$(this).val().substr(0,2)+";;;");
	});
});

function RefreshPage()
{
	Wait();
	
	$.ajax({url: "ajax/list-workflow-schedules.php"}).done(function(data) {
		$('#list-workflow-schedules').html(data);
		
		Ready();
		
		$('.fa-file-o').click({
			form_div:$('#wfs-editor'),
			group:'workflow_schedule',
			title:'Create workflow schedule',
			message:'Schedule created'
		}, evqueueCreateFormHandler);
		
		$('.fa-edit').click({
			form_div:$('#wfs-editor'),
			group:'workflow_schedule',
			title:'Edit workflow schedule',
			message:'Schedule saved'
		}, evqueueEditFormHandler);
		
		
		$('.fa-lock').click(function() {
			evqueueAPI(this, 'workflow_schedule', 'unlock', { 'id':$(this).parents('tr').data('id') }).done(function() {
				Message('Schedule is now active');
				RefreshPage();
			});
		});
		
		$('.fa-check').click(function() {
			evqueueAPI(this, 'workflow_schedule', 'lock', { 'id':$(this).parents('tr').data('id') }).done(function() {
				Message('Schedule is now inactive');
				RefreshPage();
			});
		});
		
		$('.fa-remove').click(function() {
			evqueueAPI(this, 'workflow_schedule', 'delete', { 'id':$(this).parents('tr').data('id') }, [], function() {
				Message('Schedule has been deleted');
				RefreshPage();
			});
		});
	});
}

function calculateSchedule() {
	var schedule = [];
	$.each( ['seconds', 'minutes', 'hours', 'days', 'months', 'weekdays'], function () {
		schedule.push( $('select[name='+this+'] option:checked').map(function(){return $(this).val()=='any'?'':$(this).val();}).toArray().join(',') );
	});
	
	$('input[name=schedule]').val(schedule.join(';'));
	//$('p#scheduleInEnglish').html(getScheduleToEnglish());
}