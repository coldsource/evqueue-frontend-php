<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	<xsl:import href="templates/edit_workflow.xsl" />
	
	<xsl:variable name="topmenu" select="'settings'" />
	
	<xsl:variable name="javascript">
		<src>js/manage-workflow.js</src>
	</xsl:variable>
	
	<xsl:template name="content">
		<div class="contentManage">
			<div class="boxTitle">
			<span class="title">
				<xsl:choose>
				<xsl:when test="/page/get/@workflow_id">
					Update Workflow
				</xsl:when>
				<xsl:otherwise>
					Create Workflow
				</xsl:otherwise>
				</xsl:choose>
			</span>
			</div>
			<div id="Workflow" class="formdiv">
				<xsl:call-template name="displayErrors" />
				<xsl:call-template name="form_workflow"/>
			</div>
		</div>
		
		<div class="editionWorkflow">
			<div id="editTree" data-id="{/page/get/@workflow_id}"></div>
		</div>
	</xsl:template>
	
</xsl:stylesheet>
