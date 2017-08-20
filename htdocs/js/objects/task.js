function Task(task)
{
	this.task = task;
}

Task.prototype.GetParentJob = function()
{
	return new Job(this.task.parentNode.parentNode);
}

Task.prototype.GetID = function()
{
	return this.task.getAttribute('id');
}

Task.prototype.GetName = function()
{
	return this.task.getAttribute('name');
}

Task.prototype.GetAttribute = function(name)
{
	if(name=='stdinmode')
		return  this.GetStdinMode();
	
	if(this.task.hasAttribute(name))
		return this.task.getAttribute(name);
	return '';
}

Task.prototype.SetAttribute = function(name, value)
{
	if(name=='stdinmode')
		return  this.SetStdinMode(value);
	
	if(value)
		this.task.setAttribute(name,value);
	else
		this.task.removeAttribute(name);
}

Task.prototype.GetStdinMode = function()
{
	var nodes = this.task.ownerDocument.Query('stdin',this.task);
	if(nodes.length>0)
		return nodes[0].hasAttribute('mode')?nodes[0].getAttribute('mode'):'xml';
	else
		return 'xml';
}

Task.prototype.SetStdinMode = function(mode)
{
	var nodes = this.task.ownerDocument.Query('stdin',this.task);
	if(nodes.length>0)
		return nodes[0].setAttribute('mode',mode);
}

Task.prototype.GetInputs = function()
{
	var ret = [];
	var has_stdin = false;
	
	var inputs = this.task.ownerDocument.Query('input|stdin',this.task);
	for(var i=0;i<inputs.length;i++)
	{
		var node = inputs[i].firstChild;
		var values = [];
		while(node)
		{
			var value = {};
			if(node.nodeType==Node.ELEMENT_NODE)
			{
				if(node.nodeName=='value')
					value.type = 'xpathvalue';
				else if(node.nodeName=='copy')
					value.type = 'xpathcopy';
				
				value.val = node.getAttribute('select');
				
				value.task = false;
				value.node = false;
				value.parameter = false;
				var matches;
				if((matches = value.val.match(/^evqGetParentJob\([0-9]+\)\/evqGetOutput\(['"]([a-zA-Z0-9_ ]+)['"]\)\/(.*)$/))!=null)
				{
					value.task = matches[1];
					value.node = matches[2];
				}
				else if((matches = value.val.match(/^evqGetCurrentJob\(\)\/evqGetContext\(\)\/(.*)$/))!=null)
				{
					value.task ='Current job context';
					value.node = matches[1];
				}
				else if((matches = value.val.match(/^evqGetParentJob\([0-9]+\)\/evqGetContext\(\)\/(.*)$/))!=null)
				{
					value.task ='Parent context';
					value.node = matches[1];
				}
				else if((matches = value.val.match(/^\.\/(.*)$/))!=null)
				{
					value.task ='Context';
					value.node = matches[1];
				}
				else if((matches = value.val.match(/^evqGetWorkflowParameter\(['"]([a-zA-Z0-9_ ]+)['"]\)$/))!=null)
					value.parameter = matches[1];
			}
			else if(node.nodeType==Node.TEXT_NODE)
			{
				value.type = 'text';
				value.val = node.nodeValue;
			}
			
			values.push(value);
			node = node.nextSibling;
		}
		
		ret.push({name:inputs[i].hasAttribute('name')?inputs[i].getAttribute('name'):'',type:inputs[i].nodeName,value:values});
		if(inputs[i].nodeName=='stdin')
			has_stdin = true;
	}
	
	if(!has_stdin)
		ret.push({name:'',type:'stdin',value:''});
	
	return ret;
}

Task.prototype.AddInput = function(name)
{
	if(name=='')
	{
		alert('Invalid name');
		return false;
	}
	
	var inputs = this.GetInputs();
	
	for(var i=0;i<inputs.length;i++)
	{
		if(inputs[i].name==name)
		{
			alert('Input name already exists');
			return false;
		}
	}
	
	var input = this.task.ownerDocument.createElement('input');
	input.setAttribute('name',name);
	this.task.appendChild(input);
	
	return true;
}

Task.prototype.DeleteInput = function(idx)
{
	var inputs = this.task.ownerDocument.Query('input',this.task);
	this.task.removeChild(inputs[idx]);
	return true;
}

Task.prototype.RenameInput = function(idx,new_name)
{
	var inputs = this.task.ownerDocument.Query('input',this.task);
	inputs[idx].setAttribute('name',new_name);
	return true;
}

Task.prototype.AddInputPart = function(idx,type,value)
{
	var input;
	
	if(idx=='stdin')
	{
		var nodes = this.task.ownerDocument.Query('stdin',this.task);
		if(nodes.length>0)
			input = nodes[0];
		else
		{
			input = this.task.ownerDocument.createElement('stdin');
			this.task.appendChild(input);
		}
	}
	else
	{
		var inputs = this.task.ownerDocument.Query('input',this.task);
		input = inputs[idx];
	}
	
	if(type=='text')
		input.appendChild(this.task.ownerDocument.createTextNode(value));
	else if(type=='xpathvalue')
	{
		var node = this.task.ownerDocument.createElement('value');
		node.setAttribute('select',value);
		input.appendChild(node);
	}
	else if(type=='xpathcopy')
	{
		var node = this.task.ownerDocument.createElement('copy');
		node.setAttribute('select',value);
		input.appendChild(node);
	}
	return true;
}

Task.prototype.DeleteInputPart = function(input_idx, part_idx)
{
	var input;
	
	if(input_idx=='stdin')
	{
		var nodes = this.task.ownerDocument.Query('stdin',this.task);
		input = nodes[0];
	}
	else
	{
		var inputs = this.task.ownerDocument.Query('input',this.task);
		input = inputs[input_idx];
	}
	
	var parts = input.childNodes;
	input.removeChild(parts[part_idx]);
}

Task.prototype.EditInputPart = function(input_idx, part_idx, new_value)
{
	var input;
	
	if(input_idx=='stdin')
	{
		var nodes = this.task.ownerDocument.Query('stdin',this.task);
		input = nodes[0];
	}
	else
	{
		var inputs = this.task.ownerDocument.Query('input',this.task);
		input = inputs[input_idx];
	}
	
	var parts = input.childNodes;
	if(parts[part_idx].nodeType==Node.ELEMENT_NODE)
		parts[part_idx].setAttribute('select',new_value);
	else if(parts[part_idx].nodeType==Node.TEXT_NODE)
		parts[part_idx].nodeValue=new_value;
}
