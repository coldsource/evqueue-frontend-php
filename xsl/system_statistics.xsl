<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	<xsl:import href="templates/workflow.xsl" />
	
	<xsl:variable name="javascript">
	</xsl:variable>
	
	<xsl:template name="content">
		<div class="contentManage">
			<div class="boxTitle statistics">
				<span class="title">Statistics</span>
				<div class="titleAction">
					<xsl:if test="/page/private/logged-in-user/@profile = 'ADMIN'">
						<form action="system_statistics.php" method="post">
							<input type="hidden" name="action" value="reset" />
							<input type="image" src="images/delete.gif" title="Reset Statistics" />
						</form>
					</xsl:if>
				</div>
			</div>
			<table class="statistics">
				<xsl:for-each select="/page/global/statistics/@*">
					<tr class="evenOdd">
						<td class="txtcenter">
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
	</xsl:template>

</xsl:stylesheet>
