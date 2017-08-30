$(document).ready( function() {
	$('#userInfo span.fa-pencil').click(function() {
		$('#user-preferences-editor').dialog({width:'auto',height:'auto'});
	});
	
	$('#user-preferences-editor .submit').click(function() {
		var preferences = JSON.stringify({preferred_node:$('#user-preferences-editor select[name=preferred_node]').val()});
		var password = $('#user-preferences-editor input[name=password]').val();
		var password2 = $('#user-preferences-editor input[name=password2]').val();
		
		if((password!='' || password2!='') && password!=password2)
		{
			alert('Passwords do not match');
			return;
		}
		
		evqueueAPI({
			group: 'user',
			action: 'update_preferences',
			attributes: {name:connected_user,preferences:preferences}
		}).done(function() {
			if(password=='')
			{
				Message("Preferences updated");
				$('#user-preferences-editor').dialog('close');
				return;
			}
			
			evqueueAPI({
				group: 'user',
				action: 'change_password',
				attributes: {name:connected_user,password:password}
			}).done(function() {
				Message("Preferences and password updated");
				$('#user-preferences-editor').dialog('close');
				return;
			});
		});
	});
});