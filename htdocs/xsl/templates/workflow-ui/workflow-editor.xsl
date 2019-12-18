<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

<xsl:template name="workflow-editor">
	<div id='workflow-editor' class="tabs dialog" title="Edit workflow">
		<ul>
			<li><a href="#tab-workflowproperties">Properties</a></li>
			<li><a href="#tab-workflowparameters">Parameters</a></li>
			<li><a href="#tab-workflownotifications">Notifications</a></li>
			<li><a href="#tab-workflowcustomfilters">Custom Filters</a></li>
		</ul>
		<div id="tab-workflowproperties">
			<h2>
				Workflow properties
				<span class="help faicon fa-question-circle" title="Name is mandatory, this will be used from API to launch a new instance.&#10;&#10;Comment and group are optional, they are only used to classify workflows in interface."></span>
			</h2>
			<div class="formdiv">
				<form>
					<div>
						<label class="formLabel" for="wfname">Name</label>
						<input id="wfname" />
					</div>
					<div>
						<label class="formLabel" for="wfgroup">Group</label>
						<input id="wfgroup" class="evq-autocomplete" data-type="workflowgroup" />
					</div>
					<div>
						<label class="formLabel" for="wfcomment">Comment</label>
						<input id="wfcomment" />
					</div>
				</form>
			</div>
		</div>
		<div id="tab-workflowparameters">
			<h2>
				Parameters
				<span class="help faicon fa-question-circle" title="Workflow parameters are provided when a new instance is launched. These parameters can be used in XPath expressions and provided as input to tasks."></span>
			</h2>
			<div class="parameters"></div>
			<span id="add-parameter" class="faicon fa-plus" title="Add parameter"></span>
		</div>
		<div id="tab-workflownotifications">
			<h2>
				Notifications
				<span class="help faicon fa-question-circle" title="Notifications are used to send reports on workflow end.&#10;&#10;You can install plugins that send emails, SMS..."></span>
			</h2>
			<table id="subscribednotifications">
				<tr>
					<th style="width:150px;">Type</th>
					<th>Name</th>
					<th style="width:30px;"></th>
				</tr>
				<xsl:for-each select="/page/notifications/notification">
					<tr class="evenOdd" data-id="{@id}">
						<td class="center" data-param="type_id" data-value="{type-id}">
							<xsl:value-of select="/page/notification-types/notification_type[@id = current()/@type_id]/@name" />
						</td>
						<td data-param="name" data-value="{@name}">
							<xsl:value-of select="@name" />
						</td>
						<td class="tdActions">
							<input type="checkbox" />
						</td>
					</tr>
				</xsl:for-each>
			</table>
		</div>
		<div id="tab-workflowcustomfilters">
			<h2>
				Custom Filters
				<span class="help faicon fa-question-circle" title="Custom Filters may be used to retrieve pieces of information from workflow instances, and search for instances with a given value"></span>
			</h2>
			<table>
				<tbody class="customfilters">
					<tr>
						<th>Name</th>
						<th>Description</th>
						<th>XPath</th>
						<th></th>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</xsl:template>

</xsl:stylesheet>
