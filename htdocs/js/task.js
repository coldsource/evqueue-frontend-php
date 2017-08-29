$(document).ready( function() {
	RefreshPage();
});

function RefreshPage()
{
	Wait();
	
	$.ajax({url: "ajax/list-tasks.php"}).done(function(data) {
		$('#list-tasks').html(data);
		
		Ready();
		
		$('.fa-file-o').click({
			form_div:$('#tpltask-editor'),
			group:'task',
			title:'Create task',
			message:'Task created'
		}, evqueueCreateFormHandler);
		
		$('.fa-edit').click({
			form_div:$('#tpltask-editor'),
			group:'task',
			title:'Edit task',
			message:'Task saved'
		}, evqueueEditFormHandler);
		
		$('.git.fa-upload').click(function() {
			var log = prompt("Enter your commit log");
			if(log==null)
				return;
			
			Wait();
			evqueueAPI({
				element: this,
				group: 'git',
				action: 'save_task',
				attributes: {name: $(this).data('name'), commit_log: log,force:$(this).data('force')}
			}).done(function() {
				Message('Committed task to git');
				RefreshPage();
			});
		});
		
		$('.git.fa-download').click(function() {
			Wait();
			evqueueAPI({
				element: this,
				group: 'git',
				action: 'load_task',
				attributes: {name: $(this).data('name')}
			}).done(function() {
				Message('Loaded task from git');
				RefreshPage();
			});
		});
		
		$('.git.fa-remove').click(function() {
			var log = prompt("Enter your commit log");
			if(log==null)
				return;
			
			Wait();
			evqueueAPI({
				element: this,
				group: 'git',
				action: 'remove_task',
				attributes: {name: $(this).data('name'), commit_log: log}
			}).done(function() {
				Message('Removed task from git');
				RefreshPage();
			});
		});
		
		$('.fa-remove:not(.git)').click(function() {
			evqueueAPI({
				element: this,
				group: 'task',
				action: 'delete',
				attributes: { 'id':$(this).parents('tr').data('id') }
			}).done(function() {
				Message('Task has been deleted');
				RefreshPage();
			});
		});
	});
}
