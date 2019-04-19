<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:import href="../templates/datetime.xsl" />
	
	<xsl:output method="html"/>
	
	<xsl:template match="/">
		<div>
			<table>
				<tr>
					<th style="width:150px;">Timestamp</th>
					<th style="width:150px;">User</th>
					<th style="width:100px;">Object ID</th>
					<th>Object Name</th>
					<th>Object Type</th>
					<th style="width:150px;">API Group</th>
					<th style="width:100px;">API Action</th>
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
							<xsl:value-of select="@user" />
						</td>
						<td class="center">
							<xsl:value-of select="@object_id" />
						</td>
						<td class="center">
							<xsl:value-of select="@object_name" />
						</td>
						<td class="center">
							<xsl:value-of select="@object_type" />
						</td>
						<td class="center">
							<xsl:value-of select="@group" />
						</td>
						<td class="center">
							<xsl:value-of select="@action" />
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
