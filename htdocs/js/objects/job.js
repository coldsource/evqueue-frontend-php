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

function Job(job)
{
	this.job = job;
}

Job.prototype.GetID = function()
{
	return this.job.getAttribute('id');
}

Job.prototype.GetParentID = function()
{
	return this.job.parentNode.parentNode.getAttribute('id');
}

Job.prototype.GetParent = function()
{
	if(!this.job.parentNode || !this.job.parentNode.parentNode)
		return false;
	
	return new Job(this.job.parentNode.parentNode);
}

Job.prototype.GetAttribute = function(name)
{
	if(this.job.hasAttribute(name))
		return this.job.getAttribute(name);
	return '';
}

Job.prototype.SetAttribute = function(name, value)
{
	if(value)
		this.job.setAttribute(name,value);
	else
		this.job.removeAttribute(name);
}

Job.prototype.GetSubjobs = function()
{
	var ret = [];
	var jobs = this.job.ownerDocument.Query("subjobs/job",this.job);
	for(var i=0;i<jobs.length;i++)
		ret.push(new Job(jobs[i]));
	return ret;
}

Job.prototype.GetTasks = function()
{
	var ret = [];
	var tasks = this.job.ownerDocument.Query("tasks/task",this.job);
	for(var i=0;i<tasks.length;i++)
		ret.push(new Task(tasks[i]));
	return ret;
}

Job.prototype.AddSubjob = function(sibling_pos,new_job)
{
	var subjobs = this.job.ownerDocument.Query('subjobs',this.job);
	
	if(sibling_pos==-1)
	{
		if(subjobs.length>0)
		{
			this.job.removeChild(subjobs[0]);
			var leaf = new_job;
			while(leaf.GetSubjobs().length>0)
				leaf = leaf.GetSubjobs()[0];
			leaf.job.appendChild(subjobs[0]);
		}
		
		var subjobs_node = this.job.ownerDocument.createElement('subjobs');
		subjobs_node.appendChild(new_job.job);
		
		this.job.appendChild(subjobs_node);
	}
	else
	{
		if(sibling_pos==this.GetSubjobs().length)
			subjobs[0].appendChild(new_job.job);
		else
			subjobs[0].insertBefore(new_job.job,subjobs[0].childNodes[sibling_pos]);
	}
}

// @param parent_job is the new parent (drag'n'drop destination)
Job.prototype.MoveTo = function(parent_job, sibling_pos, depth)
{
	var previous_parent = this.job.parentNode;
	
	if(this.job==parent_job.job)
		parent_job = parent_job.GetParent();
	
	if(depth)
	{
		previous_parent.removeChild(this.job);
		parent_job.AddSubjob(sibling_pos, this);
	}
	else
	{
		var subjobs = this.GetSubjobs();
		
		if(subjobs.length>0)
		{
			for(var i=0;i<subjobs.length;i++)
				previous_parent.insertBefore(subjobs[i].job,this.job);
		}
		
		previous_parent.removeChild(this.job);
		
		parent_job.AddSubjob(sibling_pos, this);
	}
	
	// Check that we're not leaving any empty <subjobs> node
	if (previous_parent.childNodes.length == 0)
		previous_parent.parentNode.removeChild(previous_parent);
}

Job.prototype.Delete = function(depth)
{
	var parent = this.job.parentNode;
	
	if(depth)
		parent.removeChild(this.job);
	else
	{
		var subjobs = this.GetSubjobs();
		
		if(subjobs.length>0)
		{
			for(var i=0;i<subjobs.length;i++)
				parent.insertBefore(subjobs[i].job,this.job);
		}
		
		parent.removeChild(this.job);
	}
	
	// Check that we're not leaving an empty <subjobs> node (if we are, remove it too)
	if (parent.childNodes.length == 0)
		parent.parentNode.removeChild(parent);
}

Job.prototype.AddTask = function(task)
{
	var tasks_nodes = this.job.ownerDocument.Query('tasks',this.job);
	var tasks_node;
	if(tasks_nodes.length>0)
		tasks_node = tasks_nodes[0];
	else
	{
		tasks_node = this.job.ownerDocument.createElement('tasks');
		this.job.appendChild(tasks_node);
	}
	
	tasks_node.appendChild(task.task);
}

Job.prototype.DeleteTask = function(idx)
{
	var tasks = this.job.ownerDocument.Query('tasks/task',this.job);
	tasks[idx].parentNode.removeChild(tasks[idx]);
}

Job.prototype.Draw = function()
{
	var tasks = this.GetTasks();
	
	var html = '<div class="title">&nbsp;';
	if(this.GetAttribute('condition') || this.GetAttribute('iteration-condition'))
		html += '<span class="faicon fa-code-fork">&nbsp;</span>';
	if(this.GetAttribute('loop'))
		html += '<span class="faicon fa-repeat">&nbsp;</span>';
	if(this.GetAttribute('name'))
		html += this.GetAttribute('name');
	html += '</div>';
	for(var i=0;i<tasks.length;i++)
	{
		task_path = tasks[i].GetDisplayName();
		
		html += '<div class="jobtask" data-type="jobtask" data-id="'+tasks[i].GetID()+'">' + task_path;
		if(tasks[i].GetAttribute('condition') || tasks[i].GetAttribute('iteration-condition'))
			html += '<span class="faicon fa-code-fork"></span>';
		if(tasks[i].GetAttribute('loop'))
			html += '<span class="faicon fa-repeat"></span>';
		var queue = tasks[i].GetAttribute('queue');
		if(queue && queue != 'default')
			html += '<span class="faicon fa-server" title="Queue: '+queue+'"></span>';
		if(tasks[i].GetAttribute('retry_schedule'))
			html += '<span class="faicon fa-bug" title="Retry schedule: '+tasks[i].GetAttribute('retry_schedule')+'"></span>';
		
		// remote execution
		if(tasks[i].GetAttribute('host') || tasks[i].GetAttribute('user'))
			html += '<span class="fas faicon fa-terminal" style="color: white; background-color: #2c3e50; padding: 10px; padding: 1px 3px; border-radius: 3px;" title="remote execution: ' + tasks[i].GetAttribute('user') + '@' + tasks[i].GetAttribute('host') + '"></span>';
		
		html += '</div>';
	}
	return html;
}
