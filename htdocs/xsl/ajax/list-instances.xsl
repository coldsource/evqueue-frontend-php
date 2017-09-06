<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" xmlns:php="http://php.net/xsl" version="1.0">
	<xsl:output method="html"/>

	<xsl:template match="/">
		<div>
			<div id="nodes-status">
				<span class="success"><xsl:value-of select="count(/page/instances/response[count(@err) = 0])" /> nodes up</span>
				<xsl:if test="count(/page/instances/response[count(@err) = 1]) >0">
					<xsl:text> - </xsl:text>
					<span class="error"><xsl:value-of select="count(/page/instances/response[count(@err) = 1])" /> nodes down</span>
				</xsl:if>
			</div>
			
			<div id="{$STATUS}-workflows-pages">
				<xsl:if test="$STATUS = 'TERMINATED' and $PAGE>1">
					<span class="faicon fa-backward"></span>
				</xsl:if>
				<xsl:if test="$STATUS = 'EXECUTING'">
					(<xsl:value-of select="count(/page/instances/response/workflow)" />)
				</xsl:if>
				
				<xsl:if test="$STATUS = 'TERMINATED'">
					<xsl:value-of select="($PAGE*$LIMIT)+1-$LIMIT" />-<xsl:value-of select="($PAGE*$LIMIT)" />&#160;/&#160;<xsl:value-of select="/page/instances/response/@rows" />
				</xsl:if>
				<xsl:text> </xsl:text>
				<xsl:if test="$STATUS = 'TERMINATED' and ($PAGE*$LIMIT) &lt; /page/instances/response/@rows">
					<span class="faicon fa-forward"></span>
				</xsl:if>
			</div>
			
			<div id="{$STATUS}-workflows" class="workflow-list">
				<xsl:choose>
					<xsl:when test="count(/page/instances/response/workflow)=0">
						<br />
						<div class="center">No <xsl:value-of select="$STATUS" /> workflow.</div>
					</xsl:when>
					<xsl:otherwise>
						<table class="tb_workflows highlight_row">
							<tr>
								<th style="width:80px;" class="center">State</th>
								<th>ID &#8211; Name</th>
								<th>Node</th>
								<th class="thStarted">Host</th>
								<th class="thStarted">Time</th>
								<th class="thActions">Actions</th>
							</tr>
							<xsl:apply-templates select="/page/instances/response/workflow[@status = $STATUS]">
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
			<xsl:if test="$STATUS = 'EXECUTING'">
				<xsl:attribute name="data-running_tasks"><xsl:value-of select="@running_tasks" /></xsl:attribute>
				<xsl:attribute name="data-retrying_tasks"><xsl:value-of select="@retrying_tasks" /></xsl:attribute>
				<xsl:attribute name="data-queued_tasks"><xsl:value-of select="@queued_tasks" /></xsl:attribute>
				<xsl:attribute name="data-error_tasks"><xsl:value-of select="@error_tasks" /></xsl:attribute>
				<xsl:attribute name="data-waiting_conditions"><xsl:value-of select="@waiting_conditions" /></xsl:attribute>
			</xsl:if>
			<td class="center">
				<xsl:if test="@running_tasks - @queued_tasks > 0">
					<span class="fa fa-spinner fa-pulse fa-fw" title="Task(s) running"></span>
				</xsl:if>
				<xsl:if test="@queued_tasks > 0">
					<span class="faicon fa-hand-stop-o" title="Task(s) queued"></span>
				</xsl:if>
				<xsl:if test="@retrying_tasks > 0">
					<span class="faicon fa-clock-o" title="A task ended badly and will retry"></span>
				</xsl:if>
				<xsl:if test="@status = 'TERMINATED' and @errors > 0">
					<span class="faicon fa-exclamation error" title="Errors"></span>
				</xsl:if>
				<xsl:if test="@status = 'TERMINATED' and @errors = 0">
					<span class="faicon fa-check success" title="Workflow terminated"></span>
				</xsl:if>
			</td>

			<td>
				<span class="action showWorkflowDetails" data-id="{@id}" data-node-name="{@node_name | ../@node}" data-status="{@status}">
					<xsl:value-of select="@id" />
					–
					<xsl:value-of select="@name" />
					<xsl:if test="$STATUS = 'EXECUTING'">
						<span class="faicon fa-info"></span>
					</xsl:if>
				</span>
				<xsl:text>&#160;</xsl:text>
				<xsl:variable name="seconds">
					<xsl:choose>
						<xsl:when test="count(@end_time) > 0">
							<xsl:value-of select="php:function('timeDiff',string(@start_time),string(@end_time))" />
						</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="php:function('timeDiff',string(@start_time))" />
						</xsl:otherwise>
					</xsl:choose>
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
	</xsl:template>
	
</xsl:stylesheet>
