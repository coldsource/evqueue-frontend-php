<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:output method="html"/>

	<xsl:template match="/">
		<div>
			<div class="boxTitle">
				<span class="title">Queues (<xsl:value-of select="count(/page/queues/queue)" /> active queues, total concurrency is <xsl:value-of select="sum(/page/queues/queue/@concurrency)" />)</span>
				<span class="faicon fa-file-o action" title="Add new queue"></span>
			</div>
			<table>
				<tr>
					<th>Name</th>
					<th style="width:100px;">Scheduler</th>
					<th style="width:50px;">Concurrency</th>
					<th style="width:50px;">Dynamic</th>
					<th class="thActions">Actions</th>
				</tr>

				<xsl:for-each select="/page/queues/queue">
					<tr class="evenOdd" data-id="{@id}">
						<td>
							<xsl:value-of select="@name" />
						</td>
						<td class="txtcenter">
							<xsl:value-of select="@scheduler" />
						</td>
						<td class="center">
							<xsl:value-of select="@concurrency" />
						</td>
						<td class="center"><xsl:value-of select="@dynamic" /></td>
						<td class="tdActions">
							<span class="faicon fa-edit" title="Edit queue"></span>
							<span class="faicon fa-remove" title="Delete queue"></span>
						</td>
					</tr>
				</xsl:for-each>
			</table>
		</div>
	</xsl:template>

</xsl:stylesheet>
