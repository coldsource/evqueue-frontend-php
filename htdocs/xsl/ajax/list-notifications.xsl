<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:output method="html"/>

	<xsl:template match="/">
		<div>
			<div class="boxTitle">
				<span class="title">Notifications</span>
				<span class="faicon fa-file-o action" title="Create new notification"></span>
			</div>
			<table id="notificationsTable">
				<tr class="header">
					<th style="width:150px;">Type</th>
					<th>Name</th>
					<th class="thActions">Actions</th>
				</tr>
				
				<!-- Actual Lines -->
				<xsl:for-each select="/page/notifications/notification">
					<tr class="evenOdd" data-id="{@id}" data-type-id="{@type_id}">
						<td class="center" data-param="type_id" data-value="{type-id}">
							<xsl:value-of select="/page/notification-types/notification_type[@id = current()/@type_id]/@name" />
						</td>
						<td data-param="name" data-value="{@name}">
							<xsl:value-of select="@name" />
						</td>
						<td class="tdActions">
							<span class="faicon fa-cogs" title="Edit configuration"></span>
							<span class="faicon fa-remove" title="Delete notification"></span>
						</td>
					</tr>
				</xsl:for-each>
			</table>
			
		</div>
	</xsl:template>

</xsl:stylesheet>
