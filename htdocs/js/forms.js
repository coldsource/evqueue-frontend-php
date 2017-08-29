$(document).on('keyup click', '.filenameInput' , function(){
	val = $(this).val();
	if (val.substr(val.length - 1) == "/" || val == "") {
		$.ajax({
			data:{'group':'filesystem', 'action':'list', 'attributes':{'path':$(this).val()}},
			type: 'post',
			url: 'ajax/evqueue_api.php',
			content:'xml',
		}).done(function(xml){
			availableFiles = [];
			
			$(xml).find('response entry').each(function(){
				availableFiles.push(val+$(this).attr('name'));
			});
			
			availableFiles.sort(function(a,b){
				return a.toLowerCase() > b.toLowerCase() ? 1 : -1;
			})
			
			$( ".filenameInput" ).autocomplete({
				source: availableFiles,
				minLength:0
			});
			
			
			$( ".filenameInput" ).autocomplete("search");
		});
	}
})

$(document).ready( function() {
	$('.evq-autocomplete').each(function() {
		var el = $(this);
		
		if(el.data('type')=='taskgroup')
		{
			evqueueAPI({
				group: 'tasks',
				action: 'list'
			}).done(function(xml) {
				data = new Set();
				$(xml).find('task').each(function() {
					if($(this).attr('group')!='')
						data.add($(this).attr('group'));
				});
				el.data('autocomplete',Array.from(data));
			});
		}
		else if(el.data('type')=='workflowgroup')
		{
			evqueueAPI({
				group: 'workflows',
				action: 'list'
			}).done(function(xml) {
				data = new Set();
				$(xml).find('workflow').each(function() {
					if($(this).attr('group')!='')
						data.add($(this).attr('group'));
				});
				el.data('autocomplete',Array.from(data));
			});
		}
		else if(el.data('type')=='time')
		{
			data = [];
			for(var i=0;i<24;i++)
				for(var j=0;j<60;j+=30)
					data.push(('00'+i).slice(-2)+':'+('00'+j).slice(-2));
				el.data('autocomplete',data);
		}
		
		el.on('focus',function() {
			el.autocomplete({source: $(this).data('autocomplete'),minLength:0});
			el.autocomplete('search');
		});
	});
	
	$('.evq-autofill').each(function() {
		var el = $(this);
		
		if(el.data('type')=='workflows')
		{
			el.append($('<option>'));
			var valuetype = el.data('valuetype');
			var groups = [];
			var workflows = new Object();
			evqueueAPI({
				group: 'workflows',
				action: 'list'
			}).done(function(xml) {
				$(xml).find('workflow').each(function() {
					var group = $(this).attr('group')!=''?$(this).attr('group'):'No group';
					
					if(!(group in workflows))
					{
						groups.push(group);
						workflows[group] = [];
					}
					
					workflows[group].push({value:valuetype=='id'?$(this).attr('id'):$(this).attr('name'),name:$(this).attr('name')});
				});
				
				groups.sort(function (a, b) {
					return a.toLowerCase().localeCompare(b.toLowerCase());
				});
				
				for(var i=0;i<groups.length;i++)
				{
					var optgroup = $('<optgroup>', {label: groups[i]});
					el.append(optgroup);
					for(var j=0;j<workflows[groups[i]].length;j++)
						optgroup.append($('<option>', {value: workflows[groups[i]][j].value,text:workflows[groups[i]][j].name}));
				}
			});
			
			el.select2();
		}
		else if(el.data('type')=='node')
		{
			$.getJSON('ajax/get-nodes.php',function(data) {
				for(var node in data)
					el.append($('<option>',{value:node,text:node}));
			});
		}
		
	});
	
	$('.select2').select2();
});

function evqueueSubmitFormAPI(el, group, id, message)
{
	var action = id?'edit':'create';
	
	var values = new Object();
	var parameters = new Object();
	if(id)
		values['id'] = id;
	
	el.find('form :input:not(.select2-search__field)').each(function() {
		if(!$(this).hasClass('nosubmit') && !$(this).parents('form').hasClass('nosubmit'))
		{
			if($(this).attr('name').substr(0,10)=='parameter_')
				parameters[$(this).attr('name').substr(10)] = $(this).val();
			else if($(this).attr('type')=='checkbox')
				values[$(this).attr('name')] = $(this).prop('checked')?'yes':'no';
			else
				values[$(this).attr('name')] = $(this).val();
		}
	});
	
	Wait();
	
	return evqueueAPI({
		group: group,
		action: action,
		attributes: values,
		parameters: parameters,
	}).done(function() {
		Message(message);
	}).always(function() {
		Ready();
	});
}

function evqueuePrepareFormAPI(el, group, id)
{
	el.tabs({active:0});
	
	if(id)
	{
		return evqueueAPI({
			group: group,
			action: 'get',
			attributes: {id:id}
		}).done(function(xml) {
			attributes = xml.documentElement.firstChild.attributes;
			for(var i=0;i<attributes.length;i++)
			{
				var input = el.find("form :input[name='"+attributes[i].name+"']").first();
				if(input.attr('type')=='checkbox')
					input.prop('checked',attributes[i].value=='yes' || attributes[i].value=='1');
				else
					input.val(attributes[i].value);
				
				input.trigger('change',xml);
			}
		});
	}
	else
	{
		el.find("form :input").each(function() {
			if($(this).is('select'))
				$(this).val($(this).find('option:first').val());
			else
				$(this).val('');
			
			$(this).change();
		});
		
		return new jQuery.Deferred().resolve();
	}
}

function evqueueCreateFormHandler(event)
{
	options = event.data;
	
	options.form_div.find('.submit').text(options.title);
	options.form_div.find('.submit').off('click').on('click',function() {
		var promise;
		if(options.prehandler)
			promise = options.prehandler();
		else
			promise = new jQuery.Deferred().resolve();
		
		promise.done(function() {
			evqueueSubmitFormAPI(options.form_div,options.group,false,options.message).done(function() {
				options.form_div.dialog('close');
				RefreshPage();
			});
		});
	});
	
	evqueuePrepareFormAPI(options.form_div,options.group,false).done(function() {
		options.form_div.dialog({title:options.title,width:options.form_div.data('width'),height:options.form_div.data('height')});
	});
}

function evqueueEditFormHandler(event)
{
	options = event.data;
	
	var id = $(this).parents('tr').data('id');
	options.form_div.find('.submit').text(options.title);
	options.form_div.find('.submit').off('click').on('click',function() {
		var promise;
		if(options.prehandler)
			promise = options.prehandler();
		else
			promise = new jQuery.Deferred().resolve();
		
		promise.done(function() {
			evqueueSubmitFormAPI(options.form_div,options.group,id,options.message).done(function() {
				options.form_div.dialog('close');
				RefreshPage();
			});
		});
	});
	
	evqueuePrepareFormAPI(options.form_div,options.group,id).done(function() {
		options.form_div.dialog({title:options.title,width:options.form_div.data('width'),height:options.form_div.data('height')});
	});
}
