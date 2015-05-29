<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	<xsl:import href="templates/workflow.xsl" />
	
	<xsl:variable name="javascript">
	</xsl:variable>
	
	<xsl:template name="content">
		<div class="contentManage">
			<div class="boxTitle statistics">
				<span class="title">Configuration</span>
			</div>
			<table class="statistics">
				<xsl:for-each select="/page/global/configuration/entry">
					<tr class="evenOdd">
						<td class="txtcenter">
							<xsl:value-of select="@name" />
						</td>
						<td class="txtcenter">
							<xsl:if test="@name!='mysql.password'"><xsl:value-of select="@value" /></xsl:if>
							<xsl:if test="@name='mysql.password'">****</xsl:if>
						</td>
					</tr>
				</xsl:for-each>	
			</table>
		</div>	
	</xsl:template>
</xsl:stylesheet>