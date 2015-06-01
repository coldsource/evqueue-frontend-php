<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	<xsl:import href="templates/edit_queue.xsl" />
	
	<xsl:variable name="topmenu" select="'settings'" />
	
	<xsl:variable name="javascript">
	</xsl:variable>

	<xsl:template name="content">
		<div  class="contentManage">
			<div class="boxTitle">
				<span class="title">
					<xsl:choose>
					<xsl:when test="/page/queue/@id">
						Update Queue
					</xsl:when>
					<xsl:otherwise>
						Create Queue
					</xsl:otherwise>
					</xsl:choose>
				</span>	
			</div>			
			<div id="Queue" class="formdiv">
				<xsl:call-template name="displayErrors" />
				<xsl:call-template name="form_queue"/>
			</div>
		</div>
    </xsl:template>
	
</xsl:stylesheet>
