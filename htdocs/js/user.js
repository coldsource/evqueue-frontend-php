$(document).ready( function() {
	RefreshPage();
});

function RefreshPage()
{
	Wait();
	
	$.ajax({url: "ajax/list-users.php"}).done(function(data) {
		$('#list-users').html(data);
		
		Ready();
		
		$('.fa-file-o').click({
			form_div:$('#user-editor'),
			group:'user',
			title:'Create user',
			message:'User created',
			prehandler:UserFormHandler
		}, function(evt) { $('#user-editor input[name=name]').prop('disabled',false); evqueueCreateFormHandler(evt); });
		
		$('.fa-edit').click({
			form_div:$('#user-editor'),
			group:'user',
			title:'Edit user',
			message:'User saved',
			prehandler:UserFormHandler
		}, function(evt) { 
			$('#user-editor input[name=name]').prop('disabled',true);
			$('#user-editor input[type=password]').val('');
			evqueueEditFormHandler(evt);
		});
		
		$('.fa-remove:not(.git)').click(function() {
			evqueueAPI({
				confirm: 'You are about to delete the selected user',
				group: 'user',
				action: 'delete',
				attributes: { 'name': $(this).parents('tr').data('id') }
			}).done(function() {
				Message('User has been deleted');
				RefreshPage();
			});
		});
	});
}

function UserFormHandler()
{
	if($('#user-editor input[name=password]').val()!=$('#user-editor input[name=password2]').val())
	{
		alert('Passwords do not match');
		return new jQuery.Deferred().reject();
	}
	
	return new jQuery.Deferred().resolve();
}