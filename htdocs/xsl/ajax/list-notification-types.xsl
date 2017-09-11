<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:output method="html"/>

	<xsl:template match="/">
		<div>
			<div class="boxTitle">
				<span class="title">Notification Plugins </span><br/>
				<span style="color:red;"> <xsl:value-of select="/page/notices"/> </span>
			</div>
			<table id="notificationTypes">
				<tr>
					<th style="width:15%">Name</th>
					<th>Description</th>
					<th class="thActions">Actions</th>
				</tr>
				
				<xsl:for-each select="/page/response-notifications-types/notification_type">
					<tr class="evenOdd" data-id="{@id}" data-type="{@name}">
						<td data-param="name" data-value="{@name}">
							<xsl:value-of select="@name" />
						</td>
						<td>
							<xsl:value-of select="@description" />
						</td>
						<td class="tdActions">
							<form method="post">
								<input type="hidden" name="action" value="delete" />
								<input type="hidden" name="plugin_id" value="{@id}" />
								<input type="hidden" name="plugin_name" value="{@name}" />
								<span class="faicon fa-cogs" title="Configure this plugin"></span>
								<span class="faicon fa-remove" title="Remove this plugin"></span>
							</form>
						</td>
					</tr>
				</xsl:for-each>
			</table>
		</div>
	</xsl:template>

</xsl:stylesheet>
