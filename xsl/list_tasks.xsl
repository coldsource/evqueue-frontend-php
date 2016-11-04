<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	<xsl:import href="templates/list_tasks.xsl" />
	<xsl:import href="templates/git.xsl" />

	<xsl:variable name="topmenu" select="'settings'" />

	<xsl:variable name="javascript">
	</xsl:variable>

   <xsl:template name="content">
		<div id="task" class="contentList">
			<xsl:call-template name="list_tasks"/>
			<xsl:call-template name="git_commit_dialog">
				<xsl:with-param name="group" value="task" />
			</xsl:call-template>
		</div>
	</xsl:template>

</xsl:stylesheet>
