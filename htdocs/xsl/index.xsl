<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:import href="templates/workflow.xsl" />
	<xsl:import href="templates/main-template.xsl" />
	
	<xsl:variable name="topmenu" select="'system-state'" />
	<xsl:variable name="title" select="'Board'" />
	
	<xsl:variable name="css">
		<src>styles/workflow-instance.css</src>
	</xsl:variable>
	
	<xsl:variable name="javascript">
		<src>js/index.js</src>
<!-- 		<src>js/workflow-instance.js</src> -->
	</xsl:variable>
	
	<xsl:template name="content">
	
		<div class="dialog" id="workflow-dialog">
			<ul>
			</ul>
		</div>
		
		<div class="dialog" id="task-dialog">
			<ul>
			</ul>
		</div>
		
		<div id="workflow-dialogs"></div>
		
		
		<div class="evq-autorefresh" data-url="ajax/list-instances.php?status=executing" data-interval="2">
			<div class="boxTitle">
				<span class="title">Executing workflows <span class="faicon fa-refresh action evq-autorefresh-toggle"></span></span>
				<div id="EXECUTING-workflows-pages" class="evq-autorefresh-pannel"></div>
			</div>
			
			<div id="EXECUTING-workflows" class="workflow-list evq-autorefresh-pannel"></div>
		</div>

		<br />
		
		<div>
			
			<div id="searchWithinWorkflowParamsInput" class="hidden">
				<div>
					<label class="formLabel" for="#PARAMETER_NAME#" >#PARAMETER_LABEL#</label>
					<input type="text" class="parameter" name="#PARAMETER_NAME#" value="" />
				</div>
			</div>
			<form id="searchform" action="{$SITE_BASE}index.php">
				<input type="hidden" name="searchParams" value="{/page/get/@searchParams}" />
				<table id="filters" style="width:100%;">
					<tr>
						<td colspan="2"><a onclick="$('.filter').toggle();" href="javascript:void(0)">Filters</a> : <xsl:call-template name="explain_search" /></td>
					</tr>
					<tr class="filter hidden">
						<td style="width:300px;">Node</td>
						<td>
							<select name="node">
								<option value="">All</option>
								<xsl:for-each select="/page/evqueue-nodes/node">
									<option value="{@name}">
										<xsl:if test="/page/get/@node = @name"><xsl:attribute name="selected">selected</xsl:attribute></xsl:if>
										<xsl:value-of select="@name" />
									</option>
								</xsl:for-each>
							</select>
						</td>
					</tr>
					<tr class="filter hidden">
						<td style="width:300px;">Workflow</td>
						<td>
							<select name="wf_name" class="evq-autofill select2" data-type="workflows" data-valuetype="name" style="width:300px;"></select>
						</td>
					</tr>
					<tr class="filter hidden">
						<td style="width:300px;">Workflow parameters</td>
						<td>
							<div id="searchWithinWorkflowParams"><xsl:comment /></div>
						</td>
					</tr>
					<tr class="filter hidden">
						<td>Launched between</td>
						<td>
							Date&#160;:&#160;<input id="dt_inf" name="dt_inf" value="{/page/get/@dt_inf}" />
							Hour&#160;:&#160;<input id="hr_inf" name="hr_inf" value="{/page/get/@hr_inf}" />
							&#160;&#160;<b>and</b>&#160;&#160;
							Date&#160;:&#160;<input id="dt_sup" name="dt_sup" value="{/page/get/@dt_sup}" />
							Hour&#160;:&#160;<input id="hr_sup" name="hr_sup" value="{/page/get/@hr_sup}" />
						</td>
					</tr>
					<tr class="filter hidden">
						<td colspan="2" class="center">
							<input type="submit" value="Filter workflows" />
							<xsl:text>&#160;</xsl:text>
							<a href="{$SITE_BASE}index.php"><button type="button" class="blue">Clear filters</button></a>
						</td>
					</tr>
				</table>
			</form>
		</div>
		
		<br />
			
		<div class="evq-autorefresh" data-url="ajax/list-instances.php?status=terminated" data-interval="2">
			<div class="boxTitle">
				<span class="title">Terminated workflows <span class="faicon fa-refresh action evq-autorefresh-toggle"></span></span>
			</div>
			
			<div id="TERMINATED-workflows" class="workflow-list evq-autorefresh-pannel"></div>
		</div>
	</xsl:template>
	
	<xsl:template name="explain_search">
		<xsl:choose>
			<xsl:when test="/page/get/@wf_name != ''">
				Showing terminated <i>"<xsl:value-of select="/page/get/@wf_name | /page/get/@selected_workflow" />"</i> workflows
			</xsl:when>
			<xsl:otherwise>
				Showing all terminated workflows
			</xsl:otherwise>
		</xsl:choose>
		
		<!-- date -->
		<xsl:choose>
			<xsl:when test="/page/get/@dt_inf != '' and /page/get/@dt_sup != ''">
				between <xsl:value-of select="/page/get/@dt_inf" />&#160;<xsl:value-of select="/page/get/@hr_inf" /> and <xsl:value-of select="/page/get/@dt_sup" />&#160;<xsl:value-of select="/page/get/@hr_sup" />
			</xsl:when>
			<xsl:when test="/page/get/@dt_inf != ''">
				since <xsl:value-of select="/page/get/@dt_inf" />
			</xsl:when>
			<xsl:when test="/page/get/@dt_sup != ''">
				before <xsl:value-of select="/page/get/@dt_sup" />
			</xsl:when>
		</xsl:choose>
		
		<!-- search on wf parameters -->
		<xsl:for-each select="/page/get/@*">
			<xsl:if test=". != '' and name() != 'wf_name' and name() != 'dt_inf' and name() != 'dt_sup' and name() != 'hr_inf' and name() != 'hr_sup'">
				<xsl:if test="position() = 1"> having </xsl:if>
				<xsl:if test="position() > 1">, </xsl:if>
				
				<xsl:value-of select="name()" /> = <b>"<xsl:value-of select="." />
					<xsl:text>"</xsl:text>
				</b>
			</xsl:if>
		</xsl:for-each>
	</xsl:template>

</xsl:stylesheet>
