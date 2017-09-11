<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	
	<xsl:variable name="topmenu" select="'notifications'" />
	
	<xsl:variable name="javascript">
		<src>js/notification-types.js</src>
	</xsl:variable>
	
	<xsl:template name="content">
		
		<div id="plugin-configuration" class="dialog"></div>
		
		<div class="center">
			<form method="post" enctype="multipart/form-data">
				<input type="file" name="plugin_file" onchange="$(this).parents('form:eq(0)').submit();" />
				Drag-and-drop or browse for a zip file to add a new notification plugin.
				<input type="submit" value="Install" />
			</form>
			<xsl:call-template name="displayErrors" />
		</div>
		
		<br />
		
		<div id="list-notification-types"></div>
	</xsl:template>
	
</xsl:stylesheet>