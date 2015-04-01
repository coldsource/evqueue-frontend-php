<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	<xsl:import href="templates/workflow.xsl" />
	
	<xsl:variable name="javascript">
	</xsl:variable>
	
	<xsl:template name="content">
		<div class="contentManage">
			<div class="boxTitle">
				<span class="title">Queues States</span>
			</div>			
			<table>
				<tr>
					<th>Name</th>
					<th>Concurrency</th>
					<th>Running tasks</th>
					<th>Queued tasks</th>
				</tr>
			
				<xsl:for-each select="/page/statistics/queue">
					<tr class="evenOdd">
						<td>
							<xsl:value-of select="@name" />
						</td>
						<td class="txtcenter">
							<xsl:value-of select="@concurrency" />
						</td>
						<td class="txtcenter">
							<div class="progressBar default" actualVal="{@running_tasks}" maxVal="{@concurrency}">
								<div></div>
							</div>
							<xsl:value-of select="@running_tasks" /> task<xsl:if test="@running_tasks > 1">s </xsl:if>
							<xsl:text> running.</xsl:text>
						</td>
						<td class="txtcenter">
						
							<div class="progressBar2 default" actualVal="{@size}" maxVal="{@concurrency}">
								<div></div>
							</div>
							<xsl:value-of select="@size" /> awaiting task<xsl:if test="@running_tasks > 1">s </xsl:if>
							<xsl:text> in queue.</xsl:text>
						
						</td>
					</tr>
				</xsl:for-each>
			</table>
		</div>	
	</xsl:template>

</xsl:stylesheet>
