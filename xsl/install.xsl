<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:import href="templates/workflow.xsl" />
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
			
				<div class="boxTitle">Database</div>
				
				<div>
					<label class="formLabel" for="db_host">Hostname :</label>
					<input type="text" name="db_host" value="{/page/post/@db_host}" />
				</div>
				
				<div>
					<label class="formLabel" for="db_user">User :</label>
					<input type="text" name="db_user" value="{/page/post/@db_user}" />
				</div>
				
				<div>
					<label class="formLabel" for="db_password">Password :</label>
					<input type="text" name="db_password" value="{/page/post/@db_password}" />
				</div>
				
				<div>
					<label class="formLabel" for="db_name">Database name :</label>
					<input type="text" name="db_name" value="{/page/post/@db_name}" />
				</div>
				
				<br /><br />
				<div class="boxTitle">evQueue engine</div>
				
				<div>
					<label class="formLabel" for="engine_host">Hostname :</label>
					<input type="text" name="engine_host" value="{/page/post/@engine_host}" />
				</div>
				
				<div>
					<label class="formLabel" for="engine_port">Port :</label>
					<input type="text" name="engine_port" value="{/page/post/@engine_port}" />
				</div>
				
				<br />
				<div class="submit">
					<input type="submit" value="Configure evQueue web board" />
				</div>
			</div>
		</form>
	</xsl:template>

</xsl:stylesheet>
