<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	<xsl:import href="templates/task.xsl" />
	<xsl:import href="templates/git.xsl" />

	<xsl:variable name="topmenu" select="'settings'" />

	<xsl:variable name="javascript">
		<src>js/task.js</src>
	</xsl:variable>

   <xsl:template name="content">
		<div id="list-tasks"></div>
		
		<xsl:call-template name="git_commit_dialog">
			<xsl:with-param name="group" value="task" />
		</xsl:call-template>
		
		<xsl:call-template name="tpltask-editor" />
	</xsl:template>

</xsl:stylesheet>
