
$(document).delegate( '.relaunch', 'click', function() {
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
$(document).delegate('select#launchWF', 'change', function () {
	launchWF($(this).val());
});

$(document).delegate('select#launchWF option', 'click', function () {
	if($(this).val() == $(this).closest("select").val())
		launchWF($(this).val());
});

$(document).delegate('#searchByWorkflow #searchByWorkflowSelect', 'change', function(){
	window.location.href = 'index.php?wf_name='+$(this).val();
});

$(document).delegate('form[id*=launchForm_]', 'submit', function(event) {
	event.preventDefault();
	$(this).parents('[id*=launch_]').dialog('close');  // close the dialog box so that the user does not click twice on submit
	
	var wfparams = {};
	$(this).find('.paramsTab :input').not('').each( function (i,input) {
		wfparams[$(input).attr('name')] = $(input).val();
	});
	
	var attr = {
		name: $(this).find('input[name=id]').val(),
		user: $(this).find('.hostTab input[name=user]').val(),
		host: $(this).find('.hostTab input[name=host]').val()
	};
	
	evqueueAPI({
		group: 'instance',
		action: 'launch',
		attributes: attr,
		parameters: wfparams,
		node: $(this).find('.nodeTab select').val()
	}).done(function () {
		refreshWorkflows('executing');
	})
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

function refreshWorkflows (status,callback) {
	$.get('ajax/'+status.toLowerCase()+'-workflows.php', get, function (content) {
		$('div#'+status.toUpperCase()+'-workflows').replaceWith(content);
		if (callback) callback();
	});
}

function refreshWorkflowHTML (id,node_name,container,callback) {
	
	// don't refresh workflow if user has opened extra infos
	var extraInfos = container.find('div.taskOutput, ul.inputs').filter(':visible');
	if ( extraInfos.length > 0 ) {
		if (callback) callback();
		return;
	}
	
	$.ajax({
		url: 'ajax/workflow.php',
		data: {
			id: id,
			node: node_name
		},
		success: function (content) {
			container.html(content);
			if (callback) callback();
		}
	});
}

function launchWF(name){
	$("#launch_"+name).dialog({ 
		minHeight: 300, 
		minWidth: 650, 
		modal: true, 
		title: "Launch workflow "+name
	});
	$('div.makeMeTabz:visible').tabs().removeClass('makeMeTabz');
}

/**** TASK OUTPUT POPINS ****/
$(document).delegate('.taskName', 'click', function () {
	$(this).next('.taskDetails').find('.js-execs li:last').click();
});

$(document).delegate('.js-execs li', 'click', function () {
	
	var d = $(this).data('dialog-id')
	if (d) {
		console.log('existing dialog '+d);
		$('#'+d).dialog('open');
		return;
	}
	
	var dialog = $(this).parents('.taskDetails').clone().attr('id','').dialogTiled({width: 660,height: 500});
	$(this).data('dialog-id', dialog.attr('id'));
	
	console.log('new dialog '+$(this).data('dialog-id'));
	
	dialog.find('.tabs').tabs();
	
	var outputData = dialog.children('.outputData');
	var pos = $(this).index();
	
	// if this not the first dialog we open for this task, remove the 'previous executions' tab
	if (!$(this).is(':last-child')) {
		dialog.find('a[href="#tab-taskPrevExecs"], #tab-taskPrevExecs').remove();
	}
	
	dialog.find('#tab-taskStdout .output').hide().eq(pos).show();
	dialog.find('#tab-taskStderr .stderr').hide().eq(pos).show();
	dialog.find('#tab-taskLog    .log'   ).hide().eq(pos).show();
	
	dialog.find('a[href="#tab-taskStdout"]').click();
});