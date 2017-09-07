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
	RefreshPage();
});

function RefreshPage()
{
	Wait();
	
	$.ajax({url: "ajax/list-queues.php"}).done(function(data) {
		$('#list-queues').html(data);
		
		Ready();
		
		$('.fa-file-o').click({
			form_div:$('#queue-editor'),
			group:'queue',
			title:'Create queue',
			message:'Queue created'
		}, evqueueCreateFormHandler);
		
		$('.fa-edit').click({
			form_div:$('#queue-editor'),
			group:'queue',
			title:'Edit queue',
			message:'Queue saved'
		}, evqueueEditFormHandler);
		
		$('.fa-remove:not(.git)').click(function() {
			evqueueAPI({
				confirm: 'You are about to delete the selected queue',
				group: 'queue',
				action: 'delete',
				attributes: { 'id': $(this).parents('tr').data('id') }
			}).done(function() {
				Message('Queue has been deleted');
				RefreshPage();
			});
		});
	});
}
