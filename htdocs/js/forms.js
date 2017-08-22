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
			evqueueAPI(false,'tasks','list',{}, [],function(xml) {
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
			evqueueAPI(false,'workflows','list',{}, [],function(xml) {
				data = new Set();
				$(xml).find('workflow').each(function() {
					if($(this).attr('group')!='')
						data.add($(this).attr('group'));
				});
				el.data('autocomplete',Array.from(data));
			});
		}
		
		el.on('focus',function() {
			el.off('focus');
			el.autocomplete({source: $(this).data('autocomplete'),minLength:0});
		});
	});
});

function evqueueSubmitFormAPI(el, group, id, message)
{
	var action = id?'edit':'create';
	
	var values = new Object();
	if(id)
		values['id'] = id;
	
	el.find('form :input').each(function() {
		if($(this).attr('type')=='checkbox')
			values[$(this).attr('name')] = $(this).prop('checked')?'yes':'no';
		else
			values[$(this).attr('name')] = $(this).val();
	});
	
	Wait();
	
	evqueueAPI(false,group,action,values,[],function() {
		Message(message);
	});
}

function evqueuePrepareFormAPI(el, group, id)
{
	el.tabs({active:0});
	
	if(id)
	{
		return evqueueAPI(false,group,'get',{id:id},[],function(xml) {
			attributes = xml.documentElement.firstChild.attributes;
			for(var i=0;i<attributes.length;i++)
			{
				var input = el.find("form :input[name='"+attributes[i].name+"']").first();
				if(input.attr('type')=='checkbox')
					input.prop('checked',attributes[i].value=='yes' || attributes[i].value=='1');
				else
					input.val(attributes[i].value);
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
		});
		
		return new jQuery.Deferred().resolve();
	}
}