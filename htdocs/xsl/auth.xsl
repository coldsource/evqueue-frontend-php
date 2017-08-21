<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />

	<xsl:variable name="topmenu" select="''" />
	
	<xsl:variable name="javascript">
		
	</xsl:variable>
	
	<xsl:template name="content">
		<div id="login">
			<fieldset>
				<div class="logo">
					<img src="images/evQueue.svg" />
				</div>
				<div class="form">
					<form method="post">
						<xsl:for-each select="/page/errors/error">
							<div class="error">
								<xsl:choose>
									<xsl:when test="/page/error = 'wrong-creds'">Authentication failed</xsl:when>
									<xsl:when test="/page/error = 'evqueue-ko'">Unable to connect to evQueue : <xsl:value-of select="/page/error/@msg" /></xsl:when>
									<xsl:otherwise>Unexpected error trying to authenticate</xsl:otherwise>
								</xsl:choose>
							</div>
						</xsl:for-each>
					
						<input type="text" name="login" placeholder="Login" autofocus="autofocus" /><br/><br/>
						<input type="password" name="password" placeholder="Password" /><br/><br/>
						<input type="submit" value="Log In" />
					</form>
				</div>
			</fieldset>
		</div>
	</xsl:template>

</xsl:stylesheet>
