<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	<xsl:import href="templates/edit_workflow.xsl" />

	<xsl:variable name="topmenu" select="'settings'" />

	<xsl:variable name="javascript">
		<src>js/manage-workflow.js</src>
	</xsl:variable>

	<xsl:param name="FORMTITLE">
		<xsl:if test="not(/page/get/@workflow_id)">Create new workflow</xsl:if>
		<xsl:if test="/page/get/@workflow_id">Edit workflow</xsl:if>
	</xsl:param>

	<xsl:template name="content">


		<div class="contentManage">
			<div class="boxTitle">
				<xsl:value-of select="$FORMTITLE" />
			</div>
			<xsl:call-template name="displayErrors" />
			<xsl:call-template name="form_workflow"/>
			<br />
			<div class="editionWorkflow">
				<div id="editTree" data-id="{/page/get/@workflow_id}"></div>
			</div>
			<input type="button" name="submitFormWorkflow" class="buttonFormWorkflow" value="Save workflow" onclick="$('#formWorkflow').submit()" />
			<input type="button" name="cancelFormWorkflow" class="buttonFormWorkflow" value="Cancel" onclick="location = '{$SITE_BASE}list-workflows.php?cancel={/page/get/@workflow_id}'" />
		</div>

	</xsl:template>

</xsl:stylesheet>
