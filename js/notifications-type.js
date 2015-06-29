
$(document).ready( function () {	
	$('.parameters').hide();
});

function editNotifType (button) {
	var tr = button.parents('tr:first');
	var name = tr.find('td[data-param=name]').data('value');
	
	removeActionButtons();
	$('tr.parameters').show().load('ajax/notification-type.php?type='+name+'&action=edit');
}

function saveNotifType (button) {
	var tr = button.parents('tr:first');
	var params = tr.find(':input').serialize();
	
	var type_notif = tr.find(':input[name=type_notif]');
	
	$.ajax({
		url: 'ajax/notification-type.php?action=save&type='+type_notif.val(),
		type: 'post',
		data: params,
//		async: false,
		success: function (content) {
			console.log(content);
		}
	});
	
	window.location.reload(); // rechargement de la page
}

function removeActionButtons () {
	$('.tdActions .action').remove();	
}