

function ajaxPost(form_id,newurl,submit_form,confirmed){
	
	var params = getAjaxData(form_id);
	if (typeof(confirmed) != 'undefined' && confirmed == 'yes') {
		params += 'confirm=yes';
		$('#'+form_id).append('<input type="hidden" name="confirm" value="yes" />');
	}
	
	$.ajax({
		type: 'POST',
		url: 'ajax/wsfwd.php',
		data: params,
		dataType: 'xml',
		success: function(content){

			if ( $(content).find('error').length == 0 ) {
				if (submit_form == true){
					$('#'+form_id).submit();
				}else{
					if (newurl != ""){
						window.location.href = newurl;
					}					
				}
			}else {
				$(content).find('error').each( function () {
					if ($(this).attr('name') == 'confirm') {
						if (confirm($(this).text()))
							ajaxPost(form_id,newurl,submit_form,'yes');
						
					} else if ($(this).attr('name') == 'no-right') {
						alert("You don't have the right to perform this action");
						
					} else {
						alert($(this).text());
					}
				});
			}
		}
	});
}

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

function ajaxDelete(objAction,id,newurl,params){
	
	if (typeof(params) == 'undefined')
		params = {};
	params.form_id = objAction;
	params.id = id;
	
	$.ajax({
		type: 'POST',
		url: 'ajax/wsfwd.php',
		data: params,
		dataType: 'xml',
		success: function(content){
			if ( $(content).find('error').length == 0 ) {
				if (newurl != ""){
					window.location.href = newurl;
				}
			}else {
				$(content).find('error').each( function () {
					if ($(this).attr('name') == 'confirm') {
						if (confirm($(this).text()))
							ajaxDelete(objAction,id,newurl,{confirm: 'yes'});
						
					} else if ($(this).attr('name') == 'no-right') {
						alert("You don't have the right to perform this action");
						
					} else {
						alert($(this).text());
					}
				});
			}
		}
	});
	
}

/*
 * @param options = {
 *		params: a javascript object consisting of keys and values: the WS parameters
 *		success: an option function to execute in case of WS execution without error
 * }
 */
function wsfwd (options) {
	$.ajax({
		type: 'POST',
		url: 'ajax/wsfwd.php',
		data: options.params,
		dataType: 'xml',
		success: function(content){
			
			// success
			if ( $(content).find('error').length == 0 ) {
				if (options.success)
					options.success();
			}
			
			// errors?
			$(content).find('error').each( function () {
				switch ($(this).attr('name')) {
					
					case 'confirm':
						if (confirm($(this).text())) {
							options.params.confirm = 'yes';
							wsfwd(options);
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
	
    $( "input#task_group" ).autocomplete({
        source: availableTags,
		minLength:0
    }).bind('focus', function(){ $(this).autocomplete("search"); } );
});