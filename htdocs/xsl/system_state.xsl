<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	
	<xsl:variable name="topmenu" select="'system-state'" />
	
	<xsl:variable name="javascript">
	</xsl:variable>
	
	<xsl:template name="content">
		<div id="queues"></div>
		
		<script src="https://unpkg.com/react@16/umd/react.development.js" crossorigin="crossorigin"></script>
		<script src="https://unpkg.com/react-dom@16/umd/react-dom.development.js" crossorigin="crossorigin"></script>
		<script src="js/react/app.js"></script>
	</xsl:template>

</xsl:stylesheet>
