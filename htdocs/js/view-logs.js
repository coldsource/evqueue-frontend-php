$(document).ready(function() {
	// Manage autorefresh
	function autoRefresh(force = false) {
		if(!force && !$('.autorefresh').attr('checked'))
			return;
		$.ajax({
			url: 'ajax/last-logs.php',
			success: function (content) {
				$('#lastlogs').html(content);
			}
		});
	}
	
	autoRefresh(true);
	setInterval(autoRefresh,2000 );
});