$(document).ready( function() {
	RefreshPage();
});

function RefreshPage()
{
	Wait();
	
	$.ajax({url: "ajax/list-workflows.php"}).done(function(data) {
		$('#list-workflows').html(data);
		
		Ready();
		
		$('.fa-file-o').click(function() {
			document.location="manage-workflow.php?workflow_id=-1";
		});
		
		$('.fa-file-archive-o').click(function() {
			document.location="export.php?workflow_id="+$(this).parents('tr').data('id');
		});
		
		$('.fa-edit').click(function() {
			document.location="manage-workflow.php?workflow_id="+$(this).parents('tr').data('id');
		});
		
		$('.fa-remove').click(function() {
			evqueueAPI(this, 'workflow', 'get', { 'id':$(this).parents('tr').data('id') }, [], function() {
				Message('Workflow has been deleted');
				RefreshPage();
			});
		});
	});
}