$(document).ready( function() {
	var menu_selected=$('ul.topmenu li.selected').attr('id');
	$('ul.topmenu li').mouseenter(function(event) {
			$('ul.submenu').hide();
			$('ul.submenu#submenu-'+event.target.id).show();
		}
	);
	
	$('.tabs').tabs();
	
	$('.spinner').spinner();
});

function evqueueAPI(options, cbk = false){
	options = $.extend({attributes: [], parameters: []}, options);
	
	if ($(options.element).attr('data-confirm')) {
		if(!confirm($(options.element).data('confirm')))
			return;
	}
	delete options.element;
	
	var promise = new jQuery.Deferred();
	
	$.ajax({
		url: 'ajax/evqueue_api.php',
		type: 'post',
		data: options,
	}).done(function(xml){
		error = $(xml).find('error');
		if ($(error).length > 0) {
			alert(error.html());
			promise.reject();
			return;
		}
		
		if(cbk)
			cbk(xml);
		
		promise.resolve(xml);
	});
	
	return promise;
}

function Wait()
{
	$('html').css('height','calc(100% - 50px)');
	$('body').css('height','calc(100% - 50px)');
	$('body').css("cursor", "wait");
}

function Ready()
{
	$('html').css('height','auto');
	$('body').css('height','auto');
	$('body').css("cursor", "default");
}

function Message(msg)
{
	$('#message').html(msg);
	$('#message').show();
	$('#message').delay(2000).fadeOut();
}


var dialog_currpos = 0;
var dialog_positions = ['left top', 'right top', 'left bottom', 'right bottom'];
jQuery.fn.extend({
  dialogTiled: function(options) {
    return this.each(function() {
			var pos = dialog_positions[dialog_currpos];
			dialog_currpos = (dialog_currpos + 1) % 4;
			
			options.position = {
				my: pos,
				at: pos,
				of: window
			};
      $(this).dialog(options);
    });
  }
});