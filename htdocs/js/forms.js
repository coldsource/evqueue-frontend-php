

function getAjaxData(form_id){
	return data = 'form_id='+form_id+"&" + $('#'+form_id).find('input,select,textarea').serialize();
}

function ajaxField(field,value,void_value) {
	
	if ( Object.prototype.toString.call(value) === '[object Array]' ) {
		return $.map(value, function(val){
			var a = {};
			a[$(field).attr('name')] = val;
			return $.param(a) + '&';
		}).join('');
	} else {
		var a = {};
		a[$(field).attr('name')] = value;
		return $.param(a) + '&';
	}
}

/*
 * @param options = {
 *		params: a javascript object consisting of keys and values: the WS parameters
 *		success: an option function to execute in case of WS execution without error
 * }
 */
function wsfwd (url,options) {
	$.ajax({
		type: 'POST',
		url: site_base+url,
		data: options.params,
		dataType: 'xml',
		success: function(content){
			// success
			if ( $(content).find('error').length == 0 ) {
				if (options.success)
				{
					options.success(content);
				}
			}
			
			// errors?
			$(content).find('error').each( function () {
				switch ($(this).attr('name')) {
					
					case 'confirm':
						if (confirm($(this).text())) {
							options.params.confirm = 'yes';
							wsfwd(url,options);
						}
						break;
						
					case 'no-right':
						alert("You don't have the right to perform this action");
						break;
						
					default:
						alert($(this).text());
						break;
				}
			});
		}
	});
}

availableTags = [];
$(function() {
    $( "input#workflow_group" ).autocomplete({
        source: availableTags,
		minLength:0
    }).bind('focus', function(){ $(this).autocomplete("search"); } );
	
    $( "input#group" ).autocomplete({
        source: availableTags,
		minLength:0
    }).bind('focus', function(){ $(this).autocomplete("search"); } );
});


$(document).on('keyup click', '#binary', function(){
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
			
			$( "input#binary" ).autocomplete({
				source: availableFiles,
				minLength:0
			});
			
			
			$( "input#binary" ).autocomplete("search");
		});
	}
})
