<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="../templates/workflow.xsl" />
	<xsl:output method="xml" indent="yes" omit-xml-declaration="yes" encoding="utf-8" doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" />
	
	<xsl:template match="/page">
		<xsl:call-template name="instances">
			<xsl:with-param name="instances" select="/page/instances/workflow" />
			<xsl:with-param name="status" select="'TERMINATED'" />
		</xsl:call-template>
	</xsl:template>
	
</xsl:stylesheet>
