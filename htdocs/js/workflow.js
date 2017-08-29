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
			document.location="workflow-ui.php?workflow_id=-1";
		});
		
		$('.fa-file-archive-o').click(function() {
			document.location="export.php?workflow_id="+$(this).parents('tr').data('id');
		});
		
		$('.git.fa-upload').click(function() {
			var log = prompt("Enter your commit log");
			if(log==null)
				return;
			
			Wait();
			evqueueAPI({
				confirm: $(this).hasClass('conflict') ? 'You are about to overwrite changes to the repository' : '',
				group: 'git',
				action: 'save_workflow',
				attributes: {
					name: $(this).data('name'),
					commit_log: log,
					force: $(this).hasClass('conflict') ? 'yes' : 'no'
				}
			}).done(function() {
				Message('Committed workflow to git');
				RefreshPage();
			});
		});
		
		$('.git.fa-download').click(function() {
			Wait();
			evqueueAPI({
				confirm: $(this).hasClass('conflict') ? 'You are about to overwrite changes to your local copy' : '',
				group: 'git',
				action: 'load_workflow',
				attributes: {name: $(this).data('name')}
			}).done(function() {
				Message('Loaded workflow from git');
				RefreshPage();
			});
		});
		
		$('.git.fa-remove').click(function() {
			var log = prompt("Enter your commit log");
			if(log==null)
				return;
			
			Wait();
			evqueueAPI({
				confirm: 'You are about to remove a workflow from the git repository',
				group: 'git',
				action: 'remove_workflow',
				attributes: {name: $(this).data('name'),commit_log:log}
			}).done(function() {
				Message('Removed workflow from git');
				RefreshPage();
			});
		});
		
		$('.fa-edit').click(function() {
			document.location="workflow-ui.php?workflow_id="+$(this).parents('tr').data('id');
		});
		
		$('.fa-remove:not(.git)').click(function() {
			Wait();
			evqueueAPI({
				confirm: 'You are about to delete the selected workflow',
				group: 'workflow',
				action: 'delete',
				attributes: { id: $(this).parents('tr').data('id') }
			}).done(function() {
				Message('Workflow has been deleted');
				RefreshPage();
			});
		});
	});
}
