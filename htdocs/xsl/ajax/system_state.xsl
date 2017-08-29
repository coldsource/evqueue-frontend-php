<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:output method="html" indent="yes" omit-xml-declaration="yes" encoding="utf-8" doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" />
	
	<xsl:key name="groups" match="/page/tasks/task/@group" use="." />
	
	<xsl:template match="/">
		<div>
			<xsl:for-each select="/page/statistics/response">
				<div id="node-{@node}">
					<table>
						<tr>
							<th>Name</th>
							<th>Scheduler</th>
							<th>Concurrency</th>
							<th>Running tasks</th>
							<th>Queued tasks</th>
						</tr>

						<xsl:for-each select="statistics/queue">
							<tr class="evenOdd">
								<td>
									<xsl:value-of select="@name" />
								</td>
								<td class="center">
									<xsl:value-of select="@scheduler" />
								</td>
								<td class="center">
									<xsl:value-of select="@concurrency" />
								</td>
								<td>
									<xsl:variable name="queue_prct" select="@running_tasks div @concurrency * 100" />
									<div class="prctgradient">
										<div style="background:linear-gradient(to right,transparent {$queue_prct}%,white {$queue_prct}%);">
											<div style="text-align:right;width:{$queue_prct}%"><xsl:value-of select="round($queue_prct)" />%</div>
										</div>
									</div>
									<xsl:value-of select="@running_tasks" /> task<xsl:if test="@running_tasks > 1">s </xsl:if>
									<xsl:text> running.</xsl:text>
								</td>
								<td>
									<xsl:variable name="queue_prct">
										<xsl:choose>
											<xsl:when test="@size > 20">100</xsl:when>
											<xsl:otherwise><xsl:value-of select="@size div 20 * 100" /></xsl:otherwise>
										</xsl:choose>
									</xsl:variable>
									<div class="prctgradient">
										<div style="background:linear-gradient(to right,transparent {$queue_prct}%,white {$queue_prct}%);">
											<div style="text-align:right;width:{$queue_prct}%">&#160;</div>
										</div>
									</div>
									<xsl:value-of select="@size" /> awaiting task<xsl:if test="@size > 1">s </xsl:if>
									<xsl:text> in queue.</xsl:text>

								</td>
							</tr>
						</xsl:for-each>
					</table>
				</div>
			</xsl:for-each>
		</div>
	</xsl:template>

</xsl:stylesheet>
