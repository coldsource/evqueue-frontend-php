$(document).ready(function() {
	// Manage autorefresh
	function autoRefresh() {
		if(!$('.autorefresh').attr('checked'))
			return;
		$.ajax({
			url: 'ajax/last-logs.php',
			success: function (content) {
				$('#lastlogs').html(content);
			}
		});
	}
	setInterval(autoRefresh,2000 );
});