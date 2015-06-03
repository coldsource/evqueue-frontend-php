<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="../../xsl/templates/main-template.xsl" />
	
	<xsl:variable name="topmenu" select="'notifications'" />
	
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
					<th>Description</th>
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
							<xsl:value-of select="description" />
						</td>
						<td>
							<xsl:value-of select="binary" />
						</td>
						<td class="tdActions">
							<form method="post">
								<input type="hidden" name="action" value="delete" />
								<input type="hidden" name="plugin_id" value="{@id}" />
								<input type="image" src="{$RELPATH}images/delete.gif" class="action" title="Uninstall this notification plugin" />
							</form>
						</td>
					</tr>
				</xsl:for-each>
				<tr class="evenOdd createNotifType">
					<td colspan="5">
						<form method="post" enctype="multipart/form-data">
							<input type="file" name="plugin_file" onchange="$(this).parents('form:eq(0)').submit();" />
							Drag-and-drop or browse for a zip file to add a new notification plugin.
							<input type="submit" value="Install" />
						</form>
						<xsl:call-template name="displayErrors" />
					</td>
				</tr>
			</table>
			
		</div>
	</xsl:template>
	
</xsl:stylesheet>