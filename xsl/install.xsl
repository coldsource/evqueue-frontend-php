<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	
	<xsl:variable name="topmenu" select="''" />
	<xsl:variable name="title" select="'Board'" />
	<xsl:param name="ERROR" />
	<xsl:variable name="javascript" />
	
	<xsl:template name="content">
		<br /><br /><br />
		
		<form method="post" action="install.php">
			<div class="install_content">
				<xsl:if test="$ERROR != ''">
					<div class="error"><xsl:value-of select="$ERROR" /></div>
				</xsl:if>
			
				<div class="boxTitle">evQueue engine</div>
				
				<div class="formdiv">
					<div>
						<label class="formLabel" for="engine_host">Hostname :</label>
						<input type="text" name="engine_host" value="{/page/post/@engine_host}" placeholder="localhost" />
					</div>
					
					<div>
						<label class="formLabel" for="engine_port">Port :</label>
						<input type="text" name="engine_port" value="{/page/post/@engine_port}" placeholder="5000" />
					</div>
					
					<br />
					<div class="submit">
						<input type="submit" value="Configure evQueue web board" />
					</div>
				</div>
			</div>
		</form>
	</xsl:template>

</xsl:stylesheet>
