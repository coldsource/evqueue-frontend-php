<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	<xsl:import href="templates/git.xsl" />

	<xsl:variable name="topmenu" select="'settings'" />

	<xsl:variable name="javascript">
		<src>js/workflow.js</src>
	</xsl:variable>
	
	<xsl:template name="content">
		<div style="text-align: center; margin-bottom: 2em;">
			<form method="post" enctype="multipart/form-data">
				<input type="file" name="workflow_zip_file" onchange="$(this).parents('form:eq(0)').submit();" />
				Drag-and-drop or browse for a zip file to add a new workflow.
				<input type="submit" value="Install" />
			</form>
			<xsl:call-template name="displayNotices" />
			<xsl:call-template name="displayErrors" />
		</div>
		
		<div id="list-workflows"></div>

		<xsl:call-template name="git_commit_dialog"/>
	</xsl:template>

</xsl:stylesheet>
