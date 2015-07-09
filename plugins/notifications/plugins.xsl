<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="../../xsl/templates/main-template.xsl" />
	
	<xsl:variable name="topmenu" select="'notifications'" />
	
	<xsl:variable name="javascript">
		<src>js/notifications-type.js</src>
	</xsl:variable>
	
	<xsl:template name="content">
		
		<div style="text-align: center; margin-top: 2em;">
			<form method="post" enctype="multipart/form-data">
				<input type="file" name="plugin_file" onchange="$(this).parents('form:eq(0)').submit();" />
				Drag-and-drop or browse for a zip file to add a new notification plugin.
				<input type="submit" value="Install" />
			</form>
			<xsl:call-template name="displayErrors" />
		</div>
		
		<div class="contentList">
			
			<div class="boxTitle">
				<span class="title">Notification Plugins </span><br/>
				<span style="color:red;"> <xsl:value-of select="/page/notices"/> </span>
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
						<td data-param="id" data-value="{@id}">
							<xsl:value-of select="@id" />
						</td>
						<td data-param="name" data-value="{name}">
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
								<img class="action" src="{$SITE_BASE}images/edit.gif" onclick="editNotifType($(this));" title="Edit Notification type" />
								<xsl:text>&#160;</xsl:text> 
								<input type="image" src="{$SITE_BASE}images/delete.gif" class="action" title="Uninstall this notification plugin" />
							</form>
						</td>
					</tr>
				</xsl:for-each>
				
				<tr class="parameters"></tr>
			</table>
			
		</div>
	</xsl:template>
	
</xsl:stylesheet>