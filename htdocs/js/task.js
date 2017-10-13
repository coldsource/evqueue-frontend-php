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
	
	$.ajax({url: "ajax/list-tasks.php"}).done(function(data) {
		$('#list-tasks').html(data);
		
		Ready();
		
		$('.fa-file-o').click({
			form_div:$('#tpltask-editor'),
			group:'task',
			title:'Create task',
			message:'Task created'
		}, evqueueCreateFormHandler);
		
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
		
		$('.fa-edit').click({
			form_div:$('#tpltask-editor'),
			group:'task',
			title:'Edit task',
			message:'Task saved'
		}, evqueueEditFormHandler);
		
		$('.git.fa-cloud-upload').click(function() {
			var log = prompt("Enter your commit log");
			if(log==null)
				return;
			
			Wait();
			evqueueAPI({
				confirm: $(this).hasClass('conflict') ? 'You are about to overwrite changes to the repository' : '',
				group: 'git',
				action: 'save_task',
				attributes: {
					name: $(this).data('name'),
					commit_log: log,
					force: $(this).hasClass('conflict') ? 'yes' : 'no'
				}
			}).done(function() {
				Message('Committed task to git');
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
				action: 'load_task',
				attributes: {name: $(this).data('name')}
			}).done(function() {
				Message('Loaded task from git');
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
				confirm: 'You are about to remove a task from the git repository',
				group: 'git',
				action: 'remove_task',
				attributes: {name: $(this).data('name'), commit_log: log}
			}).done(function() {
				Message('Removed task from git');
				RefreshPage();
			}).always(function() {
				Ready();
			});
		});
		
		$('.fa-remove:not(.git)').click(function() {
			evqueueAPI({
				confirm: 'You are about to delete the selected task',
				group: 'task',
				action: 'delete',
				attributes: { 'id':$(this).parents('tr').data('id') }
			}).done(function() {
				Message('Task has been deleted');
				RefreshPage();
			});
		});
	});
}


var taskUsedIn = null;
function getTaskUsedIn ()
{
	var promise = new jQuery.Deferred();
	
	if (taskUsedIn !== null) {
		promise.resolve();
		return promise;
	}
	taskUsedIn = {};
	
	// Check which workflows use which tasks (and which tasks are unused)
	evqueueAPI({
		group: 'workflows',
		action: 'list',
		attributes: {full: 'yes'}
	}).done(function(xml) {
		var workflows = xml.Query('/response/workflow',xml.documentElement);
		$.each( workflows, function () {
			var workflow = {
				id: this.getAttribute('id'),
				name: this.getAttribute('name')
			};
			var used_tasks = xml.Query('.//task',this);
			$.each( used_tasks, function () {
				var taskName = this.getAttribute('name');
				if (!(taskName in taskUsedIn))
					taskUsedIn[taskName] = [];
				taskUsedIn[taskName].push(workflow.name);
			});
		});
		
		// Append HTML in every task <tr>
		for (taskName in taskUsedIn) {
			var tr = $('tr').filter(function () { return this.getAttribute('data-name') == taskName; });
			var ul = $('<ul class="js-workflowsUsingTask unstyled success hidden"><li>'+taskUsedIn[taskName].length+' workflow(s) using this task</li></ul>');
			tr.find('td:first-child').append(ul);
			$.each(taskUsedIn[taskName], function () {
				ul.append( '<li>- '+this.trim()+'</li>' );
			});
		}
		
		$('tr.evenOdd:not(:has(.js-workflowsUsingTask))').find('td:first-child').append('<p class="js-workflowsUsingTask error hidden">No workflow uses this task.</p>');
		
		promise.resolve();
	});
	
	return promise;
}

$(document).delegate('tr.group .fa-link', 'click', function () {
	var tr = $(this).parents('tr.group:eq(0)');
	getTaskUsedIn().done( function () {
		tr.nextUntil('.groupspace,.group','.evenOdd').find('.js-workflowsUsingTask').toggleClass('hidden');
	});
});
