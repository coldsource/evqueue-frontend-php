$(document).ready( function() {

});

function deleteQueue(id){
	if (confirm("Delete queue "+id)){
		ajaxDelete("deleteQueue",id,"list-queues.php");
	}
}