$(document).ready( function() {
	RefreshPage();
});

function RefreshPage()
{
	Wait();
	
	$.ajax({url: "ajax/list-notification-types.php"}).done(function(data) {
		$('#list-notification-types').html(data);
		
		Ready();
		
		$('.fa-cogs').click(function() {
			var id = $(this).parents('tr').data('id');
			$.ajax({url: "ajax/notification-configuration.php?id="+id+"&type=plugin"}).done(function(data) {
				$('#plugin-configuration').html(data);
				
				evqueueAPI({
					group: 'notification_type',
					action: 'get_conf',
					attributes: { 'id':id }
				}).done(function(xml) {
					var conf = jQuery.parseJSON(b64DecodeUnicode(xml.documentElement.firstChild.getAttribute('content')));
					for(var i in conf)
						$('#plugin-configuration form *[name='+i+']').val(conf[i]);
				});
				
				$('#plugin-configuration .submit').click(function() {
					var conf = {};
					var inputs = $('#plugin-configuration form').serializeArray();
					for(var i=0;i<inputs.length;i++)
						conf[inputs[i].name] = inputs[i].value;
					var conf_json = JSON.stringify(conf);
					
					evqueueAPI({
						group: 'notification_type',
						action: 'set_conf',
						attributes: { 'id':id, content: b64EncodeUnicode(conf_json) }
					}).done(function() {
						Message('Configuration saved');
						$('#plugin-configuration').dialog('close');
					});
				});
				
				$('#plugin-configuration').dialog({title:'Plugin configuration',width:'auto',height:'auto'});
			});
		});
		
		$('.fa-remove').click(function() {
			evqueueAPI({
				confirm: 'You are about to delete the selected plugin',
				group: 'notification_type',
				action: 'unregister',
				attributes: { 'id': $(this).parents('tr').data('id') }
			}).done(function() {
				Message('Plugin has been deleted');
				RefreshPage();
			});
		});
	});
}