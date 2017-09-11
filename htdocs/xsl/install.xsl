<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	
	<xsl:variable name="topmenu" select="''" />
	<xsl:variable name="title" select="'Board'" />
	<xsl:param name="ERROR" />
	
	<xsl:variable name="javascript">
		<src>js/install.js</src>
	</xsl:variable>
	
	<xsl:template name="content">
		<br /><br /><br />
		
		<div class="install_content">
			<xsl:if test="$ERROR != ''">
				<div class="error"><xsl:value-of select="$ERROR" /></div>
			</xsl:if>
		
			<div class="boxTitle">evQueue engine</div>
			
			<div class="installform formdiv">
				<form method="post" action="install.php">
					<div>
						<label class="formLabel">Type :</label>
						<input type="radio" name="type" value="tcp">
							<xsl:if test="count(/page/post/@type) = 0 or /page/post/@type='tcp'">
								<xsl:attribute name="checked">checked</xsl:attribute>
							</xsl:if>
							TCP
						</input>
						<xsl:text>&#160;-&#160;</xsl:text>
						<input type="radio" name="type" value="unix">
							<xsl:if test="/page/post/@type='unix'">
								<xsl:attribute name="checked">checked</xsl:attribute>
							</xsl:if>
							UNIX
						</input>
					</div>
					<div class="mode_tcp">
						<label class="formLabel">Hostname :</label>
						<input type="text" name="engine_host" value="{/page/post/@engine_host}" placeholder="Hostname (default localhost)" />
					</div>
					
					<div class="mode_tcp">
						<label class="formLabel">Port :</label>
						<input type="text" name="engine_port" value="{/page/post/@engine_port}" placeholder="Port (default 5000)" />
					</div>
					
					<div class="mode_unix hidden">
						<label class="formLabel">Path :</label>
						<input type="text" name="engine_path" value="{/page/post/@engine_path}" placeholder="Unix path" />
					</div>
					
					<div class="center">
						<input type="submit" style="min-width:unset;" value="Configure evQueue web board" />
					</div>
				</form>
			</div>
		</div>
	</xsl:template>

</xsl:stylesheet>
