<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="../../xsl/templates/main-template.xsl" />
	
	<xsl:variable name="javascript">
		<src><xsl:value-of select="$RELPATH" />js/notifications.js</src>
	</xsl:variable>
	
	<xsl:template name="content">
		
		<div class="contentList">
			
			<!-- NOTIFICATIONS -->
			
			<div class="boxTitle">
				<span class="title">Notifications</span>
				<!--<img src="images/plus2.png" title="Add new workflow (simple)" onclick="workflow_edit_method();" class="pointer"/>-->
			</div>
			<table id="notifications">
				<tr class="header">
					<th>ID</th>
					<th>Type</th>
					<th>Name</th>
					<th>Parameters</th>
					<th class="thActions">Actions</th>
				</tr>
				
				<!-- Sample -->
				<tr id="editNotifSample" style="display: none;">
					<td colspan="4">
						<input type="hidden" name="id" autocomplete="off" />
						<div>
							<label class="formLabel">Type</label>
							<select name="type_id">
								<xsl:for-each select="/page/notification-types/notification-type">
									<option value="{@id}"><xsl:value-of select="name" /></option>
								</xsl:for-each>
							</select>
						</div>
						<div>
							<label class="formLabel">Name</label>
							<input name="name" autocomplete="off" />
						</div>
						<label class="formLabel">Parameters</label>
						<div class="parameters">
							...
						</div>
					</td>
					<td class="tdActions">
						<img class="action" src="{$RELPATH}images/ok.png" onclick="saveNotif($(this));" title="Save" />
						<img class="action" src="{$RELPATH}images/cancel.png" onclick="window.location.reload();" title="Cancel" />
					</td>
				</tr>
				
				<!-- Actual Lines -->
				<xsl:for-each select="/page/notifications/notification">
					<tr class="evenOdd">
						<td data-param="id" data-value="{@id}">
							<xsl:value-of select="@id" />
						</td>
						<td data-param="type_id" data-value="{type-id}">
							<xsl:value-of select="/page/notification-types/notification-type[@id = current()/type-id]/name" />
						</td>
						<td data-param="name" data-value="{name}">
							<xsl:value-of select="name" />
						</td>
						<td data-param="parameters">
							...
						</td>
						<td class="tdActions">
							<img class="action" src="{$RELPATH}images/edit.gif" onclick="editNotif($(this));" title="Edit Notification" />
							<img class="action" src="{$RELPATH}images/delete.gif" onclick="deleteNotif({@id});" title="Delete Notification" />
						</td>
					</tr>
				</xsl:for-each>
				
				<tr class="evenOdd createNotif">
					<td colspan="4" />
					<td class="tdActions">
						<img class="action" src="{$RELPATH}images/edition/addTask.png" onclick="createNotif();" />
					</td>
				</tr>
			</table>
			
		</div>
	</xsl:template>
	
</xsl:stylesheet>