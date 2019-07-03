<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	
	<xsl:variable name="topmenu" select="'logging'" />
	
	<xsl:template name="content">
		<div class="evq-autorefresh" data-url="ajax/last-logsnotifications.php" data-interval="2">
			<div class="boxTitle">
				<span class="title">
					Last logs <span class="faicon fa-refresh action evq-autorefresh-toggle"></span>
				</span>
			</div>
			<div class="evq-autorefresh-pannel"></div>
		</div>
	</xsl:template>

</xsl:stylesheet>
