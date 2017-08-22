<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	
	<xsl:variable name="topmenu" select="'system-state'" />
	
	<xsl:variable name="javascript">
	</xsl:variable>
	
	<xsl:template name="content">
		<div class="contentManage flexContainer">
			<xsl:for-each select="/page/global">
				<div class="flexContained">
					<div class="boxTitle statistics">
						<span class="title">Statistics (node <xsl:value-of select="@node_name" />)</span>
						<div class="titleAction">
							<xsl:if test="$PROFILE = 'ADMIN'">
								<a href="system_statistics.php?action=reset&amp;node_name={@node_name}"><img class="action" src="images/delete.gif" /></a>
							</xsl:if>
						</div>
					</div>
					<table class="highlight_row">
						<xsl:for-each select="statistics/@*">
							<tr class="evenOdd">
								<td>
									<xsl:variable name="statistic_name" select="local-name(.)" />
									<xsl:value-of select="document('data/statistics.xml')/statistics/statistic[@id=$statistic_name]" />
								</td>
								<td class="txtcenter">
									<xsl:value-of select="."/>
								</td>
							</tr>
						</xsl:for-each>
					</table>
				</div>	
			</xsl:for-each>
		</div>
	</xsl:template>

</xsl:stylesheet>