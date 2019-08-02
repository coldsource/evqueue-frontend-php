 /*
  * This file is part of evQueue
  *
  * evQueue is free software: you can redistribute it and/or modify
  * it under the terms of the GNU General Public License as published by
  * the Free Software Foundation, either version 3 of the License, or
  * (at your option) any later version.
  *
  * evQueue is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  * GNU General Public License for more details.
  *
  * You should have received a copy of the GNU General Public License
  * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
  *
  * Author: Thibault Kummer
  */

var search_filters = { status:'terminated' };
var parameters = {};
var current_page = 1;

$(document).ready(function() {
	// Launch button
	$('#executing-workflows-pannel .fa-rocket').click(function() {
		$('#workflow-launch input[name=comment]').val('Launched by user "'+connected_user+'"');
		$('#workflow-launch').dialog({width:'auto',height:'auto'});
	});

	// Read url parameters
	if(document.location.search!='')
	{
		s = document.location.search.substr(1).split('&');
		for(var kId = 0; kId < s.length; kId++){
			var tmp = s[kId].split('=');
			search_filters[tmp[0]] = tmp.length > 1 ? unescape(tmp[1]) : '';
		}
		
		UpdateFilters();
	}
	
	$('.evq-autorefresh-filter').evqautorefresh();

	// Relaunch button
	$(document).delegate('.ui-dialog-title .fa-rocket','click',function() {
		var instance_id = $(this).data('id');
		var node = $(this).data('node');

		evqueueAPI({
			group: 'instance',
			action: 'query',
			attributes: { id: instance_id },
			node: node
		}).done( function(xml) {
			var workflow_node = xml.documentElement.firstChild;
			var workflow_name = workflow_node.getAttribute('name');
			var parameters = xml.Query("parameters/parameter",workflow_node);

			var workflow_id = $('#workflow-launch select[name=workflow_id] option').filter(function () { return $(this).html() == workflow_name; }).val();

			$('#workflow-launch input[name=comment]').val('Relaunched from instance '+instance_id+' by user "'+connected_user+'"');
			$('#workflow-launch input[name=user]').val(workflow_node.getAttribute('user'));
			$('#workflow-launch input[name=host]').val(workflow_node.getAttribute('host'));
			$('#workflow-launch select[name=node]').val(node);

			$('#workflow-launch select[name=workflow_id]').val(workflow_id).trigger('change.select2');
			SetWorkflowParameters($('#workflow-launch select[name=workflow_id]')).done(function() {
				for(var i=0;i<parameters.length;i++)
					$('#workflow-launch input[name=parameter_'+parameters[i].getAttribute('name')+']').val(parameters[i].textContent);
			});
		});
		$('#workflow-launch').dialog({width:'auto',height:'auto'});
	});

	// Alarm clock
	$('#executing-workflows-pannel .fa-clock-o').click(function() {
		evqueueAPI({
			confirm: 'The retry counter of each task in error will be decremented. Continue ?',
			group: 'control',
			action: 'retry',
			node: '*'
		}).done(function(xml) {
			Message("Retrying all tasks");
		});
	});

	// Graph
	$('#executing-workflows-pannel').delegate('.fa-info','mouseover', function(e) {
		DrawGraph($('#workflow-stats-graph div.chart'),[
			{prct:$(this).parents('tr').data('running_tasks')-$(this).parents('tr').data('queued_tasks'),label:'Executing tasks',color:'#b6ffb2'},
			{prct:$(this).parents('tr').data('retrying_tasks'),label:'Retrying tasks',color:'#ffb651'},
			{prct:$(this).parents('tr').data('queued_tasks'),label:'Queued tasks',color:'#b5d4f2'},
			{prct:$(this).parents('tr').data('error_tasks'),label:'Error tasks',color:'red'},
			{prct:$(this).parents('tr').data('waiting_conditions'),label:'Waiting tasks',color:'#f2f4f7'}
		]);

		$('#workflow-stats-graph').css('position','fixed');
		$('#workflow-stats-graph').css('top',e.pageY+10);
		$('#workflow-stats-graph').css('left',e.pageX+10);
		$('#workflow-stats-graph').show();
	});

	$('#executing-workflows-pannel').delegate('td','mouseout', function() {
		$('#workflow-stats-graph').hide();
	});


	// Remove instance
	$(document).delegate('#terminated-workflows-pannel .fa-remove','click',function() {
		var instance_id = $(this).parents('tr').data('id');
		evqueueAPI({
			confirm: 'You are about to delete instance '+instance_id,
			group: 'instance',
			action: 'delete',
			attributes: { 'id':instance_id }
		}).done( function () {
			$('#terminated-workflows-pannel').evqautorefresh('refresh');
			Message('Instance '+instance_id+' removed');
		});
	});

	// Cancell instance
	$(document).delegate('#executing-workflows-pannel .fa-ban','click',function() {
		if(!confirm("You are about to cancel this instance.\n\nRunning tasks will continue to run normally but no new task will be launched.\n\nRetry schedules will be disabled."))
			return;

		CancelInstance($(this).parents('tr').data('id'),$(this).parents('tr').data('node'),false);
	});

	// Kill instance
	$(document).delegate('#executing-workflows-pannel .fa-bomb','click',function() {
		if(!confirm("You are about to kill this instance.\n\nRunning tasks will be killed with SIGKILL and workflow will end immediately.\n\nThis can lead to inconsistancies in running tasks."))
			return;

		CancelInstance($(this).parents('tr').data('id'),$(this).parents('tr').data('node'),true);
	});

	// Launch box : workflow change handler
	$('#workflow-launch select[name=workflow_id').change(function(event,schedule_xml) {
		SetWorkflowParameters($(this));
	});

	// Launch a new instance
	$('#workflow-launch .submit').click(function() {
		var workflow_id = $('#workflow-launch select[name=workflow_id').val();
		var workflow_comment = $('#workflow-launch input[name=comment').val();
		var workflow_parameters = {};
		$('#which_workflow form .parameter input').each(function() {
			workflow_parameters[$(this).attr('name').substr(10)] = $(this).val();
		});

		evqueueAPI({
			group: 'workflow',
			action: 'get',
			attributes: {id: workflow_id}
		}).done(function(xml) {
			var workflow_name = xml.documentElement.firstChild.getAttribute('name');
			var attributes = {name:workflow_name,comment:workflow_comment};
			if($('#workflow-launch input[name=host]').val())
			{
				attributes.host = $('#workflow-launch input[name=host]').val();
				if($('#workflow-launch input[name=user]').val())
					attributes.user = $('#workflow-launch input[name=user]').val();
			}

			evqueueAPI({
				group: 'instance',
				action: 'launch',
				attributes: attributes,
				parameters: workflow_parameters,
				node: $('#workflow-launch select[name=node]').val()
			}).done(function(xml) {
				var instance_id = xml.documentElement.getAttribute('workflow-instance-id');
				$('#workflow-launch').dialog('close');
				Message('Launched instance '+instance_id);
			});
		});
	});

	// Search form
	$('#searchform select[name=node]').change(function() {
		if($(this).val())
			search_filters.filter_node = $(this).val();
		else
			delete search_filters.filter_node;

		UpdateFilters();
	});

	$('#searchform select[name=wf_name]').change(function() {
		$('#searchform .parameter').remove();

		if($(this).val()=='')
			delete search_filters.filter_workflow;
		else
		{
			var wfname = $(this).find("option:selected").text();
			var wfid = $(this).val();

			search_filters.filter_workflow = wfname;

			evqueueAPI({
				group: 'workflow',
				action: 'get',
				attributes: {id: $(this).val()}
			}).done(function(xml) {
				$(xml).find('parameter').each(function() {
					$('<div class="parameter"><label>'+$(this).attr('name')+'</label><input name="parameter_'+$(this).attr('name')+'"></input></div>').insertAfter('#searchworkflow');
				});
			});
		}

		UpdateFilters();
	});
	
	$('#searchform select[name=tagged]').change(function() {
		$('#searchform .parameter').remove();

		if($(this).val()=='')
			delete search_filters.filter_tag_id;
		else
			search_filters.filter_tag_id = $(this).val();

		UpdateFilters();
	});

	$('#searchform').delegate('.parameter','change',function() {
		UpdateFilters();
	});

	$('#dt_inf,#hr_inf').on('change autocompletechange',function(event,data) {
		if($('#dt_inf').val())
		{
			// "workflows around a given time" and "workflows launched before/after" are incompatible, empty the other fields
			$('#dt_at,#hr_at').val('').trigger('change',{update_filters: false});
			
			// default to midnight if no time is given
			if (!$('#hr_inf').val())
				$('#hr_inf').val('00:00');
			
			search_filters.filter_launched_from = $('#dt_inf').val()+' '+$('#hr_inf').val();
		}
		else
			delete search_filters.filter_launched_from;
		
		if (!data || data.update_filters)
			UpdateFilters();
	});

	$('#dt_sup,#hr_sup').on('change autocompletechange',function(event,data) {
		if($('#dt_sup').val())
		{
			// "workflows around a given time" and "workflows launched before/after" are incompatible, empty the other fields
			$('#dt_at,#hr_at').val('').trigger('change',{update_filters: false});
			
			// default to just-before-midnight if no time is given
			if (!$('#hr_sup').val())
				$('#hr_sup').val('23:59:59');
			
			search_filters.filter_launched_until = $('#dt_sup').val()+' '+$('#hr_sup').val();
		}
		else
			delete search_filters.filter_launched_until;
		
		if (!data || data.update_filters)
			UpdateFilters();
	});
	
	$('#dt_at,#hr_at').on('change autocompletechange',function(event,data) {
		if($('#dt_at').val())
		{
			// "workflows around a given time" and "workflows launched before/after"" are incompatible, empty the other fields
			$('#dt_inf,#hr_inf,#dt_sup,#hr_sup').val('');
			$('#dt_inf,#hr_inf,#dt_sup,#hr_sup').trigger('change',{update_filters: false});
			
			// default to midnight if no time is given
			if (!$('#hr_at').val())
				$('#hr_at').val('00:00');
			
			var datetime = $('#dt_at').val()+' '+($('#hr_at').val()!=''?($('#hr_at').val()+':00'):'00:00:00');
			search_filters.filter_launched_until = datetime;
			search_filters.filter_ended_from = datetime;
		}
		else {
			delete search_filters.filter_launched_until;
			delete search_filters.filter_ended_from;
			
		}
		
		if (!data || data.update_filters)
			UpdateFilters();
	});

	$('#terminated-workflows-pannel .fa-exclamation').click(function() {
		$(this).toggleClass('error');

		if($(this).hasClass('error'))
		{
			$(this).attr('title','Display all workflows');
			search_filters.filter_error = 1;
		}
		else
		{
			$(this).attr('title','Display only failed workflows');
			delete search_filters.filter_error;
		}

		UpdateFilters();
	});

	$('#clearfilters').click(function() {
		$('#searchform select[name=node]').val('');
		$('#searchform select[name=wf_name]').val('').trigger('change.select2');
		$('#searchform select[name=tagged]').val('').trigger('change.select2');
		$('#dt_inf').val('');
		$('#hr_inf').val('');
		$('#dt_sup').val('');
		$('#hr_sup').val('');
		$('#dt_at').val('');
		$('#hr_at').val('');
		if($('#terminated-workflows-pannel .fa-exclamation').hasClass('error'))
			$('#terminated-workflows-pannel .fa-exclamation').click();

		search_filters = { status:'terminated' };
		UpdateFilters();
		$('#searchformcontainer .filter').hide();
	});

	// Pages
	$('#terminated-workflows-pannel').delegate('.fa-backward','click',function() {
		current_page--;
		UpdateFilterURL();
	});

	$('#terminated-workflows-pannel').delegate('.fa-forward','click',function() {
		current_page++;
		UpdateFilterURL();
	});
});

function SetWorkflowParameters(el)
{
	$('#which_workflow form .parameter').remove();

	if(el.val()=='')
		return;

	var promise = new jQuery.Deferred();

	evqueueAPI({
		group: 'workflow',
		action: 'get',
		attributes: {id: el.val()}
	}).done(function(xml) {
		$(xml).find('parameter').each(function() {
			$('#which_workflow form').append('<div class="parameter"><label>'+$(this).attr('name')+'</label><input name="parameter_'+$(this).attr('name')+'"></input></div>');
		});

		promise.resolve();
	});

	return promise;
}

function UpdateFilterURL()
{
	var url = "ajax/list-instances.php?";
	url += jQuery.param(search_filters);

	$('#searchform input').each(function() {
		if($(this).attr('name').substr(0,10)=='parameter_' && $(this).val()!='')
			parameters[$(this).attr('name')] = $(this).val();
	});
	if(Object.keys(parameters).length)
		url += "&" + jQuery.param(parameters);

	url += "&p="+current_page;

	$('#terminated-workflows-pannel').data('url',url);
	$('#terminated-workflows-pannel').evqautorefresh('refresh');
}

function UpdateFilters()
{
	UpdateFilterURL();

	var explain;
	if(Object.keys(search_filters).length==1)
	{
		explain = 'Showing all terminated workflows';
		$('#clearfilters').hide();
	}
	else
	{
		if(search_filters.filter_error)
			explain = 'Showing failed ';
		else
			explain = 'Showing terminated ';

		explain += (search_filters.filter_workflow?' <i>'+search_filters.filter_workflow+'</i> ':'')+'workflows';
		if(search_filters.filter_launched_from && search_filters.filter_launched_until)
			explain += ' between '+search_filters.filter_launched_from+' and '+search_filters.filter_launched_until;
		else if(search_filters.filter_launched_from)
			explain += ' since '+search_filters.filter_launched_from;
		else if(search_filters.filter_launched_until)
			explain += ' before '+search_filters.filter_launched_until;
		else if(search_filters.filter_tag_id)
			explain += ' tagged '+$('#searchform select[name=tagged] option[value='+search_filters.filter_tag_id+']').text();
		// TODO dt_at

		var i = 0;
		if(Object.keys(parameters).length)
		{
			explain += ' having ';
			for(var param in parameters)
			{
				if(i>0)
					explain += ', ';
				explain+= param.substr(10)+'='+parameters[param];
				i++;
			}
		}

		if(search_filters.filter_node)
			explain += ' on node '+search_filters.filter_node;

		$('#clearfilters').show();
	}

	$('#searchexplain').html(explain);

	Message('Filters updated');
}
