<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	<xsl:import href="templates/view-logs.xsl" />
	
	<xsl:variable name="javascript">
		<src>js/view-logs.js</src>
	</xsl:variable>

	<xsl:template name="content">
		<div id="queue" class="contentList">
			<div id="lastlogs">
				<xsl:call-template name="last-logs" />
			</div>
		</div>
	</xsl:template>

</xsl:stylesheet>
