<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:import href="templates/workflow.xsl" />
	<xsl:import href="templates/main-template.xsl" />
	
	<xsl:variable name="topmenu" select="'system-state'" />
	<xsl:variable name="title" select="'Board'" />
	
	<xsl:variable name="javascript">
		<src>js/index.js</src>
		<src>js/workflow-instance.js</src>
	</xsl:variable>
	
	<xsl:template name="content">
		
		<script type="text/javascript">
			var get = {
			<xsl:for-each select="/page/get/@*">
				'<xsl:value-of select="local-name()" />': '<xsl:value-of select="." />',
			</xsl:for-each>
			};
		</script>
		
		<script type="text/javascript">
			var workflows = [];
			<xsl:for-each select="/page/available-workflows/workflow">
				<xsl:if test="count(workflow/parameters/parameter) &gt;= 1">
					workflows['<xsl:value-of select="@name" />'] = [];
					<xsl:for-each select="workflow/parameters/parameter">
						workflows['<xsl:value-of select="../../../@name" />'][<xsl:value-of select="position() - 1" />] = '<xsl:value-of select="@name" />';
					</xsl:for-each>
				</xsl:if>
			</xsl:for-each>
			<xsl:choose>
				<xsl:when test="count(/page/@*) > 0"> <!-- =if there are parameters in the URL -->
					var REFRESH = false;
				</xsl:when>
				<xsl:otherwise>
					var REFRESH = true;
				</xsl:otherwise>
			</xsl:choose>
		</script>
		
		<xsl:for-each select="/page/errors/error[@id='evqueue-not-running']">
			<div id="evqueue-not-running">
				Evqueue is not running on node '<xsl:value-of select="@param" />'!!!<br/>
				<!--If you expect workflows to be launched, you should start the evqueue process urgently!-->
			</div>
		</xsl:for-each>
		
		<div id="workflows" class="contentList">
			
			<xsl:call-template name="workflows">
				<xsl:with-param name="workflows" select="/page/workflows[count(@status)=0]/workflow" />
				<xsl:with-param name="status" select="'EXECUTING'" />
			</xsl:call-template>
			
			<br />
			
			<table style="width:100%;">
				<tr>
					<td style="width:300px;">Launch a new workflow</td>
					<td>
						<xsl:apply-templates select="/page/groups" mode="select_workflow">
							<xsl:with-param name="id" select="'launchWF'" />
							<xsl:with-param name="value" select="'name'" />
						</xsl:apply-templates>
						
						<xsl:for-each select="/page/available-workflows/workflow">
								<xsl:apply-templates select="workflow" mode="launch" />
						</xsl:for-each>
					</td>
				</tr>
			</table>
			<br />
			<div id="searchWithinWorkflowParamsInput" class="nodisplay">
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
					<tr class="filter nodisplay">
						<td style="width:300px;">Node</td>
						<td>
							<select name="node">
								<option value="all">All</option>
								<xsl:for-each select="/page/evqueue-nodes/node">
									<option value="{@name}">
										<xsl:if test="/page/get/@node = @name"><xsl:attribute name="selected">selected</xsl:attribute></xsl:if>
										<xsl:value-of select="@name" />
									</option>
								</xsl:for-each>
							</select>
						</td>
					</tr>
					<tr class="filter nodisplay">
						<td style="width:300px;">Workflow</td>
						<td>
							<xsl:apply-templates select="/page/groups" mode="select_workflow">
								<xsl:with-param name="id" select="'searchByWorkflowSelect'" />
								<xsl:with-param name="value" select="'name'" />
								<xsl:with-param name="selected_value" select="/page/get/@wf_name" />
							</xsl:apply-templates>
						</td>
					</tr>
					<tr class="filter nodisplay">
						<td style="width:300px;">Workflow parameters</td>
						<td>
							<div id="searchWithinWorkflowParams"><xsl:comment /></div>
						</td>
					</tr>
					<tr class="filter nodisplay">
						<td>Launched between</td>
						<td>
							Date&#160;:&#160;<input id="dt_inf" name="dt_inf" value="{/page/get/@dt_inf}" />
							Hour&#160;:&#160;<input id="hr_inf" name="hr_inf" value="{/page/get/@hr_inf}" />
							&#160;&#160;<b>and</b>&#160;&#160;
							Date&#160;:&#160;<input id="dt_sup" name="dt_sup" value="{/page/get/@dt_sup}" />
							Hour&#160;:&#160;<input id="hr_sup" name="hr_sup" value="{/page/get/@hr_sup}" />
						</td>
					</tr>
					<tr class="filter nodisplay">
						<td colspan="2" class="center">
							<input type="submit" value="Filter workflows" />
							<xsl:text>&#160;</xsl:text>
							<a href="{$SITE_BASE}index.php"><button type="button" class="blue">Clear filters</button></a>
						</td>
					</tr>
				</table>
			</form>
			
			<xsl:call-template name="workflows">
				<xsl:with-param name="workflows" select="/page/workflows[@status='TERMINATED']/workflow" />
				<xsl:with-param name="status" select="'TERMINATED'" />
			</xsl:call-template>
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