


$(document).ready( function() {
	
	$(document).delegate( 'img.relaunch', 'click', function() {
		var id = $(this).data("wfiid");
		var node_name = $(this).data("node-name");
		
		$("#relaunch_"+id).dialog({
			minHeight: 300, 
			minWidth: 650, 
			modal: true, 
			title: "Relaunch workflow"
		});
		$('div.makeMeTabz:visible').tabs().removeClass('makeMeTabz');
	});
	
	// LAUNCH WORKFLOW
	$('select#launchWF').change( function () {
		var name = $(this).val();
		$("#launch_"+name).dialog({ 
			minHeight: 300, 
			minWidth: 650, 
			modal: true, 
			title: "Launch workflow "+name
		});
		$('div.makeMeTabz:visible').tabs().removeClass('makeMeTabz');
	});
	
	$('#searchByWorkflow #searchByWorkflowSelect').change(function(){
		window.location.href = 'index.php?wf_name='+$(this).val();
	});
	
	$(document).delegate('form[id*=launchForm_]', 'submit', function(event) {
		event.preventDefault();
		$(this).parents('[id^=relaunch_]').dialog('close');  // close the dialog box so that the user does not click twice on submit
		
		var wfparams = {};
		$(this).find('.paramsTab :input').not('').each( function (i,input) {
			wfparams[$(input).attr('name')] = $(input).val();
		});
		
		var params = {
			form_id: 'launchWorkflow',
			id: $(this).find('input[name=id]').val(),
			node: $(this).find('.nodeTab select').val(),
			user: $(this).find('.hostTab input[name=user]').val(),
			host: $(this).find('.hostTab input[name=host]').val(),
			wfparams: wfparams
		};
		
		wsfwd({
			params: params,
			success: function () { window.location.reload(); }
		});
	});
	
	$(document).delegate( 'img.deleteWFI', 'click', function() {
		var id = $(this).data("wfiid");
		if (confirm("Delete the workflow instance n°"+id+"?")){
			deleteWfi(id);
		}
	});
	
	$(document).delegate( 'img.stopWFI', 'click', function() {
		var id = $(this).data("wfiid");
		var node_name = $(this).data("node-name");
		if (confirm("Stop the workflow instance n°"+id+"?")){
			stopWfi(id,node_name);
		}
	});
	
});

$(document).ready( function () {
	get.p = typeof(get.p) != 'undefined' ? get.p : 1;
});

$(document).delegate('img.refreshWorkflows, span.prevPage, span.nextPage', 'click', function () {
	var status = $(this).data('status');
	
	if ($(this).hasClass('prevPage'))
		get.p -= 1;
	if ($(this).hasClass('nextPage'))
		get.p += 1;
	
	refreshWorkflows(status);
});

function refreshWorkflows (status) {
	$.get('ajax/'+status.toLowerCase()+'-workflows.php',get,function (content) {
		$('div#'+status+'-workflows').replaceWith(content);
	});
}


function deleteWfi(id){
	ajaxDelete('deleteWFI', id, '');
}

function stopWfi(id,node_name){
	ajaxDelete('stopWFI', id, '', {node_name: node_name});
}