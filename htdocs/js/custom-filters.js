 /*
  * This file is part of evQueue
  * 
  * evQueue is free software: you can redistribute it and/or modify
  * it under the terms of the GNU General Public License as published by
  * the Free Software Foundation, either version 3 of the License, or
  * (at your option) any later version.
  * 
  * evQueue is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  * GNU General Public License for more details.
  *
  * You should have received a copy of the GNU General Public License
  * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
  * 
  * Author: Nicolas JEAN
  */

$(document).delegate(
	'.instance-xml-output .xml_tagname, .instance-xml-output .xml_attributename, .instance-xml-output .xml_attributevalue',
	'click',
	function () {
	
	var xml = $(this).parents('.instance-xml-output:eq(0)');
	xml.find('.user_selected').removeClass('user_selected');
	$(this).addClass('user_selected');
	
	$('input[name=xpath_expr]').val(get_xpath($(this)));
});


$(document).delegate('input[name=filter_on_taskpath], input[name=filter_on_inputname], input[name=filter_on_paramname]', 'click', function () {
	$('.user_selected').click();
});


function get_xpath (el)
{
	var filter_on_taskpath = $('input[name=filter_on_taskpath]').is(':checked');
	var filter_on_inputname = $('input[name=filter_on_inputname]').is(':checked');
	var filter_on_paramname = $('input[name=filter_on_paramname]').is(':checked');
	
	var parent = el.parents('.parent_tag:eq(0)');
	
	if (el.is('.xml_tagname'))
		return get_xpath(parent);
	
	if (el.is('.xml_attributename'))
		return get_xpath(parent) + '/@' + el.text();
	
	if (el.is('.xml_attributevalue'))
		return get_xpath(el.prevAll('.xml_attributename:eq(0)'));
	
	if (el.is('.parent_tag'))
	{
		var tag = el.children('.xml_tagname:first');
		var tagname = tag.text();
		
		var filter= '';
		if (tagname == 'task' && filter_on_taskpath)       filter = '[@path="' + tag.data('path') + '"]';
		if (tagname == 'input' && filter_on_inputname)     filter = '[@name="' + tag.data('name') + '"]';
		if (tagname == 'parameter' && filter_on_paramname) filter = '[@name="' + tag.data('name') + '"]';
		
		if (parent.length == 0)
			return '/' + tagname + filter;
		
		return get_xpath(parent) + '/' + tagname + filter;
	}
	
	return '(error)';
}


$(document).delegate('form.add-custom-filter', 'submit', function () {
	var _form = $(this);
	var instance_id = _form.find('input[name=instance_id]').val();
	
	GetWorkflowXML(instance_id).done(function(wf)
	{
		// Add custom filter in workflow's XML
		var filters = wf.xml.Query('/response/workflow/workflow/custom-filters',wf.xml);
		if (filters.length == 0) {
			filters = wf.xml.createElement('custom-filters');
			
			var subjobs = wf.xml.Query('/response/workflow/workflow/subjobs',wf.xml)[0];
			wf.xml.Query('/response/workflow/workflow',wf.xml)[0].insertBefore(filters, subjobs);
				
		} else {
			filters = filters[0];
		}
		
		var filter = wf.xml.createElement('custom-filter');
		filter.setAttribute('name',        _form.find('input[name=custom_filter_name]').val());
		filter.setAttribute('select',      _form.find('input[name=xpath_expr]').val());
		filter.setAttribute('description', _form.find('input[name=custom_filter_desc]').val());
		filters.appendChild(filter);
		
		SaveWorkflow (wf.id, wf.xml);
	});
	
	return false;
});


function GetWorkflowXML (instance_id)
{
	var promise = new jQuery.Deferred();  // global promise to return, which waits for all evqueueAPI calls
	
	// Get instance to find workflow name
	evqueueAPI({
		group: 'instance',
		action: 'query',
		attributes: {id: instance_id},
	}).done(function(xml) {
		var wf_name = xml.Query('/response/workflow/@name',xml)[0].nodeValue;
		var workflow_id = WorkflowIDs.Get(wf_name);
		
		// Get workflow XML
		evqueueAPI({
			group: 'workflow',
			action: 'get',
			attributes: {id: workflow_id},
		}).done(function(xml) {
			promise.resolve({
				id : workflow_id,
				xml: xml
			});
		})
	});
	
	return promise;
}


function SaveWorkflow (workflow_id, xml)
{
	var name    = xml.Query('/response/workflow/@name',    xml)[0].nodeValue;
	var group   = xml.Query('/response/workflow/@group',   xml)[0].nodeValue;
	var comment = xml.Query('/response/workflow/@comment', xml)[0].nodeValue;
	
	var workflow_xml = new XMLSerializer().serializeToString(xml.Query('/response/workflow/workflow',xml)[0]);
	
	evqueueAPI({
		group: 'workflow',
		action: 'edit',
		attributes: {
			id: workflow_id,
			name: name,
			group: group,
			comment: comment,
			content: b64EncodeUnicode(workflow_xml)
		}
	}).done(function() {
		alert('Custom filter has been saved');
	});
}
