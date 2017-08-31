<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" xmlns:php="http://php.net/xsl" version="1.0">
	<xsl:output method="html"/>

	<xsl:template match="/">
		<div>
			<div id="{$STATUS}-workflows-pages">
				<xsl:if test="$STATUS = 'TERMINATED'">
					<span class="prevPage action" data-status="{$STATUS}">&lt;</span>
				</xsl:if>
				<xsl:if test="$STATUS = 'EXECUTING'">
					<xsl:value-of select="count(/page/instances/workflow)" />
				</xsl:if>
				<xsl:text> </xsl:text>
				<xsl:value-of select="$STATUS" />
				Workflows
				<xsl:if test="$STATUS = 'EXECUTING' and count(/page/instances/workflow) != count(/page/instances/workflow)">
					(<xsl:value-of select="count(/page/instances/workflow)" /> displayed)
				</xsl:if>
				<xsl:if test="$STATUS = 'TERMINATED'">
					<xsl:value-of select="($PAGE*$LIMIT)+1-$LIMIT" />-<xsl:value-of select="($PAGE*$LIMIT)" />&#160;<span style="font-size: 80%">(<xsl:value-of select="/page/instances/@rows" /> total)</span>
				</xsl:if>
				<xsl:text> </xsl:text>
				<xsl:if test="$STATUS = 'TERMINATED'">
					<span class="nextPage action" data-status="{$STATUS}">&gt;</span>
				</xsl:if>
			</div>
			
			<div id="{$STATUS}-workflows" class="workflow-list">
				<xsl:choose>
					<xsl:when test="count(/page/instances/workflow)=0">
						<div class="center">No <xsl:value-of select="$STATUS" /> workflow.</div>
					</xsl:when>
					<xsl:otherwise>
						<table class="tb_workflows highlight_row">
							<tr>
								<th style="width:50px;" class="center">State</th>
								<th>ID &#8211; Name</th>
								<th>Node</th>
								<th class="thStarted">Host</th>
								<th class="thStarted">Time</th>
								<th class="thActions">Actions</th>
							</tr>
							<xsl:apply-templates select="/page/instances/workflow[@status = $STATUS]">
								<xsl:sort select="@end_time" order="descending" />
								<xsl:sort select="@start_time" order="descending" />
							</xsl:apply-templates>
						</table>
					</xsl:otherwise>
				</xsl:choose>
			</div>
		</div>
	</xsl:template>
	
	<xsl:template match="workflow">
		<tr data-id="{@id}" data-node="{../@node}">
			<td class="center">
				<xsl:variable name="current-node">
					<xsl:copy-of select="." />
				</xsl:variable>
				<xsl:choose>
					<xsl:when test="@running_tasks - @queued_tasks > 0">
						<span class="fa fa-spinner fa-pulse fa-fw" title="Task(s) running"></span>
					</xsl:when>
					<xsl:when test="@queued_tasks > 0">
						<img src="images/waitpoint.gif" alt="Queued" title="Task(s) queued" />
					</xsl:when>
					<xsl:when test="@retrying_tasks > 0">
						<span class="fa-icon fa-clock-o" title="A task ended badly and will retry"></span>
					</xsl:when>
					<xsl:when test="@errors > 0">
						<span class="faicon fa-exclamation error" title="Errors"></span>
					</xsl:when>
					<xsl:when test="count(@end_time) > 0">
						<span class="faicon fa-check success" title="Workflow terminated"></span>
					</xsl:when>
					<xsl:otherwise>
						<b>?</b>
					</xsl:otherwise>
				</xsl:choose>
			</td>

			<td>
				<span class="action showWorkflowDetails" data-id="{@id}" data-node-name="{@node_name | ../@node}" data-status="{@status}">
					<xsl:value-of select="@id" />
					–
					<xsl:value-of select="@name" />
				</span>
				<xsl:text>&#160;</xsl:text>
				<xsl:variable name="seconds">
					<xsl:apply-templates select="." mode="total-time" />
				</xsl:variable>

				(<xsl:value-of select="php:function('humanTime',$seconds)" />)
			</td>
			<td class="center">
				<xsl:value-of select="@node_name | ../@node" />
			</td>
			<td class="center">
				<xsl:choose>
					<xsl:when test="@host != ''"><xsl:value-of select="@host" /></xsl:when>
					<xsl:otherwise>localhost</xsl:otherwise>
				</xsl:choose>
			</td>
			<td class="tdStarted">
				<xsl:value-of select="php:function('timeSpan',string(@start_time),string(@end_time))" />
			</td>
			
			<td class="tdActions">
				<xsl:if test="@status='EXECUTING'">
					<span class="faicon fa-ban" title="Cancel this instance"></span>
					<span class="faicon fa-bomb" title="Kill this instance"></span>
				</xsl:if>

				<xsl:if test="@status='TERMINATED'">
					<span class="faicon fa-remove" title="Delete this instance"></span>
				</xsl:if>
			</td>
		</tr>
		<tr id="tr{@id}" class="hidden">
			<td colspan="7" class="details">
				<img src="images/ajax-loader.gif" />
			</td>
		</tr>
	</xsl:template>

</xsl:stylesheet>
