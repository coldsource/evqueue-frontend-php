<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	
	<xsl:variable name="topmenu" select="'logging'" />
	
	<xsl:variable name="javascript">
		<src>js/view-logs.js</src>
	</xsl:variable>

	<xsl:template name="content">
		<div id="queue" class="contentList">
			<br />
			<xsl:for-each select="/page/config/response">
				<div>Current log filter on node <b><xsl:value-of select="@node" /></b> is : <b><xsl:value-of select="configuration/entry[@name = 'logger.db.filter']/@value" /></b></div>
			</xsl:for-each>
			<div id="lastlogs"></div>
		</div>
	</xsl:template>

</xsl:stylesheet>
