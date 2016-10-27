<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="../templates/workflow.xsl" />
	

	<xsl:template match="/">
		<div>
			<div id="formContainer"></div>
			<div id="jobInfos"></div>
			<h2 style="text-align: center; text-decoration: underline;">Tree Visualisation</h2>
			<xsl:apply-templates select="/page/workflow" mode="edit-tree" />
		</div>
    </xsl:template>
	
</xsl:stylesheet>
