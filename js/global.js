$(document).ready( function() {
	var menu_selected=$('ul.topmenu li.selected').attr('id');
	$('ul.topmenu li').mouseenter(function(event) {
			$('ul.submenu').hide();
			$('ul.submenu#submenu-'+event.target.id).show();
		}
	);
	
	$('ul.submenu').mouseleave(function(events) { 
			$('ul.submenu').hide();
			$('ul.submenu#submenu-'+menu_selected).show();
		}
	);
});
