$(document).ready( function() {

});

function deleteQueue(id){
	if (confirm("Delete queue "+id)){
		evqueueAPI(false, 'queue', 'delete', {'id': id});
		location.reload();
	}
}