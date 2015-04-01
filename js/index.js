

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
	$("#dt_inf, #dt_sup").datepicker({dateFormat : "yy-mm-dd", maxDate: new Date(), showAnim: 'slideDown'});
	$("#hr_inf, #hr_sup").timepicker();
	
	$(document).delegate('#searchWithinWorkflowSelect', 'change', function() {
		if ($(this).val() != '') {
			$("#searchWithinWorkflowParams").html('');
			var nbParams = workflows[$(this).val()].length;
			if (nbParams > 0) {
				var html = '<div class="modalTitle">'+$(this).val() + '</div>';
				html += '<form id="searchParams" action="index.php" method="get">';
				html += '<input type="hidden" name="wf_name" value="'+$(this).val()+'" />';
				html += '<input type="hidden" name="searchParams" />';
				html += '<table>';
				for (var i=0; i<nbParams; i++){
					html += (i%2 == 0)? '<tr class="evenTr">': '<tr class="oddTr">';
					html += '<td>'+workflows[$(this).val()][i]+'</td>';
					html += '<td><input type="text" name="'+workflows[$(this).val()][i]+'" value="" /></td>';
					html += '</tr>';
				}
				html += '</table>';
				html += '<input id="searchSubmit2" class="righty searchSubmit2" type="submit" value="Search" />';
				html += '</form>';
				$("#searchWithinWorkflowParams").append(html);
				$("#searchWithinWorkflowParams").dialog({ 
					minHeight: 300, 
					minWidth: 650, 
					modal: true, 
					title: "Search within workflow",
					close: function() {
						$("#searchWithinWorkflowSelect").val("option:first");
					}
				});
			}

			$("#searchWithinWorkflowParams").removeClass('hideMe');
		}
		else {
			$("#searchWithinWorkflowParams").addClass('hideMe');
		}
	});
	
	$(document).delegate('#searchParams', 'submit', function() {
		// gather params to search in one json-encoded string to be submitted as a GET param
		$('#searchWithinWorkflowParams input[type!=hidden][type!=submit]').filter("[value='']").remove()
		var params = $('#searchWithinWorkflowParams input[type!=hidden][type!=submit]');
		var searchParams = JSON.stringify(params.serializeArray());
		$('#searchWithinWorkflowParams input[name=searchParams]').val(searchParams);
		params.remove();
	});
	
	// Manage autorefresh
	function autoRefresh() {
		$('input.autorefresh:checked').each(function() {
			$(this).parent().find('img.refreshWorkflows').click();
		});
		
		if ( $('div#EXECUTING-workflows input.autorefresh').length == 0 )  // executing workflows list is not displayed (no executing workflows, or evqueue not running)
			refreshWorkflows('EXECUTING');
	}
	setInterval(autoRefresh,2000 );
	
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
		
		$.ajax({
			url: 'ajax/workflow.php',
			data: {id: $(this).data('id')},
			beforeSend: function () {
				nextTrTd.html('').append('<img src="images/ajax-loader.gif" /> Loading');
			},
			success: function (content) {
				nextTrTd.html(content);
			}
		});
		
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
		toggleJob($(this).parents('div.job:eq(0)').find('img.showmemore:eq(0)'));
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


function killTask (workflow_instance_id, task_pid) {
	if (confirm('Do you really want to immediately stop the execution of this task?'))
		wsfwd({
			params: {
				form_id: 'killTask',
				id: workflow_instance_id,
				task_pid: task_pid
			},
			success: function () {
				$('img.refreshWorkflows').click();
			}
		});
}


function retryAllTasks () {
	if (confirm('Do you really want to retry all tasks? This can lead to tasks stopping in error sooner than expected, since their retry "counter" gets decremented.'))
		$.ajax({
			type: 'post',
			url: 'ajax/retry.php',
		});
}