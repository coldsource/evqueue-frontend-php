$(document).ready( function() {
	RefreshPage();
	
	$('.fa-plus').click(function() {
		AddScheduleLevel(false);
	});
	
	$('#schedule-editor input[name=content]').change(function() {
		if($(this).val()=='')
		{
			$('#schedule-editor form div.level').remove();
			AddScheduleLevel(true);
		}
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
		
		$('.fa-edit').click({
			form_div:$('#schedule-editor'),
			group:'retry_schedule',
			title:'Edit retry schedule',
			message:'Schedule saved'
		}, evqueueEditFormHandler);
		
		$('.fa-remove:not(.git)').click(function() {
			evqueueAPI(this, 'retry_schedule', 'delete', { 'id':$(this).parents('tr').data('id') }, [], function() {
				Message('Schedule has been deleted');
				RefreshPage();
			});
		});
	});
}

function AddScheduleLevel(isfirst)
{
	var label = 'If task fails, retry';
	if(!isfirst)
		label = 'then';
	
	var html = $('<div class="level"><label>'+label+'</label>every <input type="text" name="seconds" class="spinner nosubmit" /> seconds for <input type="text" name="times" class="spinner nosubmit" /> times</div>');
	html.find('.spinner').spinner();
	
	html.find('.spinner').on('spinchange', function() {
		console.log("change");
	});
	
	$('#schedule-editor form div').last().prev().after(html);
}