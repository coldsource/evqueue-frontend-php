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
		
		$('.fa-id-card-o').click(UserRightsFormHandler);
		
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

function UserRightsFormHandler(evt)
{
	var name = $(evt.currentTarget).parents('tr').data('id');
	
	$('#user-rights-editor').dialog({title:'Edit user rights',width:'auto',height:400});
	
	$('#user-rights-editor input').prop('checked',false);
	
	evqueueAPI({
		group: 'user',
		action: 'list_rights',
		attributes: {name:name}
	}).done(function(xml) {
		$(xml).find('right').each(function() {
			var cur_right_tr = $('#user-rights-editor tr[data-workflow-id='+$(this).attr('workflow-id')+']');
			cur_right_tr.find('input[name=edit]').prop('checked',$(this).attr('edit')=='yes');
			cur_right_tr.find('input[name=exec]').prop('checked',$(this).attr('exec')=='yes');
			cur_right_tr.find('input[name=kill]').prop('checked',$(this).attr('kill')=='yes');
			cur_right_tr.find('input[name=read]').prop('checked',$(this).attr('read')=='yes');
		});
	});
	
	$('#user-rights-editor input[type=checkbox]').off('change').on('change', function() {
		var tr_el = $(this).parent().parent();
		var msg;
		if($(this).prop('checked'))
			msg = 'Granted right';
		else
			msg = 'Revoked right';
		
		var attributes = {name:name,workflow_id:tr_el.data('workflow-id')};
		var has_rights = false;
		tr_el.find('input').each(function() {
			attributes[$(this).attr('name')] = $(this).prop('checked')?'yes':'no';
			if($(this).prop('checked'))
				has_rights = true;
		});
		
		evqueueAPI({
			group: 'user',
			action: 'revoke',
			ignore_errors: true,
			attributes: {name:name,workflow_id:tr_el.data('workflow-id')}
		}).always(function() {
			if(has_rights)
			{
				evqueueAPI({
					group: 'user',
					action: 'grant',
					attributes: attributes
				}).done(function() {
					Message(msg);
					RefreshPage();
				});
			}
			else
				Message(msg);
		});
	});
}