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
			evqueueAPI($(this),'git','save_task',{name:$(this).data('name'),commit_log:log,force:$(this).data('force')},[],function() {
				Message('Committed task to git');
				RefreshPage();
			});
		});
		
		$('.git.fa-download').click(function() {
			Wait();
			evqueueAPI($(this),'git','load_task',{name:$(this).data('name')},[],function() {
				Message('Loaded task from git');
				RefreshPage();
			});
		});
		
		$('.git.fa-remove').click(function() {
			var log = prompt("Enter your commit log");
			if(log==null)
				return;
			
			Wait();
			evqueueAPI($(this),'git','remove_task',{name:$(this).data('name'),commit_log:log},[],function() {
				Message('Removed task from git');
				RefreshPage();
			});
		});
		
		$('.fa-remove:not(.git)').click(function() {
			evqueueAPI(this, 'task', 'delete', { 'id':$(this).parents('tr').data('id') }, [], function() {
				Message('Task has been deleted');
				RefreshPage();
			});
		});
	});
}