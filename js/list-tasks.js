

function deleteTask(id,name){
	$('#deleteTaskDlg').find('span.taskName').text(name);
	$('#deleteTaskDlg').find('span.taskId').text(id);
	$('#deleteTaskDlg').dialog({modal: true});
}