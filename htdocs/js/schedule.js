var schedule;

$(document).ready( function() {
	RefreshPage();
	
	$('#schedule-editor .fa-plus').click(function() {
		schedule.AddLevel();
		AddScheduleLevel(false);
	});
	
	$('#schedule-editor input[name=content]').change(function() {
		if($(this).val()=='')
		{
			schedule = new RetrySchedule();
			schedule.AddLevel();
			$('#schedule-editor form div.level').remove();
			AddScheduleLevel(true);
		}
		else
		{
			$('#schedule-editor form div.level').remove();
			UpdateSchedule();
		}
	});
	
	$('#schedule-editor input[name=id]').change(function(event,data) {
		if($(this).val()=='')
			return;
		
		schedule = new RetrySchedule(new XMLSerializer().serializeToString(data.documentElement.firstChild));
		$('#schedule-editor input[name=content]').val(btoa(schedule.GetXML()));
		$('#schedule-editor input[name=content]').trigger('change');
	});
});

function RefreshPage()
{
	Wait();
	
	$.ajax({url: "ajax/list-schedules.php"}).done(function(data) {
		$('#list-schedules').html(data);
		
		Ready();
		
		$('.fa-file-o').click({
			form_div:$('#schedule-editor'),
			group:'retry_schedule',
			title:'Create retry schedule',
			message:'Schedule created'
		}, evqueueCreateFormHandler);
		
		$('td.tdActions .fa-edit').click({
			form_div:$('#schedule-editor'),
			group:'retry_schedule',
			title:'Edit retry schedule',
			message:'Schedule saved'
		}, evqueueEditFormHandler);
		
		$('td.tdActions .fa-remove').click(function() {
			evqueueAPI({
				confirm: 'You are about to delete the selected retry schedule',
				group: 'retry_schedule',
				action: 'delete',
				attributes: { 'id': $(this).parents('tr').data('id') }
			}).done(function() {
				Message('Schedule has been deleted');
				RefreshPage();
			});
		});
	});
}

function AddScheduleLevel(isfirst,retry_delay='',retry_times='')
{
	var label = 'If task fails, retry';
	var remove = '';
	if(!isfirst)
	{
		label = 'then';
		remove = '<span class="faicon fa-remove"></span>';
	}
	
	var html = $('<div class="level"><label>'+label+'</label>every <input type="text" name="retry_delay" class="spinner nosubmit" value="'+retry_delay+'" /> seconds for <input type="text" name="retry_times" class="spinner nosubmit" value="'+retry_times+'" /> times'+remove+'</div>');
	html.find('.spinner').spinner();
	
	html.find('.spinner').on('spinchange', function() {
		var idx = $(this).parent().parent().index('div.level');
		schedule.SetLevelAttribute(idx,$(this).attr('name'),$(this).val());
		$('#schedule-editor input[name=content]').val(btoa(schedule.GetXML()));
	});
	
	html.find('.fa-remove').click(function() {
		var idx = $(this).parent().index('div.level');
		schedule.DeleteLevel(idx);
		$('#schedule-editor input[name=content]').val(btoa(schedule.GetXML()));
		$(this).parent().remove();
	});
	
	$('#schedule-editor form div').last().prev().after(html);
	
	if(retry_delay=='' && retry_times=='')
		$('#schedule-editor input[name=content]').val(btoa(schedule.GetXML()));
}

function UpdateSchedule()
{
	var levels = schedule.GetLevels();
	console.log(levels);
	for(var i=0;i<levels.length;i++)
		AddScheduleLevel(i==0,levels[i].retry_delay,levels[i].retry_times);
}