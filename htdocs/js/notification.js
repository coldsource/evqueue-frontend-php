$(document).ready( function() {
	RefreshPage();
});

function RefreshPage()
{
	Wait();
	
	$.ajax({url: "ajax/list-notifications.php"}).done(function(data) {
		$('#list-notifications').html(data);
		
		Ready();
		
		$('.fa-file-o').click(function() {
			$('#notification-type-chooser').dialog({title:'Choose notification type',width:'auto',height:'auto'});
		});
		
		$('#notification-type-chooser .submit').click(function() {
			$('#notification-type-chooser').dialog('close');
			
			var type_id = $('#notification-type-chooser select[name=notification-type]').val();
			
			
			$.ajax({url: "ajax/notification-configuration.php?id="+type_id+"&type=notification"}).done(function(data) {
				$('#notification-configuration').html(data);
				
				$('#notification-configuration .submit').click(function() {
					var conf = {};
					var inputs = $('#notification-configuration form').serializeArray();
					for(var i=0;i<inputs.length;i++)
						conf[inputs[i].name] = inputs[i].value;
					var conf_json = JSON.stringify(conf);
					
					evqueueAPI({
						group: 'notification',
						action: 'create',
						attributes: { name: conf.name, type_id: type_id, parameters: btoa(conf_json) }
					}).done(function() {
						Message('Notification created');
						$('#notification-configuration').dialog('close');
						RefreshPage();
					});
				});
				
				$('#notification-configuration').dialog({title:'Notification configuration',width:'auto',height:'auto'});
			});
			
		});
		
		$('.fa-cogs').click(function() {
			var id = $(this).parents('tr').data('id');
			var type_id = $(this).parents('tr').data('type-id');
			
			$.ajax({url: "ajax/notification-configuration.php?id="+type_id+"&type=notification"}).done(function(data) {
				$('#notification-configuration').html(data);
				
				evqueueAPI({
					group: 'notification',
					action: 'get',
					attributes: { 'id':id }
				}).done(function(xml) {
					var conf = jQuery.parseJSON(atob(xml.documentElement.firstChild.getAttribute('parameters')));
					for(var i in conf)
						$('#notification-configuration form *[name='+i+']').val(conf[i]);
				});
				
				$('#notification-configuration .submit').click(function() {
					var conf = {};
					var inputs = $('#notification-configuration form').serializeArray();
					for(var i=0;i<inputs.length;i++)
						conf[inputs[i].name] = inputs[i].value;
					var conf_json = JSON.stringify(conf);
					
					evqueueAPI({
						group: 'notification',
						action: 'edit',
						attributes: { 'id':id, name: conf.name, parameters: btoa(conf_json) }
					}).done(function() {
						Message('Configuration saved');
						$('#notification-configuration').dialog('close');
						RefreshPage();
					});
				});
				
				$('#notification-configuration').dialog({title:'Notification configuration',width:'auto',height:'auto'});
			});
		});
		
		$('.fa-remove').click(function() {
			evqueueAPI({
				confirm: 'You are about to delete the selected notification',
				group: 'notification',
				action: 'delete',
				attributes: { 'id': $(this).parents('tr').data('id') }
			}).done(function() {
				Message('Notification has been deleted');
				RefreshPage();
			});
		});
	});
}