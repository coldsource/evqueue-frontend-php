<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:output method="xml" indent="no" omit-xml-declaration="yes" encoding="utf-8" doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" />
	
	<xsl:template match="/">
		<xsl:choose>
			<xsl:when test="/page/get/@action = 'view'">
				<xsl:call-template name="parameters-view" />
			</xsl:when>
			<xsl:when test="/page/get/@action = 'edit'">
				<xsl:call-template name="parameters-edit" />
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	
</xsl:stylesheet>