<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	
	<xsl:variable name="topmenu" select="'system-state'" />
	
	<xsl:variable name="javascript">
	</xsl:variable>
	
	<xsl:template name="content">
		<div class="evq-autorefresh" data-url="ajax/system_state.php" data-interval="1">
			<div class="boxTitle">
				<span class="title">Queues States <span class="faicon fa-refresh action evq-autorefresh-toggle"></span></span>
			</div>
			
			<div class="tabs">
				<ul>
					<xsl:for-each select="/page/evqueue-nodes/node">
						<li><a href="#node-{@name}"><xsl:value-of select="@name" /></a></li>
					</xsl:for-each>
				</ul>
			
				<xsl:for-each select="/page/evqueue-nodes/node">
					<div class="evq-autorefresh-pannel" id="node-{@name}"></div>
				</xsl:for-each>
				
			</div>
		</div>
	</xsl:template>

</xsl:stylesheet>
