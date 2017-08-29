<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	
	<xsl:variable name="topmenu" select="'logging'" />
	
	<xsl:template name="content">
		<xsl:for-each select="/page/config/response">
			<div>Current log filter on node <b><xsl:value-of select="@node" /></b> is : <b><xsl:value-of select="configuration/entry[@name = 'logger.db.filter']/@value" /></b></div>
		</xsl:for-each>
		
		<br />
		<div class="evq-autorefresh" data-url="ajax/last-logs.php" data-interval="2">
			<div class="boxTitle">
				<span class="title">
					Last logs <span class="faicon fa-refresh action evq-autorefresh-toggle"></span>
				</span>
			</div>
			<div class="evq-autorefresh-pannel"></div>
		</div>
	</xsl:template>

</xsl:stylesheet>
