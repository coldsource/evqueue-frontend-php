

function get_parameters() {
	var query_string = {};
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		// If first entry with this name
		if (typeof query_string[pair[0]] === "undefined") {
			query_string[pair[0]] = pair[1];
			// If second entry with this name
		} else if (typeof query_string[pair[0]] === "string") {
			var arr = [query_string[pair[0]], pair[1]];
			query_string[pair[0]] = arr;
			// If third or later entry with this name
		} else {
			query_string[pair[0]].push(pair[1]);
		}
	}
	return query_string;
}


$(document).ready(function() {
	refreshWorkflows("terminated");
	refreshWorkflows("executing");
	
	$("#dt_inf, #dt_sup").datepicker({dateFormat : "yy-mm-dd", maxDate: new Date(), showAnim: 'slideDown'});
	$("#hr_inf, #hr_sup").timepicker();
	
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

			$("#searchWithinWorkflowParams").removeClass('hideMe');
		}
		else {
			$("#searchWithinWorkflowParams").addClass('hideMe');
		}
	});
	
	if($('#searchform option:selected').val())
		$('#searchByWorkflowSelect').change();
	
	if($('#searchform input[name=searchParams]').val())
	{
		search_parameters = JSON.parse($('#searchform input[name=searchParams]').val());
		for(var i=0;i<search_parameters.length;i++)
			$('#searchform input[name='+search_parameters[i]['name']+']').val(search_parameters[i]['value']);
	}
	
	$(document).delegate('#searchform', 'submit', function() {
		// gather params to search in one json-encoded string to be submitted as a GET param
		$('#searchWithinWorkflowParams input.parameter').filter("[value='']").remove()
		var params = $('#searchWithinWorkflowParams input.parameter');
		var searchParams = JSON.stringify(params.serializeArray());
		$('#searchform input[name=searchParams]').val(searchParams);
		params.remove();
	});
	
	// Manage autorefresh
	var interval = 2000;
	setTimeout(autoRefresh,interval);
	
	function autoRefresh() {
		autoRefreshStatuses(['executing','terminated'], function () {
			var wfs = $('div#EXECUTING-workflows div.workflow');
			autoRefreshOpenWFs(wfs, function () {
				setTimeout(autoRefresh,interval);
			});
		});
	}
	
	function autoRefreshStatuses (statuses,callback) {
		if (statuses.length === 0) {
			if (callback) callback();
			return;
		}
		
		var status = statuses.shift();
		var chkbx = $('div#'+status.toUpperCase()+'-workflows input.autorefresh');
		var doRefresh =
			chkbx.length === 0 ||  // workflows for this status are not displayed (there aren't any)
			chkbx.is(':checked');
		
		if (!doRefresh) {
			autoRefreshStatuses(statuses,callback);
		} else {
			refreshWorkflows(status, function () {
				autoRefreshStatuses(statuses,callback);
			});
		}
	}
	
	function autoRefreshOpenWFs (wfs,callback) {
		if (wfs.length === 0) {
			if (callback) callback();
			return;
		}
		
		var wf = wfs.eq(0);
		refreshWorkflowHTML(wf.data('id'), wf.data('node-name'), wf.parent('td.details'), function () {
			autoRefreshOpenWFs(wfs.slice(1),callback);
		});
	}
	
	$(document).delegate( 'span.action', 'click', function() {
		var img = $(this).children('img');
		var src = (img.attr('src') === 'images/plus.png') ? 'images/minus.png' : 'images/plus.png';
		img.attr('src',src);
		
		var nextTr = $(this).parents('tr').next('tr');
		var nextTrTd = nextTr.children('td.details');
		
		if (nextTrTd.children('div.workflow').length > 0) {
			nextTr.toggle('fast');
			return;
		}
		
		$(this).parents('div.workflow-list').find('input.autorefresh').attr('checked', false);
		
		refreshWorkflowHTML($(this).data('id'),$(this).data('node-name'),nextTrTd);
		nextTr.toggle('fast');
	});
	
	$(document).delegate( 'img.exclamationdetails', 'click', function() {
		$(this).parent('span.taskState').nextAll('div.taskOutput').toggleClass('hidden');
	});
	
	$(document).delegate( 'img.terminatedico', 'click', function() {
		$(this).parent('span.taskState').nextAll('div.taskOutput').toggleClass('hidden');
	});
	
	$(document).delegate( 'img.formattedXml', 'click', function () {
		$(this).nextAll('div.xml').children('div.okxml').toggleClass('hidden');
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
	
	$('select[name=selected_workflow]').change( function() {
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
	
	
	$('#actionTools img').click( function () {
		var divToToggle = $('div#'+$(this).data('div-id'));
		$('div.actionToolsDivs').not(divToToggle).hide('fast');
		divToToggle.toggle('fast')
	});
});