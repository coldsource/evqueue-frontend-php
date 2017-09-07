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

function InitializeXPathHelper(task_or_job,mode)
{
	var el = $('.input_type_xpath');
	
	el.html('');
	
	var wfparameters = wf.GetParameters();
	if(wfparameters.length>0)
	{
		el.append($('<optgroup>', {label: "Workflow parameters"}));
		for(var i=0;i<wfparameters.length;i++)
			el.append($('<option>', {value: "evqGetWorkflowParameter('"+wfparameters[i]+"')",text:wfparameters[i]}));
	}
	
	var job;
	if(mode=='task')
	{
		if(task_or_job.GetAttribute('loop'))
		{
			el.append($('<optgroup>', {label: "Current task"}));
			el.append($('<option>', {value: ".",text:"Loop context"}));
		}
		
		job = task_or_job.GetParentJob();
	}
	else
		job = task_or_job;
	
	if(job.GetAttribute('loop'))
	{
		el.append($('<optgroup>', {label: "Current job"}));
		el.append($('<option>', {value: "evqGetCurrentJob()/evqGetContext()",text:"Loop context"}));
	}
	
	var i = 1;
	while(job = job.GetParent())
	{
		var tasks = job.GetTasks();
		
		if(tasks.length>0)
		{
			el.append($('<optgroup>', {label: "Parent job "+i}));
			if(job.GetAttribute('loop'))
				el.append($('<option>', {value: "evqGetParentJob("+(i-1)+")/evqGetContext()",text:"Loop context"}));
		}
		
		for(var j=0;j<tasks.length;j++)
		{
			el.append($('<option>', {value: "evqGetParentJob("+(i-1)+")/evqGetOutput('"+tasks[j].GetName()+"')",text:"Task: "+tasks[j].GetName()}));
		}
		
		i++;
	}
}

function OpenValueSelector(mode=false,value='')
{
	$('#value-selector .input_type_text').val('');
	$('#value-selector .input_type_xpath').val('');
	$('#value-selector .input_type_xpath_nodes').val('');
	$('#value-selector .input_type_advanced').val('');
	
	if(mode)
	{
		if(mode=='text')
		{
			$('#value-selector .input_type_text').val(value);
			$('#value-selector').tabs({ disabled:[1,2,3],active:0});
		}
		else
		{
			var tab;
			if(mode=='xpathvalue')
			{
				$('#value-selector').tabs({disabled:[0,2],active:1});
				tab = $('#value-selector #tab-value');
			}
			else
			{
				$('#value-selector').tabs({disabled:[0,1],active:2});
				tab = $('#value-selector #tab-copy');
			}
			
			tab.find('.input_type_xpath option').each(function() {
				var opt_val =  $(this).val();
				if((value==opt_val && opt_val.length==value.length) || (value.substring(0,opt_val.length+1)==opt_val+'/'))
				{
					tab.find('.input_type_xpath').val(opt_val);
					tab.find('.input_type_xpath_nodes').val(value.substring(opt_val.length+1));
					return false;
				}
			});
			
			if(tab.find('.input_type_xpath').val()==null)
				$('#value-selector').tabs({disabled:[0,1,2],active:3});
			
			$('#value-selector #advanced_mode').val(mode);
			$('#value-selector .input_type_advanced').val(value);
		}
		
		$('#value-selector .add_value').each(function() {
			$(this).text('Edit value');
		});
		
		$("#value-selector select#advanced_mode").attr('disabled','disabled');
	}
	else
	{
		$('#value-selector').tabs({ disabled:[]});
		$('#value-selector .add_value').each(function() {
			$(this).text('Add this value to input');
		});
		$("#value-selector select#advanced_mode").removeAttr('disabled');
	}
	
	$('#value-selector').dialog({width: 800,height: 300});
}

function OpenXPathHelper()
{
	$('#xpath-selector .input_type_xpath').val('');
	$('#xpath-selector .input_type_xpath_nodes').val('');
	
	$('#xpath-selector').dialog({width: 800,height: 200});
}

function XPathHelperPath(helper)
{
	var parent_task = helper.find('.input_type_xpath').val();
	var node = helper.find('.input_type_xpath_nodes').val();
	var val = parent_task;
	if(node)
		val += "/"+node;
	
	return val;
}
