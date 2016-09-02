
$(document).ready( function () {
	createWorkflow();
});

$(document).on('change', '#create_workflow', function () {
	createWorkflow();
});

$

function createWorkflow() {
	if ($('#create_workflow').is(':checked')) {
		 $( "input#group" ).autocomplete({
			source: availableTagsWF,
			minLength:0
		}).bind('focus', function(){ $(this).autocomplete("search"); } );
	}
	else{
		$( "input#group" ).autocomplete({
			source: availableTags,
			minLength:0
		}).bind('focus', function(){ $(this).autocomplete("search"); } );
	}
}