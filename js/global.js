$(document).ready( function() {
	var menu_selected=$('ul.topmenu li.selected').attr('id');
	$('ul.topmenu li').mouseenter(function(event) {
			$('ul.submenu').hide();
			$('ul.submenu#submenu-'+event.target.id).show();
		}
	);
});



function evqueueAPI(element, group, action, attributes = [], parameters = [], node = ""){
	if ($(element).attr('data-confirm')) {
		confirm($(element).data('confirm'));
	}
	$.ajax({
		data:{'group':group, 'action':action, 'parameters':parameters, 'attributes':attributes, 'node':node},
		type: 'post',
		url: 'ajax/evqueue_api.php',
		content:'xml',
		async:false,
	}).done(function(xml){
		error = $(xml).find('error');
		if ($(error).length > 0) {
			alert(error.html());
		}
	});
}

function commit(element, name, force = 'no'){
	var log = window.prompt('Commit log :');
	evqueueAPI(element, 'git', 'save_workflow', { 'name':name, 'commit_log':log, 'force':force });
	location.reload();
}