<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:php="http://php.net/xsl">
	<xsl:import href="templates/main-template.xsl" />
	<xsl:import href="templates/git.xsl" />

	<xsl:variable name="topmenu" select="'settings'" />

   <xsl:template name="content">
   <table>
		<xsl:for-each select="/page/request-status/node">
			<tr><td colspan="2"><xsl:value-of select="@scheme" /></td></tr>
			<tr>
				<td style="width:150px">Node status</td>
				<td>
					<xsl:choose>
						<xsl:when test="@name != ''"><span class="success">UP</span></xsl:when>
						<xsl:otherwise><span class="error">DOWN</span></xsl:otherwise>
					</xsl:choose>
				</td>
			</tr>
			
			<xsl:if test="@name != ''">
				<tr>
					<td>Node name</td>
					<td><xsl:value-of select="@name" /></td>
				</tr>
				<tr>
					<td>Uptime</td>
					<td><xsl:value-of select="php:function('humanTime',string(/page/cluster-response/response[@node = current()/@name]/@uptime))" /> seconds</td>
				</tr>
				<tr>
					<td>Node version</td>
					<td><xsl:value-of select="/page/cluster-response/response[@node = current()/@name]/@version" /></td>
				</tr>
				<tr>
					<td>Git support</td>
					<td><xsl:value-of select="/page/cluster-response/response[@node = current()/@name]/@git-support" /></td>
				</tr>
			</xsl:if>
			
			<tr class="groupspace"><td colspan="2"></td></tr>
		</xsl:for-each>
	</table>
	</xsl:template>
	
</xsl:stylesheet>
