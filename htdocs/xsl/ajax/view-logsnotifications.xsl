<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:import href="../templates/datetime.xsl" />
	
	<xsl:output method="html"/>
	
	<xsl:template match="/">
		<div>
			<table>
				<tr>
					<th style="width:150px;">Timestamp</th>
					<th style="width:150px;">PID</th>
					<th>Message</th>
					<th style="width:100px;">Node</th>
				</tr>
				
				<xsl:for-each select="/page/logs/log">
					<tr class="evenOdd">
						<td class="center">
							<xsl:call-template name="displayDateAndTime">
								<xsl:with-param name="datetime_start" select="@timestamp" />
							</xsl:call-template>
						</td>
						<td class="center">
							<xsl:value-of select="@pid" />
						</td>
						<td>
							<xsl:value-of select="@message" />
						</td>
						<td class="center">
							<xsl:value-of select="@node" />
						</td>
					</tr>
				</xsl:for-each>
			</table>
		</div>
	</xsl:template>

</xsl:stylesheet>
