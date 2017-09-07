 /*
  * This file is part of evQueue
  * 
  * evQueue is free software: you can redistribute it and/or modify
  * it under the terms of the GNU General Public License as published by
  * the Free Software Foundation, either version 3 of the License, or
  * (at your option) any later version.
  * 
  * evQueue is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  * GNU General Public License for more details.
  *
  * You should have received a copy of the GNU General Public License
  * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
  * 
  * Author: Thibault Kummer
  */

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