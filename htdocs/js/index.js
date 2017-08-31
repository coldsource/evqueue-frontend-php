$(document).delegate('.showWorkflowDetails','click',function() {
	var wfid = $(this).data('id');
	var node = $(this).data('node-name');
	var status = $(this).data('status');
	
	var container = $('<div>');
	container.attr('data-url',"ajax/instance.php?id="+wfid+"&node="+node);
	container.attr('data-interval',status=='TERMINATED'?0:5);
	container.addClass('evq-autorefresh');
	$('#workflow-dialogs').append(container);
	
	var dialog = $('#workflow-dialog').clone();
	dialog.find('ul').append('<li><a href="#workflow-'+wfid+'">Tree</a></li>')
	dialog.find('ul').append('<li><a href="#workflow-'+wfid+'-xml">XML</a></li>')
	dialog.find('ul').append('<li><a href="#workflow-'+wfid+'-parameters">Parameters</a></li>')
	
	
	dialog.append('<div class="evq-autorefresh-pannel" id="workflow-'+wfid+'"></div>');
	dialog.append('<div class="evq-autorefresh-pannel" id="workflow-'+wfid+'-xml"></div>');
	dialog.append('<div class="evq-autorefresh-pannel" id="workflow-'+wfid+'-parameters"></div>');
	dialog.tabs();
	dialog.dialog({
		width:'auto',
		height:'auto',
		appendTo:container,
		title:'Instance '+wfid,
		close:function() { container.evqautorefresh('disable'); container.remove(); }
	});
	
	container.evqautorefresh();
	
	dialog.delegate('.taskName','click',function() {
		TaskDialog(container,wfid,$(this).parent().data('evqid'),$(this).parent().data('name'),1);
	});
});

function TaskDialog(container,wfid,evqid,name,idx)
{
	var dialog = $('#task-dialog').clone();
	dialog.find('ul').append('<li><a href="#'+wfid+'-'+evqid+'-general">General</a></li>')
	dialog.find('ul').append('<li><a href="#'+wfid+'-'+evqid+'-stdout-'+idx+'">stdout</a></li>')
	dialog.find('ul').append('<li><a href="#'+wfid+'-'+evqid+'-stderr-'+idx+'">stderr</a></li>')
	dialog.find('ul').append('<li><a href="#'+wfid+'-'+evqid+'-log-'+idx+'">log</a></li>')
	if(idx==1)
		dialog.find('ul').append('<li><a href="#'+wfid+'-'+evqid+'-executions">Previous executions</a></li>')
	
	dialog.append('<div class="evq-autorefresh-pannel" id="'+wfid+'-'+evqid+'-general"></div>')
	dialog.append('<div class="evq-autorefresh-pannel" id="'+wfid+'-'+evqid+'-stdout-'+idx+'"</div>')
	dialog.append('<div class="evq-autorefresh-pannel" id="'+wfid+'-'+evqid+'-stderr-'+idx+'"</div>')
	dialog.append('<div class="evq-autorefresh-pannel" id="'+wfid+'-'+evqid+'-log-'+idx+'"</div>')
	if(idx==1)
		dialog.append('<div class="evq-autorefresh-pannel" id="'+wfid+'-'+evqid+'-executions"</div>')
	dialog.tabs();
	dialog.dialog({
		width:600,
		title:'Task '+name,
		appendTo:container,
		close:function() { $(this).dialog('destroy'); }
	});
	
	container.evqautorefresh('refresh');
	
	dialog.delegate('.task_execution','click',function() {
		TaskDialog(container,wfid,evqid,$(this).index()+1);
	});
}





/*$(document).ready(function() {
	refreshWorkflows("terminated");
	refreshWorkflows("executing");

	$("#dt_inf, #dt_sup").datepicker({dateFormat : "yy-mm-dd", maxDate: new Date(), showAnim: 'slideDown'});
	
	if($('#searchform #searchByWorkflowSelect option:selected').val())
		$('#searchByWorkflowSelect').change();

	if($('#searchform input[name=searchParams]').val())
	{
		search_parameters = JSON.parse($('#searchform input[name=searchParams]').val());
		for(var i=0;i<search_parameters.length;i++)
			$('#searchform input[name='+search_parameters[i]['name']+']').val(search_parameters[i]['value']);
	}
});

$(document).delegate('#searchByWorkflowSelect', 'change', function() {
	if ($(this).val() != '') {
		$("#searchWithinWorkflowParams").html('');

		var nbParams = 0;
		if($(this).val() in workflows)
			nbParams = workflows[$(this).val()].length;

		if (nbParams > 0) {
			var parameter_input = $('#searchWithinWorkflowParamsInput').html();
			for(var i=0;i<nbParams;i++)
			{
				var html = parameter_input;
				console.log(html);
				html = html.split('#PARAMETER_LABEL#').join(workflows[$(this).val()][i]);
				html = html.split('#PARAMETER_NAME#').join(workflows[$(this).val()][i]);

				$('#searchWithinWorkflowParams').append(html);
			}
		}

		$("#searchWithinWorkflowParams").removeClass('hidden');
	}
	else {
		$("#searchWithinWorkflowParams").addClass('hidden');
	}
});

$(document).delegate('#searchform', 'submit', function() {
	// gather params to search in one json-encoded string to be submitted as a GET param
	$('#searchWithinWorkflowParams input.parameter').filter("[value='']").remove()
	var params = $('#searchWithinWorkflowParams input.parameter');
	var searchParams = JSON.stringify(params.serializeArray());
	$('#searchform input[name=searchParams]').val(searchParams);
	params.remove();
});

$(document).delegate( 'img.exclamationdetails', 'click', function() {
	$(this).parent('span.taskState').nextAll('div.taskOutput').toggleClass('hidden');
});

$(document).delegate( 'img.terminatedico', 'click', function() {
	$(this).parent('span.taskState').nextAll('div.taskOutput').toggleClass('hidden');
});

$(document).delegate( 'span.tasktitle', 'click', function() {
	$(this).nextAll('div.taskOutput').toggleClass('hidden');
});

$(document).delegate( 'img.showmemore', 'click', function() {
	toggleJob($(this));
});

function toggleJob(image) {
	var src = (image.attr('src') === 'images/plus.png')
		? 'images/minus.png'
		: 'images/plus.png';
		image.attr('src', src);

	image.parents('div.job:eq(0)').children('div.job').toggleClass('hidden');
}

$(document).delegate('select[name=selected_workflow]', 'change', function() {
	var wf_name = $(this).attr('value');
	if (wf_name == 'new') {
		$('input[name=edit_workflow_name]').attr('value','');
		$('input[name=edit_workflow_name]').attr('disabled',false);
	} else {
		$('input[name=edit_workflow_name]').attr('value',wf_name);
		$('input[name=edit_workflow_name]').attr('disabled',true);
	}

	var xml = $('p[for='+$(this).attr('value')+']').html();
	if ($(this).attr('value') != '') {
		$('textarea[name=workflow_xml]').html(xml).show();
		$(this).parents('form').find('input[type=submit]').attr('disabled',false);
	}
	else {
		$('textarea[name=workflow_xml]').html('').hide();
		$(this).parents('form').find('input[type=submit]').attr('disabled',true);
	}
});


$(document).delegate( 'img.showskippeddetails', 'click', function() {
	$(this).nextAll('div.skippedcause').toggleClass('hidden');
});


$(document).delegate('#actionTools img', 'click', function () {
	var divToToggle = $('div#'+$(this).data('div-id'));
	$('div.actionToolsDivs').not(divToToggle).hide('fast');
	divToToggle.toggle('fast')
});*/
