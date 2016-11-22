<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

	<xsl:template name="getSelectedItem">
		<xsl:param name="default"/>
		<xsl:param name="condition"/>
		<xsl:param name="indifferent" select="0"/>
		<xsl:param name="with-value" select="0"/>

			<xsl:if test="$indifferent=1">
				<option value="-1">Indifférent</option>
			</xsl:if>

			<xsl:for-each select="$condition">
				<option value="{@value}">
					<xsl:if test="$default = @value">
						 <xsl:attribute name="selected">selected</xsl:attribute>
					</xsl:if>
					<xsl:if test="$with-value = 1">
						<xsl:value-of select="@value" /> - 
					</xsl:if>
					<xsl:value-of select="." />
				</option>
			</xsl:for-each>
	</xsl:template>

</xsl:stylesheet>
