<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	
	<xsl:variable name="topmenu" select="'notifications'" />
	
	<xsl:variable name="javascript">
		<src>js/notification.js</src>
	</xsl:variable>
	
	<xsl:template name="content">
	
		<div id="notification-configuration" class="dialog"></div>
		
		<div id="notification-type-chooser" class="dialog">
			<div class="formdiv">
				<form>
					<div>
						<label>Notification type</label>
						<select name="notification-type">
							<xsl:for-each select="/page/notification-types/notification_type">
								<option value="{@id}"><xsl:value-of select="@name" /></option>
							</xsl:for-each>
						</select>
					</div>
				</form>
			</div>
			<br />
			<button class="submit">Create new notification</button>
		</div>
		
		<div id="list-notifications"></div>
		
	</xsl:template>
	
</xsl:stylesheet>