<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />

	<xsl:variable name="topmenu" select="''" />
	
	<xsl:variable name="javascript">
		
	</xsl:variable>
	
	<xsl:template name="content">
		<form method="post" class="loginFields">
			<input type="text" name="login" placeholder="Login" /><br/>
			<input type="password" name="password" placeholder="Password" /><br/>
			<input type="submit" value="Log In" />
		</form>
	</xsl:template>

</xsl:stylesheet>
