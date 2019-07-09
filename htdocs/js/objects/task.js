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

Task.prototype.GetPath = function()
{
	return this.task.getAttribute('path');
}

Task.prototype.GetDisplayName = function()
{
	if(this.task.hasAttribute('path'))
	{
		// remove task filesystem path and make command parameters smaller
		var task_path = this.task.getAttribute('path').split(/\s/);
		task_path[0] = task_path[0].replace(/^(.*\/)([^/]*)$/, '<span title="'+task_path[0]+'">$2</span>');
		return task_path[0] + ' <small>'+task_path.slice(1).join(' ')+'</small>';
	}
	else if(this.task.hasAttribute('name'))
		return '<span title="'+this.task.getAttribute('name')+'">'+this.task.getAttribute('name')+'</span>';
	
	return '<span title="unknown">unknown</span>';;
}

Task.prototype.GetType = function()
{
	if(!this.task.hasAttribute('type'))
		return 'BINARY';
	else
		return this.task.getAttribute('type');
}

Task.prototype.GetScriptType = function()
{
	var value = this.task.ownerDocument.Query('script/value',this.task);
	if(value.length>0)
		return 'DYNAMIC';
	return 'STATIC';
}

Task.prototype.GetScript = function(type)
{
	var script = this.task.ownerDocument.Query('script',this.task);
	if(script.length>0)
	{
		if(type=='STATIC')
			return script[0].textContent;
		else if(type=='DYNAMIC')
		{
			var value = this.task.ownerDocument.Query('value',script[0]);
			if(value.length==0)
				return '';
			
			if(value[0].hasAttribute('select'))
				return value[0].getAttribute('select');
			return '';
		}
	}
	return '';
}

Task.prototype.SetScript = function(content,type)
{
	var script = this.task.ownerDocument.Query('script',this.task);
	if(script.length==0)
	{
		script = this.task.ownerDocument.createElement('script');
		this.task.appendChild(script);
	}
	else
		script = script[0];

	if(this.GetType()=='BINARY')
	{
		this.task.removeChild(script);
		return;
	}

	if(type=='STATIC')
	{
		script.textContent = content;
	}
	else if(type=='DYNAMIC')
	{
		script.textContent = '';
		var value = this.task.ownerDocument.createElement('value');
		script.appendChild(value);
		value.setAttribute('select',content);
	}
}

Task.prototype.GetAttribute = function(name)
{
	if(name=='stdinmode')
		return this.GetStdinMode();
	else if(name=='script')
		return this.GetScript('STATIC');
	else if(name=='script-xpath')
		return this.GetScript('DYNAMIC');
	
	if(this.task.hasAttribute(name))
		return this.task.getAttribute(name);
	return '';
}

Task.prototype.SetAttribute = function(name, value)
{
	if(name=='stdinmode')
		return  this.SetStdinMode(value);
	else if(name=='script')
		return this.SetScript(value,'STATIC');
	else if(name=='script-xpath')
		return this.SetScript(value,'DYNAMIC');
	
	if(value)
		this.task.setAttribute(name,value);
	else
		this.task.removeAttribute(name);
	
	if(name=='type')
	{
		if(value=='BINARY')
		{
			this.task.removeAttribute('name');
			this.SetScript('');
		}
		else if(value=='SCRIPT')
			this.task.removeAttribute('path');
	}
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
				else if((matches = value.val.match(/^evqGetCurrentJob\(\)\/evqGetContext\(\)(?:\/(.*))?$/))!=null)
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
	
	// push <stdin> to the end of the "inputs" list (allows for simple numbering of regular <input>s)
	var stdin = this.task.ownerDocument.Query('stdin',this.task);
	if (stdin.length > 0) {
		this.task.removeChild(stdin[0]);
		this.task.appendChild(stdin[0]);  // <stdin> now after all <input>s
	}
	
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

Task.prototype.GetInputProperties = function(input_idx)
{
	var res = {condition:'',loop:''};
	
	var inputs = this.task.ownerDocument.Query('input',this.task);
	var input = inputs[input_idx];
	
	if(input.hasAttribute('condition'))
		res.condition = input.getAttribute('condition');
	
	if(input.hasAttribute('loop'))
		res.loop = input.getAttribute('loop');
	
	return res;
}

Task.prototype.EditInputProperties = function(input_idx, condition, loop)
{
	var inputs = this.task.ownerDocument.Query('input',this.task);
	var input = inputs[input_idx];
	
	if(condition)
		input.setAttribute('condition', condition);
	else
		input.removeAttribute('condition');
	
	if(loop)
		input.setAttribute('loop', loop);
	else
		input.removeAttribute('loop');
}
