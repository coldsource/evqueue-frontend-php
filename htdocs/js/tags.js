function TagsDialog(instance_id)
{
	var dialog = $('#tags-dialog');
	
	RefreshInstanceTags(instance_id,$('#instance-tags .tags-list'));
	RefreshTags($('#tags-management'));
	
	dialog.tabs();
	dialog.dialogTiled({
		width:'auto',
		height:'auto',
		title:'Tags management',
	});
	
	dialog.delegate('form','submit',function() {
		Tag(instance_id,$('#tag_label').val());
		return false;
	});
	
	dialog.delegate('span.fa-check','click',function() {
		Tag(instance_id,$('#tag_label').val());
	});
	
	dialog.delegate('#instance-tags span.fa-remove','click',function() {
		Untag(instance_id,$(this).parent().data('id'));
	});
	
	dialog.delegate('#tags-management span.fa-remove','click',function() {
		RemoveTag($(this).parent().data('id'));
	});
}

function RefreshInstanceTags(wfid,tags_container)
{
	evqueueAPI({
		group: 'instances',
		action: 'list',
		attributes: {filter_id:wfid},
	}).done(function(xml) {
		tags_container.empty();
		$(xml).find("tag").each(function() {
			tags_container.append('<span class="faicon fa-tag tag" data-id="'+$(this).attr('id')+'">&#160;'+$(this).attr('label')+'<span class="faicon fa-remove"></span></span>');
		});
	});
}

function RefreshTags(tags_container)
{
	evqueueAPI({
		group: 'tags',
		action: 'list',
	}).done(function(xml) {
		tags_container.empty();
		$(xml).find('tag').each(function() {
			tags_container.append('<span class="faicon fa-tag tag" data-id="'+$(this).attr('id')+'">&#160;'+$(this).attr('label')+'<span class="faicon fa-remove"></span></span>');
		});
	});
}

function Tag(wfid, tag_label)
{
	evqueueAPI({
		group: 'tag',
		action: 'create',
		attributes: {label:tag_label},
	}).done(function(xml) {
		tag_id = xml.documentElement.getAttribute('tag-id');
		evqueueAPI({
			group: 'instance',
			action: 'tag',
			attributes: {id:wfid, tag_id:tag_id},
		}).done(function(xml) {
			Message('Tagged instance '+wfid);
			RefreshInstanceTags(wfid,$('#instance-tags .tags-list'));
			RefreshTags($('#tags-management'));
			$('#tag_label').val('');
			$('#tag_label').autocomplete('close');
		});
	});
} 

function Untag(wfid, tag_id)
{
	evqueueAPI({
		group: 'instance',
		action: 'untag',
		attributes: {id:wfid, tag_id:tag_id},
	}).done(function(xml) {
		Message('Untagged instance '+wfid);
		RefreshInstanceTags(wfid,$('#instance-tags .tags-list'));
	});
}

function RemoveTag(tag_id)
{
	evqueueAPI({
		group: 'tag',
		action: 'delete',
		attributes: {id:tag_id},
	}).done(function(xml) {
		Message('Tag removed');
		RefreshTags($('#tags-management'));
	});
}
