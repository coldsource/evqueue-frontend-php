<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="../../xsl/templates/main-template.xsl" />
	
	<xsl:variable name="javascript">
		<src><xsl:value-of select="$RELPATH" />js/notifications.js</src>
	</xsl:variable>
	
	<xsl:template name="content">
		
		<div class="contentList">
			
			<div class="boxTitle">
				<span class="title">Notification Plugins</span>
			</div>
			<table id="notificationTypes">
				<tr>
					<th>ID</th>
					<th>Name</th>
					<th>Binary</th>
					<th class="thActions">Actions</th>
				</tr>
				
				<xsl:for-each select="/page/notification-types/notification-type">
					<tr class="evenOdd">
						<td>
							<xsl:value-of select="@id" />
						</td>
						<td>
							<xsl:value-of select="name" />
						</td>
						<td>
							<xsl:value-of select="binary" />
						</td>
						<td class="tdActions" />
					</tr>
				</xsl:for-each>
				<tr class="evenOdd createNotifType">
					<td colspan="4">
						<input type="file" name="file" />
						Drag-and-drop or browse for a zip file to add a new notification plugin.
					</td>
				</tr>
			</table>
			
		</div>
	</xsl:template>
	
</xsl:stylesheet>