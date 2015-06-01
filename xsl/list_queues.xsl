<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	<xsl:import href="templates/list_queues.xsl" />
	
	<xsl:variable name="topmenu" select="'settings'" />
	
	<xsl:variable name="javascript">
		<src>js/list-queues.js</src>
	</xsl:variable>

	<xsl:template name="content">
		<div id="queue" class="contentList">
			<br />
			<div class="center"><i>Note : You need to restart evQueue engine after adding or removing a queue</i></div>
			<xsl:call-template name="list_queues"/>
		</div>
    </xsl:template>
	
</xsl:stylesheet>
