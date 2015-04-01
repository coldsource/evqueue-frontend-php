$(document).ready( function() {

});

function deleteTask(id){
	if (confirm("Delete task "+id)){
		ajaxDelete("deleteTask",id,"list-tasks.php");
	}
}