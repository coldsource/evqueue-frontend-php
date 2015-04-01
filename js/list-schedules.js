$(document).ready( function() {

	$(document).delegate( '.bigger', 'click', function() {
		
		if ($(this).parent().children("div.content_xml").is(":visible")){
			$(this).parent().children("div.content_xml").css("display","none")
			$(this).parent().children("div.content_xml_resume").css("display","block")
		}else{
			$(this).parent().children("div.content_xml").css("display","block")
			$(this).parent().children("div.content_xml_resume").css("display","none")
		}
	});	
	
	
});

function deleteSchedule(id){
	if (confirm("Delete schedule "+id)){
		ajaxDelete("deleteSchedule",id,"list-schedules.php");
	}
}