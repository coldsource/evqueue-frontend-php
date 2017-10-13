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

$(document).ready( function() {
	RefreshPage();
});

function RefreshPage()
{
	Wait();
	
	$.ajax({url: "ajax/list-workflows.php"}).done(function(data) {
		$('#list-workflows').html(data);
		
		Ready();
		
		$('.fa-file-o').click(function() {
			document.location="workflow-ui.php?workflow_id=-1";
		});
		
		$('.fa-file-archive-o').click(function() {
			document.location="export.php?workflow_id="+$(this).parents('tr').data('id');
		});
		
		$('.fa-cloud').click(function() {
			Wait();
			evqueueAPI({
				group: 'git',
				action: 'pull',
				attributes: {}
			}).done(function() {
				Message('Git pulled');
				RefreshPage();
			}).always(function() {
				Ready();
			});
		});
		
		$('.git.fa-cloud-upload').click(function() {
			var log = prompt("Enter your commit log");
			if(log==null)
				return;
			
			Wait();
			evqueueAPI({
				confirm: $(this).hasClass('conflict') ? 'You are about to overwrite changes to the repository' : '',
				group: 'git',
				action: 'save_workflow',
				attributes: {
					name: $(this).data('name'),
					commit_log: log,
					force: $(this).hasClass('conflict') ? 'yes' : 'no'
				}
			}).done(function() {
				Message('Committed workflow to git');
				RefreshPage();
			}).always(function() {
				Ready();
			});
		});
		
		$('.git.fa-cloud-download').click(function() {
			Wait();
			evqueueAPI({
				confirm: $(this).hasClass('conflict') ? 'You are about to overwrite changes to your local copy' : '',
				group: 'git',
				action: 'load_workflow',
				attributes: {name: $(this).data('name')}
			}).done(function() {
				Message('Loaded workflow from git');
				RefreshPage();
			}).always(function() {
				Ready();
			});
		});
		
		$('.git.fa-remove').click(function() {
			var log = prompt("Enter your commit log");
			if(log==null)
				return;
			
			Wait();
			evqueueAPI({
				confirm: 'You are about to remove a workflow from the git repository',
				group: 'git',
				action: 'remove_workflow',
				attributes: {name: $(this).data('name'),commit_log:log}
			}).done(function() {
				Message('Removed workflow from git');
				RefreshPage();
			}).always(function() {
				Ready();
			});
		});
		
		$('.fa-edit').click(function() {
			document.location="workflow-ui.php?workflow_id="+$(this).parents('tr').data('id');
		});
		
		$('.fa-remove:not(.git)').click(function() {
			Wait();
			evqueueAPI({
				confirm: 'You are about to delete the selected workflow',
				group: 'workflow',
				action: 'delete',
				attributes: { id: $(this).parents('tr').data('id') }
			}).done(function() {
				Message('Workflow has been deleted');
				RefreshPage();
			}).always(function() {
				Ready();
			});
		});
	});
}


var workflowUsedIn = null;
function getWorkflowUsedIn ()
{
	var promise = new jQuery.Deferred();
	
	if (workflowUsedIn !== null) {
		promise.resolve();
		return promise;
	}
	workflowUsedIn = {};
	
	// Check which wf-schedules use which workflows (and which workflows are not scheduled, i.e. potentially unused)
	evqueueAPI({
		group: 'workflow_schedules',
		action: 'list'
	}).done( function (xml) {
		var schedules = xml.Query('/response/workflow_schedule',xml.documentElement);
		$.each( schedules, function () {
			var schedule = {
				id: this.getAttribute('id'),
				workflow: this.getAttribute('workflow_name')
			};
			if (!(schedule.workflow in workflowUsedIn))
				workflowUsedIn[schedule.workflow] = [];
			workflowUsedIn[schedule.workflow].push(schedule.id);
			
			// Append HTML in every workflow <tr>
			for (workflowName in workflowUsedIn) {
				var tr = $('tr').filter(function () { return this.getAttribute('data-name') == workflowName; });
				tr.find('td:first-child').append($('<p class="js-schedulesUsingWorkflow unstyled success hidden">'+workflowUsedIn[workflowName].length+' schedule(s) using this workflow</p>'));
			}
			
			$('tr.evenOdd:not(:has(.js-schedulesUsingWorkflow))').find('td:first-child').append('<p class="js-schedulesUsingWorkflow warning hidden">No schedule using this workflow.</p>');
			
			promise.resolve();
		});
	});
	
	return promise;
}

function getLastExecTime (trgroup)
{
	// Get last execution time for every workflow
	trgroup.nextUntil('.groupspace,.group','.evenOdd').each( function () {
		var tr = $(this);
		if (tr.find('.js-workflowLastExecTime').length > 0) {
			tr.find('.js-workflowLastExecTime').toggle();
			return;  // we calculated this info already, we just have to hide/show
		}
		
		var workflowName = $(this).data('name');
		evqueueAPI({
			group: 'instances',
			action: 'list',
			attributes: {
				filter_workflow: workflowName,
				limit: 1
			}
		}).done( function (xml) {
			end_time = xml.Query('/response/workflow/@end_time',xml.documentElement);
			end_time = end_time.length > 0 ? end_time[0].nodeValue : null;
			if (end_time) {
				tr.find('td:first-child').append('<p class="js-workflowLastExecTime success">Last execution: '+end_time+'</p>');
			} else {
				tr.find('td:first-child').append('<p class="js-workflowLastExecTime warning">No execution in your instances history.</p>');
			}
		});
	});
}

$(document).delegate('tr.group .fa-link', 'click', function () {
	var tr = $(this).parents('tr.group:eq(0)');
	getWorkflowUsedIn().done( function () {
		tr.nextUntil('.groupspace,.group','.evenOdd').find('.js-schedulesUsingWorkflow').toggleClass('hidden');
	});
	getLastExecTime(tr);
});