

function createNotif () {
	removeActionButtons();
	$('#notificationsTable').find('tr:last').html($('#editNotifSample').html());
	$('tr.createNotif select[name=type_id]').change();
}

$(document).delegate('select[name=type_id]', 'change', function () {
	$(this).parents('tr:first').find('div.parameters').load('ajax/notification.php?action=edit&type_id='+$(this).val());
});

function editNotif (button) {
	var tr = button.parents('tr:first');
	$('#notificationsTable tr:not(.header)').not(tr).hide('fast');
	
	removeActionButtons();
	
	var id = tr.find('td[data-param=id]').data('value');
	var type_id = tr.find('td[data-param=type_id]').data('value');
	var name = tr.find('td[data-param=name]').data('value');
	
	$('#notificationsTable').find('tr:last').replaceWith($('#editNotifSample').show());
	
	$('#editNotifSample input[name=id]').val(id).before('<b>Edit notification '+id+'</b>');
	$('#editNotifSample select[name=type_id]').prop('disabled',true).find('option[value='+type_id+']').attr('selected','selected');
	$('#editNotifSample input[name=name]').val(name);
	$('#editNotifSample div.parameters').load('ajax/notification.php?action=edit&id='+id);
}

function deleteNotif (id) {
	if (confirm('Delete notif '+id+'?'))
		wsfwd({
			params: {
				form_id: 'deleteNotif',
				id: id
			},
			success: function () {
				window.location.reload();
			}
		});
}

function saveNotif (button) {
	var tr = button.parents('tr:first');
	var params = tr.find(':input').serializeArray();
	params.push({name: 'form_id', value: 'saveNotif'});
	
	wsfwd({
		params: params,
		success: function () {
			window.location.reload();
		}
	});
}


$(document).ready( function () {
	$('#notificationsTable tr:not(#editNotifSample)').each( function () {
		var id = $(this).find('td[data-param=id]').data('value');
		$(this).find('td[data-param="parameters"]').load('ajax/notification.php?action=view&id='+id);
	});
});


function removeActionButtons () {
	$('#notificationsTable tr')    .not('#editNotifSample')    .find('.tdActions img').remove();
	$('#notificationTypes tr').not('#editNotifTypeSample').find('.tdActions img').remove();
}