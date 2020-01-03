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

$(document).ready(function() {
	// Launch button
	/*$('#executing-workflows .fa-rocket').click(function() {
		$('#workflow-launch input[name=comment]').val('Launched by user "'+connected_user+'"');
		$('#workflow-launch').dialog({width:'auto',height:'auto'});
	});*/

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
	$('#executing-workflows .fa-clock-o').click(function() {
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
	$('#executing-workflows').delegate('.fa-info','mouseover', function(e) {
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

	$('#executing-workflows').delegate('td','mouseout', function() {
		$('#workflow-stats-graph').hide();
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

function UpdateFilters()
{
	terminated_instances.updateFilters(search_filters);

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
		if(search_filters.filter_launched_until && search_filters.filter_ended_from)
			explain += ' that were running at '+search_filters.filter_launched_until;
		else if(search_filters.filter_launched_from && search_filters.filter_launched_until)
			explain += ' between '+search_filters.filter_launched_from+' and '+search_filters.filter_launched_until;
		else if(search_filters.filter_launched_from)
			explain += ' since '+search_filters.filter_launched_from;
		else if(search_filters.filter_launched_until)
			explain += ' before '+search_filters.filter_launched_until;
		else if(search_filters.filter_tag_id)
			explain += ' tagged '+$('#searchform select[name=tagged] option[value='+search_filters.filter_tag_id+']').text();

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
