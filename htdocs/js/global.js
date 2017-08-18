$(document).ready( function() {
	var menu_selected=$('ul.topmenu li.selected').attr('id');
	$('ul.topmenu li').mouseenter(function(event) {
			$('ul.submenu').hide();
			$('ul.submenu#submenu-'+event.target.id).show();
		}
	);
});



function evqueueAPI(element, group, action, attributes = [], parameters = [], cbk = false){
	if ($(element).attr('data-confirm')) {
		if(!confirm($(element).data('confirm')))
			return;
	}
	
	$.ajax({
		data:{'group':group, 'action':action, 'parameters':parameters, 'attributes':attributes},
		type: 'post',
		url: 'ajax/evqueue_api.php',
		content:'xml',
	}).done(function(xml){
		error = $(xml).find('error');
		if ($(error).length > 0) {
			alert(error.html());
		}
		
		if(cbk)
			cbk(xml);
	});
}

function commit(element, name, group = 'workflow', force = 'no', id='-1'){
	$("input[name='commit-name']").val(name);
	$("input[name='commit-force']").val(force);
	$("input[name='commit-id']").val(id);
	$("#dialog-commit").dialog();
}

function retryAllTasks(){
	$.ajax({
		url: 'ajax/retry.php'
	}).done(function(xml){

	});
}
