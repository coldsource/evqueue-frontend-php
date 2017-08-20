function Workflow(el,xml)
{
	this.el = el;
	
	this.attributes = new Object();
	
	this.undo_stack = [];
	this.redo_stack = [];
	
	// Initiallize global node  ID
	this.gnid = 0;
	
	// Load XML
	if(xml instanceof XMLDocument)
		this.xmldoc = xml;
	else
		this.xmldoc = jQuery.parseXML(xml);
	
	XMLDocument.prototype.Query = function(xpath, context)
	{
		var results = this.evaluate(xpath,context,null,XPathResult.ANY_TYPE, null);
		var ret = [];
		while (result = results.iterateNext())
			ret.push(result);
		return ret;
	}
	
	// Attribute IDs to each job
	this.xmldoc.documentElement.setAttribute('id','0');
	jobs = this.xmldoc.Query('//job',this.xmldoc);
	for(var i=0;i<jobs.length;i++)
		jobs[i].setAttribute('id',++this.gnid);
	
	// Attribute IDs to each task
	this.xmldoc.documentElement.setAttribute('id','0');
	jobs = this.xmldoc.Query('//task',this.xmldoc);
	for(var i=0;i<jobs.length;i++)
		jobs[i].setAttribute('id',++this.gnid);
}

Workflow.prototype.GetAttribute = function(name)
{
	return this.attributes[name];
}

Workflow.prototype.SetAttribute = function(name,value)
{
	this.attributes[name] = value;
}

Workflow.prototype.Backup = function()
{
	this.redo_stack = [];
	this.undo_stack.push(this.GetXML());
}

Workflow.prototype.Undo = function()
{
	if(this.undo_stack.length==0)
		return false;
	
	this.redo_stack.push(this.GetXML());
	this.xmldoc = jQuery.parseXML(this.undo_stack.pop());
	return true;
}

Workflow.prototype.Redo = function()
{
	if(this.redo_stack.length==0)
		return false;
	
	this.undo_stack.push(this.GetXML());
	this.xmldoc = jQuery.parseXML(this.redo_stack.pop());
}

Workflow.prototype.GetXML = function(remove_id = false)
{
	if(!remove_id)
	{
		var xml = new XMLSerializer().serializeToString(this.xmldoc);
		return xml;
	}
	else
	{
		var newdom = document.implementation.createDocument(null,null);
		var root = newdom.importNode(this.xmldoc.documentElement,true);
		newdom.appendChild(root);
		var nodes = newdom.Query('//*',newdom);
		for(var i=0;i<nodes.length;i++)
			nodes[i].removeAttribute('id');
		var xml = new XMLSerializer().serializeToString(newdom);
		return xml;
	}
}

Workflow.prototype.GetRoot = function()
{
	return new Job(this.xmldoc.documentElement);
}

Workflow.prototype.GetParameters = function()
{
	var parameters = this.xmldoc.Query('/workflow/parameters/parameter',this.xmldoc);
	var ret = [];
	for(var i=0;i<parameters.length;i++)
		ret.push(parameters[i].getAttribute('name'));
	return ret;
}

Workflow.prototype.AddParameter = function(name)
{
	var parameters = this.xmldoc.Query('/workflow/parameters/parameter',this.xmldoc);
	for(var i=0;i<parameters.length;i++)
		if(parameters[i].getAttribute('name')==name)
			return false;
	
	var parameters_nodes =  this.xmldoc.Query('/workflow/parameters',this.xmldoc);
	var parameters_node;
	if(parameters_nodes.length>0)
		parameters_node = parameters_nodes[0];
	else
	{
		parameters_node = this.job.ownerDocument.createElement('parameters');
		this.xmldoc.documentElement.appendChild(parameters_node);
	}
	
	var parameter = this.xmldoc.createElement('parameter');
	parameter.setAttribute('name',name);
	
	parameters_node.appendChild(parameter);
	
	return true;
}

Workflow.prototype.DeleteParameter = function(idx)
{
	var parameters = this.xmldoc.Query('/workflow/parameters/parameter',this.xmldoc);
	parameters[idx].parentNode.removeChild(parameters[idx]);
}

Workflow.prototype.GetJobByID = function(id)
{
	if(id==0)
		return this.GetRoot();
	
	jobs = this.xmldoc.Query('//job[@id = '+id+']',this.xmldoc);
	if(jobs.length==0)
		return false;
	
	return new Job(jobs[0]);
}

Workflow.prototype.GetTaskByID = function(id)
{
	tasks = this.xmldoc.Query('//task[@id = '+id+']',this.xmldoc);
	if(tasks.length==0)
		return false;
	
	return new Task(tasks[0]);
}

Workflow.prototype.get_tasks_width = function(job)
{
	var jobs = this.xmldoc.Query('subjobs/job',job);
	if(jobs.length==0)
		return 1;
	
	n = 0;
	for(var i=0;i<jobs.length;i++)
	{
		n += this.get_tasks_width(jobs[i]);
	}
	
	return n;
}

Workflow.prototype.GetTasksWidth = function()
{
	return this.get_tasks_width(this.xmldoc.documentElement);
}

Workflow.prototype.CreateJob = function()
{
	var new_job = this.xmldoc.createElement('job');
	new_job.setAttribute('id',++this.gnid);
	return new Job(new_job);
}

Workflow.prototype.CreateTask = function(name)
{
	var new_task = this.xmldoc.createElement('task');
	new_task.setAttribute('id',++this.gnid);
	new_task.setAttribute('name',name);
	return new Task(new_task);
}

Workflow.prototype.draw = function(branch,job,level)
{
	var jobs = job.GetSubjobs();
	
	for(var i=0;i<jobs.length;i++)
	{
		if(jobs.length==1)
			sep_html = "<div class='sep nosep'></div>";
		else
		{
			sep_class = 'sep';
			if(i==0)
				sep_class += ' lsep';
			else if(i==jobs.length-1)
				sep_class += ' rsep';
			sep_html = "<div class='"+sep_class+"'></div>";
		}
		
		branch.append("<div class='branch' data-type='branch'><div>"+sep_html+"</div><div class='droppable' data-parent-id='"+jobs[i].GetParentID()+"' data-sibling-pos='-1'><div class='postsep'></div></div></div>");
		var subbranch = branch.children().last();
		subbranch.append("<div class='nodesep droppable' data-parent-id='"+jobs[i].GetParentID()+"' data-sibling-pos='"+i+"'>&nbsp;</div>");
		subbranch.append("<div class='node' data-type='node' data-id='"+jobs[i].GetID()+"'>"+jobs[i].Draw()+"</div>");
		subbranch.append("<div class='nodesep droppable' data-parent-id='"+jobs[i].GetParentID()+"' data-sibling-pos='"+(i+1)+"'>&nbsp;</div>");
		subbranch.append("<div class='droppable presep' data-parent-id='"+jobs[i].GetID()+"' data-sibling-pos='-1'><div></div></div>");
		this.draw(subbranch,jobs[i],level+1);
	}
}

Workflow.prototype.Draw = function()
{
	this.el.html('');
	
	this.draw(this.el,this.GetRoot(),0);
	
	var tasks_width = this.GetTasksWidth();
	this.el.css('width',(tasks_width*222+2)+'px');
	
	$('.node').draggable({
		cursor:'grabbing',
		start:function(event, ui) {
			$(this).draggable('instance').offset.click = { left: Math.floor(ui.helper.width() / 2), top: Math.floor(ui.helper.height() / 2) };
			$(this).css('opacity','0.7');
		},
		stop:function(event, ui) {
			wf.Draw();
		}
	});
	$('.branch').draggable({
		cursor:'grabbing',
		start:function(event, ui) {
			$(this).find('.sep:first').remove();
			$(this).draggable('instance').offset.click = { left: Math.floor(ui.helper.width() / 2), top: Math.floor(ui.helper.height() / 2) };
			$(this).css('opacity','0.7');
		},
		stop:function(event, ui) {
			wf.Draw();
		}
	});
	
	$('.droppable').droppable({
		drop: function(event, ui) {
			wf.Backup();
			
			var type = ui.draggable.data('type');
			var parent_id = $(this).data('parent-id');
			var sibling_pos = $(this).data('sibling-pos');
			var parent_job = wf.GetJobByID(parent_id);
			
			if(type=='task')
			{
				var task_name = ui.draggable.data('name');
				var new_job = wf.CreateJob();
				new_job.AddTask(wf.CreateTask(task_name));
				parent_job.AddSubjob(sibling_pos,new_job);
			}
			else if(type=='branch')
			{
				var current_job_id = ui.draggable.find('.node:first').data('id');
				var current_job = wf.GetJobByID(current_job_id);
				current_job.MoveTo(parent_job,sibling_pos,true);
			}
			else if(type=='node')
			{
				var current_job_id = ui.draggable.data('id');
				var current_job = wf.GetJobByID(current_job_id);
				current_job.MoveTo(parent_job,sibling_pos,false);
			}
			
			wf.Draw();
		},
		over: function(event,ui) {
			$(this).css('border','1px dashed grey');
		},
		out: function(event,ui) {
			$(this).css('border','0px');
		}
	});
	
	$('.node').droppable({
		drop: function(event, ui) {
			wf.Backup();
			
			var type = ui.draggable.data('type');
			
			if(type=='task')
			{
				var task_name = ui.draggable.data('name');
				var current_job_id = $(this).data('id');
				var current_job = wf.GetJobByID(current_job_id);
				current_job.AddTask(wf.CreateTask(task_name));
			}
		
			wf.Draw();
		},
		over: function(event,ui) {
			$(this).css('border-style','dashed');
		},
		out: function(event,ui) {
			$(this).css('border-style','solid');
		}
	});
	
	$('.node div.title').click(function() {
		job_editor.Open($(this).parent().data('id'));
	});
	
	$('.jobtask').click(function() {
		task_editor.Open($(this).data('id'));
	});
}
