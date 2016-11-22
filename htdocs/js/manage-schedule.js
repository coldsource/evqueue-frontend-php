


$(document).delegate( 'img.deleteLevel', 'click', function () {
	$(this).parents('tr:first').remove();
});

$(document).delegate( 'img.addLevel', 'click', function () {
	$(this).parents('tr:first').before('<tr><td><input type="text" name="retry_delay[]" /></td><td><input type="text" name="retry_times[]" /></td><td><img src="images/edition/delete.png" class="deleteLevel" title="Delete" /></td></tr>');
});
