$(document).ready( function() {
	RefreshPage();
});

function RefreshPage()
{
	Wait();
	
	$.ajax({url: "ajax/list-queues.php"}).done(function(data) {
		$('#list-queues').html(data);
		
		Ready();
		
		$('.fa-file-o').click(function() {
			$('#queue-editor .submit').text('Create queue');
			$('#queue-editor .submit').off('click').on('click',function() {
				evqueueSubmitFormAPI($('#queue-editor'),'queue',false,'Queue created');
				$('#queue-editor').dialog('close');
				RefreshPage();
			});
			
			evqueuePrepareFormAPI($('#queue-editor'),'queuepool',false).done(function() {
				$('#queue-editor').dialog({title:'Create queue',width:900,height:300});
			});
		});
		
		$('.fa-edit').click(function() {
			var id = $(this).parents('tr').data('id');
			$('#queue-editor .submit').text('Save queue');
			$('#queue-editor .submit').off('click').on('click',function() {
				evqueueSubmitFormAPI($('#queue-editor'),'queue',id,'Queue saved');
				$('#queue-editor').dialog('close');
				RefreshPage();
			});
			
			evqueuePrepareFormAPI($('#queue-editor'),'queue',id).done(function() {
				$('#queue-editor').dialog({title:'Edit queue',width:900,height:300});
			});
		});
		
		$('.fa-remove:not(.git)').click(function() {
			evqueueAPI(this, 'queue', 'delete', { 'id':$(this).parents('tr').data('id') }, [], function() {
				Message('Queue has been deleted');
				RefreshPage();
			});
		});
	});
}
