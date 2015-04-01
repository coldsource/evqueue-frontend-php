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

function deleteWorkflow(id){
	if (confirm("Delete workflow "+id)){
		ajaxDelete("deleteWorkflow",id,"list-workflows.php");
	}
}

function workflow_edit_method()
{
	$( "#workflow_edit_select" ).dialog({
		buttons: [
			{ text: "Simple", click: function() { window.location='manage-simple-workflow.php'; } },
			{ text: "Text", click: function() { window.location='manage-workflow.php'; } },
			{ text: "GUI", click: function() { window.location='manage-workflow-gui.php'; } }
		]
	});
}