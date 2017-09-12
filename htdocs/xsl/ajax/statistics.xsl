<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:output method="html"/>

	<xsl:template match="/">
		<div class="contentManage flexContainer">
			<xsl:for-each select="/page/global/response">
				<div class="flexContained">
					<div class="boxTitle">
						<span class="title">Statistics (node <xsl:value-of select="@node" />)</span>
						<span class="faicon fa-remove action" title="Reset statistics" data-node="{@node}"></span>
					</div>
					<table class="highlight_row">
						<xsl:choose>
							<xsl:when test="count(@err) > 0">
								<tr><td colspan="2" class="center">Node is offline</td></tr>
							</xsl:when>
							<xsl:otherwise>
								<xsl:for-each select="statistics/@*">
									<tr class="evenOdd">
										<td>
											<xsl:variable name="statistic_name" select="local-name(.)" />
											<xsl:value-of select="document('../data/statistics.xml')/statistics/statistic[@id=$statistic_name]" />
										</td>
										<td class="txtcenter">
											<xsl:value-of select="."/>
										</td>
									</tr>
								</xsl:for-each>
							</xsl:otherwise>
						</xsl:choose>
					</table>
				</div>	
			</xsl:for-each>
		</div>
	</xsl:template>

</xsl:stylesheet>
