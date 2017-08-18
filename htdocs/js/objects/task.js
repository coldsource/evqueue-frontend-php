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

Task.prototype.GetInputs = function()
{
	var ret = [];
	
	var inputs = this.task.ownerDocument.Query('input',this.task);
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
				var matches = value.val.match(/evqGetParentJob\([0-9]+\)\/evqGetOutput\(['"]([a-zA-Z0-9_ ]+)['"]\)\/(.*)/);
				if(matches!=null)
				{
					value.task = matches[1];
					value.node = matches[2];
				}
				else
				{
					var matches = value.val.match(/evqGetWorkflowParameter\(['"]([a-zA-Z0-9_ ]+)['"]\)/);
					if(matches!=null)
						value.parameter = matches[1];
				}
			}
			else if(node.nodeType==Node.TEXT_NODE)
			{
				value.type = 'text';
				value.val = node.nodeValue;
			}
			
			values.push(value);
			node = node.nextSibling;
		}
		
		ret.push({name:inputs[i].getAttribute('name'),value:values});
	}
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

Task.prototype.DeleteInput = function(name)
{
	var inputs = this.task.ownerDocument.Query('input',this.task);
	for(var i=0;i<inputs.length;i++)
	{
		if(inputs[i].getAttribute('name')==name)
		{
			this.task.removeChild(inputs[i]);
			return true;
		}
	}
	
	return false;
}

Task.prototype.AddInputPart = function(name,type,value)
{
	var inputs = this.task.ownerDocument.Query('input',this.task);
	for(var i=0;i<inputs.length;i++)
	{
		if(inputs[i].getAttribute('name')==name)
		{
			if(type=='text')
				inputs[i].appendChild(this.task.ownerDocument.createTextNode(value));
			else if(type=='xpathvalue')
			{
				var node = this.task.ownerDocument.createElement('value');
				node.setAttribute('select',value);
				inputs[i].appendChild(node);
			}
			else if(type=='xpathcopy')
			{
				var node = this.task.ownerDocument.createElement('copy');
				node.setAttribute('select',value);
				inputs[i].appendChild(node);
			}
			return true;
		}
	}
	
	return false;
}