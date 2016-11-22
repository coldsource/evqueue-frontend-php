<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:import href="datetime.xsl" />
	
	<xsl:variable name="javascript">
	</xsl:variable>

	<xsl:template name="last-logs">
		<div class="boxTitle">
			<span class="title">
				Last logs
				<input type="checkbox" class="autorefresh" checked="checked" />&#160;Auto-refresh
			</span>
		</div>
		<table>
			<tr>
				<th style="width:150px;">Timestamp</th>
				<th style="width:100px;">Severity</th>
				<th style="width:100px;">Node</th>
				<th>Message</th>
			</tr>
			
			<xsl:for-each select="/page/logs/log">
				<tr class="evenOdd">
					<td class="center">
						<xsl:call-template name="displayDateAndTime">
							<xsl:with-param name="datetime_start" select="@timestamp" />
						</xsl:call-template>
					</td>
					<td class="center">
						<xsl:attribute name="style">
							<xsl:choose>
								<xsl:when test="@level = 'LOG_EMERG'">background-color:#FF0000;</xsl:when>
								<xsl:when test="@level = 'LOG_ALERT'">background-color:#FF1A13;</xsl:when>
								<xsl:when test="@level = 'LOG_CRIT'">background-color:#FF4B23;</xsl:when>
								<xsl:when test="@level = 'LOG_ERR'">background-color:#FF823E;</xsl:when>
								<xsl:when test="@level = 'LOG_WARNING'">background-color:#FFA149;</xsl:when>
								<xsl:when test="@level = 'LOG_NOTICE'">background-color:#67FF41;</xsl:when>
								<xsl:when test="@level = 'LOG_INFO'">background-color:#90FF8A;</xsl:when>
								<xsl:when test="@level = 'LOG_DEBUG'">background-color:#FF0000;</xsl:when>
							</xsl:choose>
						</xsl:attribute>
						<b><xsl:value-of select="@level" /></b>
					</td>
					<td class="center">
						<xsl:value-of select="@node" />
					</td>
					<td>
						<xsl:value-of select="@message" />
					</td>
				</tr>
			</xsl:for-each>
		</table>
	</xsl:template>

</xsl:stylesheet>
