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

$.widget("ui.dialog", $.extend({}, $.ui.dialog.prototype, {
	_title: function(title) {
		if (!this.options.title ) {
			title.html("&#160;");
		} else {
			title.html(this.options.title);
		}
	}
}));

$(document).delegate('.showWorkflowDetails','click',function() {
	var wfid = $(this).data('id');
	var node = $(this).data('node-name');
	var status = $(this).data('status');
	
	var container = $('<div>');
	container.attr('data-url',"ajax/instance.php?id="+wfid+"&node="+node);
	container.attr('data-interval',status=='TERMINATED'?0:5);
	container.addClass('evq-autorefresh');
	$('#workflow-dialogs').append(container);
	
	var dialog = $('#workflow-dialog').clone();
	dialog.removeAttr('id');
	dialog.find('ul').append('<li><a href="#workflow-'+wfid+'">Tree</a></li>')
	dialog.find('ul').append('<li><a href="#workflow-'+wfid+'-xml">XML</a></li>')
	dialog.find('ul').append('<li><a href="#workflow-'+wfid+'-parameters">Parameters</a></li>')
	if(status=='TERMINATED')
		dialog.find('ul').append('<li><a href="#workflow-debug">Debug</a></li>')
	
	
	dialog.append('<div class="evq-autorefresh-pannel" id="workflow-'+wfid+'"></div>');
	dialog.append('<div class="evq-autorefresh-pannel" id="workflow-'+wfid+'-xml"></div>');
	dialog.append('<div class="evq-autorefresh-pannel" id="workflow-'+wfid+'-parameters"></div>');
	dialog.tabs();
	dialog.dialogTiled({
		width:'auto',
		height:'auto',
		appendTo:container,
		title:'Instance '+wfid+'<span class="faicon fa-rocket" style="font-weight:normal;" title="Launch new workflow base on this one" data-id="'+wfid+'" data-node="'+node+'"></span>',
		close:function() { container.evqautorefresh('disable'); container.remove(); }
	});
	
	container.evqautorefresh();
	
	dialog.delegate('.taskName','click',function() {
		TaskDialog(container,wfid,$(this).parent().data('evqid'),$(this).parent().data('name'),$(this).parent().data('outputs'),$(this).parent().data('outputs'));
	});
	
	dialog.delegate('.fa-step-forward','click',function() {
		evqueueAPI({
				group: 'instance',
				action: 'debugresume',
				attributes: {id:wfid},
				node: node
			}).done(function(xml) {
				var instance_id = xml.documentElement.getAttribute('workflow-instance-id');
				Message('Debugging new instance '+instance_id);
			});
	});
});

function TaskDialog(container,wfid,evqid,name,idx,noutputs)
{
	var dialog = $('#task-dialog').clone();
	if(idx==noutputs)
		dialog.find('ul').append('<li><a href="#'+wfid+'-'+evqid+'-general">General</a></li>')
	dialog.find('ul').append('<li><a href="#'+wfid+'-'+evqid+'-stdout-'+idx+'">stdout</a></li>')
	dialog.find('ul').append('<li><a href="#'+wfid+'-'+evqid+'-stderr-'+idx+'">stderr</a></li>')
	dialog.find('ul').append('<li><a href="#'+wfid+'-'+evqid+'-log-'+idx+'">log</a></li>')
	if(noutputs>1 && idx==noutputs)
		dialog.find('ul').append('<li><a href="#'+wfid+'-'+evqid+'-executions">Previous executions</a></li>')
	
	if(idx==noutputs)
		dialog.append('<div class="evq-autorefresh-pannel" id="'+wfid+'-'+evqid+'-general"></div>')
	dialog.append('<div class="evq-autorefresh-pannel" id="'+wfid+'-'+evqid+'-stdout-'+idx+'"</div>')
	dialog.append('<div class="evq-autorefresh-pannel" id="'+wfid+'-'+evqid+'-stderr-'+idx+'"</div>')
	dialog.append('<div class="evq-autorefresh-pannel" id="'+wfid+'-'+evqid+'-log-'+idx+'"</div>')
	if(noutputs>1 && idx==noutputs)
		dialog.append('<div class="evq-autorefresh-pannel" id="'+wfid+'-'+evqid+'-executions"</div>')
	
	dialog.tabs();
	dialog.dialogTiled({
		width:600,
		title:'Task '+name,
		appendTo:container,
		close:function() { $(this).dialog('destroy'); }
	});
	
	container.evqautorefresh('refresh');
	
	dialog.delegate('.task_execution:not(:last-child)','click',function() {
		TaskDialog(container,wfid,evqid,name,$(this).index()+1,noutputs);
	});
}

function CancelInstance(id,node,killtasks = false)
{
	evqueueAPI({
		group: 'instance',
		action: 'query',
		attributes: { 'id':id },
		node: node
	}).done( function (xml) {
		var subjobs = xml.Query('subjobs',xml.documentElement.firstChild);
		
		evqueueAPI({
			group: 'instance',
			action: 'cancel',
			attributes: { 'id':id },
			node: node
		}).done(function() {
			Message('Canceled instance '+id);
			if(killtasks)
				KillRunningTasks(subjobs[0],id,node);
		});
	});
}

function KillRunningTasks(subjobs,id,node)
{
	var xmldoc = subjobs.ownerDocument;
	jobs = xmldoc.Query('job',subjobs);
	for(var i=0;i<jobs.length;i++)
	{
		var tasks = xmldoc.Query("tasks/task[@status = 'EXECUTING']",jobs[i]);
		for(var j=0;j<tasks.length;j++)
		{
			var task_name = tasks[j].getAttribute('name');
			evqueueAPI({
				group: 'instance',
				action: 'killtask',
				attributes: { 'id':id, 'pid':tasks[j].getAttribute('pid') },
				node: node
			}).done(function() {
				Message('Killed task '+task_name);
			});
		
			var job_subjobs = xmldoc.Query('subjobs',jobs[i]);
			if(job_subjobs.length>0)
				KillRunningTasks(job_subjobs[0],id,node);
		}
	}
}

function DrawGraph(el,desc)
{
	el.find('div.slice, div.labelwrapper').remove();
	
	var total = 0;
	var total_last = 0;
	var zindex = 10+desc.length;
	
	var max = 0;
	for(var i=0;i<desc.length;i++)
		max += desc[i].prct?desc[i].prct:0;
	
	for(var i=0;i<desc.length;i++)
	{
		if(desc[i].prct && desc[i].prct!=0)
		{
			total += desc[i].prct;
			
			var slice = $('<div class="slice"></div>');
			slice.css('background-color',desc[i].color);
			slice.css('transform','rotate('+(total/max*180)+'deg');
			slice.css('z-index',zindex--);
			el.append(slice)
			
			var labelwrapper = $('<div></div>',{class:"labelwrapper"});
			labelwrapper.css('transform','rotate('+((total_last+(total-total_last)/2)/max*180)+'deg');
			el.append(labelwrapper);
			
			var label = $('<div>',{class:(total_last+(total-total_last)/2)<(max/2)?"label left":"label right",text:desc[i].label+' ('+desc[i].prct+')'});
			label.css('transform','rotate(-'+((total_last+(total-total_last)/2)/max*180)+'deg');
			labelwrapper.append(label);
			
			total_last = total;
		}
	}
}
