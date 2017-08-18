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

Job.prototype.MoveTo = function(parent_job, sibling_pos, depth)
{
	if(depth)
	{
		this.job.parentNode.removeChild(this.job);
		parent_job.AddSubjob(sibling_pos, this);
	}
	else
	{
		var subjobs = this.GetSubjobs();
		
		if(subjobs.length>0)
		{
			for(var i=0;i<subjobs.length;i++)
				this.job.parentNode.insertBefore(subjobs[i].job,this.job);
		}
		
		this.job.parentNode.removeChild(this.job);
		
		parent_job.AddSubjob(sibling_pos, this);
	}
}

Job.prototype.Delete = function(depth)
{
	if(depth)
		this.job.parentNode.removeChild(this.job);
	else
	{
		var subjobs = this.GetSubjobs();
		
		if(subjobs.length>0)
		{
			for(var i=0;i<subjobs.length;i++)
				this.job.parentNode.insertBefore(subjobs[i].job,this.job);
		}
		
		this.job.parentNode.removeChild(this.job);
	}
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

Job.prototype.Draw = function()
{
	var tasks = this.GetTasks();
	
	var html = '';
	for(var i=0;i<tasks.length;i++)
		html += '<div class="jobtask" data-type="jobtask" data-id="'+tasks[i].GetID()+'">'+tasks[i].GetName()+'</div>';
	return html;
}