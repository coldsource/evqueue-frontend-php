<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />

	<xsl:variable name="topmenu" select="''" />
	
	<xsl:variable name="javascript">
		
	</xsl:variable>
	
	<xsl:template name="content">
		<form method="post" class="loginFields">
			<xsl:if test="/page/error != ''">
				<div class="error eyeCatchy">
					<xsl:choose>
						<xsl:when test="/page/error = 'wrong-creds'">Authentication failed</xsl:when>
						<xsl:when test="/page/error = 'evqueue-ko'">Unable to connect to evQueue</xsl:when>
						<xsl:otherwise>Unexpected error trying to authenticate</xsl:otherwise>
					</xsl:choose>
				</div>
				<br />
			</xsl:if>
			
			<input type="text" name="login" placeholder="Login" /><br/>
			<input type="password" name="password" placeholder="Password" /><br/>
			<input type="submit" value="Log In" />
		</form>
	</xsl:template>

</xsl:stylesheet>
