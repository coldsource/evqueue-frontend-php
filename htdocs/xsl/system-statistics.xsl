<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	
	<xsl:variable name="topmenu" select="'system-state'" />
	
	<xsl:variable name="javascript">
		<src>js/system-statistics.js</src>
	</xsl:variable>
	
	<xsl:template name="content">
		<div class="evq-autorefresh" data-url="ajax/statistics.php" data-interval="1">
			<div class="evq-autorefresh-pannel"></div>
		</div>
	</xsl:template>

</xsl:stylesheet>
