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
		
		$('.git.fa-upload').click(function() {
			var log = prompt("Enter your commit log");
			if(log==null)
				return;
			
			Wait();
			evqueueAPI($(this),'git','save_workflow',{name:$(this).data('name'),commit_log:log,force:$(this).data('force')},[],function() {
				Message('Committed workflow to git');
				RefreshPage();
			});
		});
		
		$('.git.fa-download').click(function() {
			Wait();
			evqueueAPI($(this),'git','load_workflow',{name:$(this).data('name')},[],function() {
				Message('Loaded workflow from git');
				RefreshPage();
			});
		});
		
		$('.git.fa-remove').click(function() {
			var log = prompt("Enter your commit log");
			if(log==null)
				return;
			
			Wait();
			evqueueAPI($(this),'git','remove_workflow',{name:$(this).data('name'),commit_log:log},[],function() {
				Message('Removed workflow from git');
				RefreshPage();
			});
		});
		
		$('.fa-edit').click(function() {
			document.location="manage-workflow.php?workflow_id="+$(this).parents('tr').data('id');
		});
		
		$('.fa-remove:not(.git)').click(function() {
			Wait();
			evqueueAPI(this, 'workflow', 'delete', { 'id':$(this).parents('tr').data('id') }, [], function() {
				Message('Workflow has been deleted');
				RefreshPage();
			});
		});
	});
}