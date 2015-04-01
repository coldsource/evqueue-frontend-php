<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">

	<xsl:template match="*" mode="xml_display">
		<div style="margin-left:10px;">
			<xsl:text>&lt;</xsl:text>
			<span class="xml_tagname"><xsl:value-of select="name()" /></span>
			<xsl:for-each select="@*">
				<xsl:text>&#160;</xsl:text>
				<span class="xml_attributename"><xsl:value-of select="name()" /></span>
				<xsl:text>="</xsl:text>
				<span class="xml_attributevalue"><xsl:value-of select="." /></span>
				<xsl:text>"</xsl:text>
			</xsl:for-each>
			<xsl:text>&gt;</xsl:text>
			
			<xsl:apply-templates mode="xml_display" />
			
			<xsl:text>&lt;</xsl:text>
			<span class="xml_tagname">/<xsl:value-of select="name()" /></span>
			<xsl:text>&gt;</xsl:text>
		</div>
	</xsl:template>

</xsl:stylesheet>