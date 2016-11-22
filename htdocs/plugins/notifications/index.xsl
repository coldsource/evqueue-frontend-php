<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="../../xsl/templates/main-template.xsl" />
	
	<xsl:variable name="topmenu" select="'notifications'" />
	
	<xsl:variable name="javascript">
		<src>js/notifications.js</src>
	</xsl:variable>
	
	<xsl:template name="content">
		
		<div class="contentList">
			
			<!-- NOTIFICATIONS -->
			
			<div class="boxTitle">
				<span class="title">Notifications</span>
				<img class="action" src="{$SITE_BASE}images/plus3.png" onclick="createNotif();" />
			</div>
			<table id="notificationsTable">
				<tr class="header">
					<th>ID</th>
					<th>Type</th>
					<th>Name</th>
					<th>Parameters</th>
					<th class="thActions">Actions</th>
				</tr>
				
				<!-- Sample -->
				<tr id="editNotifSample" style="display: none;">
					<td colspan="4" style="padding:0;">
						<table class="edit_notif">
							<tr>
								<td colspan="2"> <input type="hidden" name="id" autocomplete="off" /> </td>
							</tr>
							<tr>
								<td class="formLabel">
										<label class="formLabel">Type </label>
								</td>
								
								<td>
										<select name="type_id">
											<xsl:for-each select="/page/response-notification-types/notification_type">
												<option value="{@id}"><xsl:value-of select="@name" /></option>
											</xsl:for-each>
										</select>
								</td>
							</tr>
							<tr>
								<td>
								
										<label class="formLabel">Name</label>
								</td>
								<td>
										<input name="name" autocomplete="off" />
								</td>
							</tr>
							
							<tr>
								<td colspan="2">
									<label class="formLabel" style="font-size: 13px;"><b>Parameters :</b></label>
								</td>
							</tr>
								
							<tr>
								<td colspan="2" style="border-spacing: 0; padding:0;" >
									<div class="parameters" style="margin:0; padding:0;">
										...
									</div>
								</td>
							</tr>
							
						</table>
						
					</td>
					
					<td class="tdActions" style="padding:0;">
						<img class="action" src="{$SITE_BASE}images/ok.png" onclick="saveNotif($(this));" title="Save" />
						<img class="action" src="{$SITE_BASE}images/cancel.png" onclick="window.location.reload();" title="Cancel" />
					</td>
				</tr>
				
				<!-- Actual Lines -->
				<xsl:for-each select="/page/response-notifications/notification">
					<tr class="evenOdd">
						<td data-param="id" data-value="{@id}">
							<xsl:value-of select="@id" />
						</td>
						<td data-param="type_id" data-value="{type-id}">
							<xsl:value-of select="/page/response-notification-types/notification_type[@id = current()/@type_id]/@name" />
						</td>
						<td data-param="name" data-value="{@name}">
							<xsl:value-of select="@name" />
						</td>
						<td data-param="parameters">
							...
						</td>
						<td class="tdActions">
							<img class="action" src="{$SITE_BASE}images/edit.gif" onclick="editNotif($(this));" title="Edit Notification" />
							<xsl:text>&#160;</xsl:text>
							<img class="action" src="{$SITE_BASE}images/delete.gif" onclick="deleteNotif({@id});" title="Delete Notification" />
						</td>
					</tr>
				</xsl:for-each>
				
				<tr class="evenOdd createNotif">
					<td colspan="5" />
				</tr>
			</table>
			
		</div>
	</xsl:template>
	
</xsl:stylesheet>