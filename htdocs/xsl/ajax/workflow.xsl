<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="../templates/workflow.xsl" />
	
	<xsl:template match="/">
		<div>
			<!-- Display workflow -->
			<xsl:apply-templates select="/page/instance/workflow" mode="tree" />
			
			<!-- Display tasks details -->
			<div id="workflow-{/page/instance/workflow/@id}-parameters">
				<div class="tabbed">
					<xsl:for-each select="/page/instance/workflow/parameters/parameter">
						<div>
							<div><xsl:value-of select="@name" /></div>
							<div><xsl:value-of select="." /></div>
						</div>
					</xsl:for-each>
				</div>
			</div>
			<xsl:apply-templates select="/page/instance/workflow/subjobs" mode="details" />
		</div>
	</xsl:template>

</xsl:stylesheet>
