<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:import href="templates/workflow.xsl" />
	<xsl:import href="templates/main-template.xsl" />
	
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

		<div id="action-infos">
			<xsl:for-each select="/page/action/*">
				<span class="{local-name(.)}">
					<xsl:copy-of select="." />
				</span>
			</xsl:for-each>
		</div>
		
		<div id="workflows" class="contentList">
		
			<xsl:apply-templates select="/page/workflows[count(@status)=0]" />
			
			<div class="workflowName">
				<!-- workflow name -->
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
				
				<xsl:if test="count(/page/get/@*) > 0">
					<br/>
					<a href="index.php" class="clearSearch">Clear search</a>
				</xsl:if>
			</div>
			
			<div id="actionTools">
				<img src="images/search.png" title="Search by workflow" data-div-id="searchByWorkflow" />
				<img src="images/search_in.png" title="Search within workflow" data-div-id="searchWithinWorkflow" />
				<img src="images/search_dates.png" title="Filter by dates" data-div-id="searchDates" />
				<img src="images/launch.png" title="Search within workflow" data-div-id="launchWorkflow" />
			</div>
			
			<div id="searchByWorkflow" class="actionToolsDivs hideMe">
				<div>Search by workflow</div>
				
				<xsl:apply-templates select="/page/groups" mode="select_workflow">
					<xsl:with-param name="id" select="'searchByWorkflowSelect'" />
					<xsl:with-param name="value" select="'name'" />
				</xsl:apply-templates>
			</div>
			
			<div id="searchWithinWorkflow" class="actionToolsDivs hideMe">
				<form action="index.php" method="get">
					<div>Search within workflow</div>
					
					<xsl:apply-templates select="/page/groups" mode="select_workflow">
						<xsl:with-param name="id" select="'searchWithinWorkflowSelect'" />
						<xsl:with-param name="value" select="'name'" />
						<xsl:with-param name="min_parameters" select="'1'" />
					</xsl:apply-templates>
					<div id="searchWithinWorkflowParams">
					</div>
				</form>
			</div>
			
			<div id="launchWorkflow" class="actionToolsDivs hideMe">
				<span>Launch workflow:</span>
				
				<xsl:apply-templates select="/page/groups" mode="select_workflow">
					<xsl:with-param name="id" select="'launchWF'" />
					<xsl:with-param name="value" select="'name'" />
				</xsl:apply-templates>

				<xsl:for-each select="/page/available-workflows/workflow">
					<xsl:apply-templates select="workflow" mode="launch" />
				</xsl:for-each>
			</div>
			
			<div id="searchDates" class="actionToolsDivs hideMe">
				<span>Filter by dates:</span><br/>
				<form>
					<xsl:for-each select="/page/get/@*">
						<input type="hidden" name="{local-name()}" value="{.}" />
					</xsl:for-each>
					between <input id="dt_inf" name="dt_inf" value="{/page/get/@dt_inf}" />
					<input id="hr_inf" name="hr_inf" value="{/page/get/@hr_inf}" />
					and <input id="dt_sup" name="dt_sup" value="{/page/get/@dt_sup}" />
					<input id="hr_sup" name="hr_sup" value="{/page/get/@hr_sup}" />
					<input type="submit" value="Filter" />
				</form>
			</div>
			
			<xsl:apply-templates select="/page/workflows[@status='TERMINATED']" />
		</div>
	</xsl:template>

</xsl:stylesheet>
