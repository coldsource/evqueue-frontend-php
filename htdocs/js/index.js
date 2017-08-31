$(document).ready(function() {
	$('#executing-workflows-pannel .fa-rocket').click(function() {
		$('#workflow-launch').dialog({width:'auto',height:'auto'});
	});
	
	$('#executing-workflows-pannel .fa-clock-o').click(function() {
		evqueueAPI({
			confirm: 'The retry counter of each task in error will be decremented. Continue ?',
			group: 'control',
			action: 'retry',
			attributes: {}
		}).done(function(xml) {
			Message("Retrying all tasks");
		});
	});
	
	$('#workflow-launch select[name=workflow_id').change(function(event,schedule_xml) {
		$('#which_workflow form .parameter').remove();
		
		if($(this).val()=='')
			return;
		
		evqueueAPI({
			group: 'workflow',
			action: 'get',
			attributes: {id: $(this).val()}
		}).done(function(xml) {
			$(xml).find('parameter').each(function() {
				$('#which_workflow form').append('<div class="parameter"><label>'+$(this).attr('name')+'</label><input name="parameter_'+$(this).attr('name')+'"></input></div>');
			});
			
			$(schedule_xml).find('parameter').each(function() {
				$('#which_workflow form input[name=parameter_'+$(this).attr('name')+']').val($(this).attr('value'));
			});
		});
	});
	
	$('#workflow-launch .submit').click(function() {
		var workflow_id = $('#workflow-launch select[name=workflow_id').val();
		var workflow_parameters = {};
		$('#which_workflow form .parameter input').each(function() {
			console.log($(this).val());
			workflow_parameters[$(this).attr('name').substr(10)] = $(this).val();
		});
		
		evqueueAPI({
			group: 'workflow',
			action: 'get',
			attributes: {id: workflow_id}
		}).done(function(xml) {
			var workflow_name = xml.documentElement.firstChild.getAttribute('name');
			
			evqueueAPI({
				group: 'instance',
				action: 'launch',
				attributes: {name:workflow_name},
				parameters: workflow_parameters
			}).done(function(xml) {
				var instance_id = xml.documentElement.getAttribute('workflow-instance-id');
				$('#workflow-launch').dialog('close');
				Message('Launched instance '+instance_id);
			});
		});
	});
});

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
	$(this).parent('span.taskState').workflow-nextAll('div.taskOutput').toggleClass('hidden');
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
