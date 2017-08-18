function TasksLibrary()
{
	$.ajax({url: "ajax/tasks-library.php"}).done(function(data) {
		$('#tasks-library').html(data);
	
		$('.task').draggable({
			cursor:'grabbing',
			start:function(event, ui) {
				$(this).draggable('instance').offset.click = { left: Math.floor(ui.helper.width() / 2), top: Math.floor(ui.helper.height() / 2) } ;
			},
			stop: function(event, ui) {
			},
			appendTo: 'body',
			zIndex: 100,
			containment: $('document'),
			helper: 'clone'
		});
	});
}