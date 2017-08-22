$(document).ready( function() {
	RefreshPage();
});

function RefreshPage()
{
	Wait();
	
	$.ajax({url: "ajax/list-tasks.php"}).done(function(data) {
		$('#list-tasks').html(data);
		
		Ready();
		
		$('.fa-file-o').click(function() {
			$('#tpltask-editor .submit').text('Create task');
			$('#tpltask-editor .submit').off('click').on('click',function() {
				evqueueSubmitFormAPI($('#tpltask-editor'),'task',false,'Task created');
				$('#tpltask-editor').dialog('close');
				RefreshPage();
			});
			
			evqueuePrepareFormAPI($('#tpltask-editor'),'task',false).done(function() {
				$('#tpltask-editor').dialog({title:'Create task',width:900,height:400});
			});
		});
		
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
		
		$('.fa-edit').click(function() {
			var id = $(this).parents('tr').data('id');
			$('#tpltask-editor .submit').text('Save task');
			$('#tpltask-editor .submit').off('click').on('click',function() {
				evqueueSubmitFormAPI($('#tpltask-editor'),'task',id,'Task saved');
				$('#tpltask-editor').dialog('close');
				RefreshPage();
			});
			
			evqueuePrepareFormAPI($('#tpltask-editor'),'task',id).done(function() {
				$('#tpltask-editor').dialog({title:'Edit task',width:900,height:400});
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