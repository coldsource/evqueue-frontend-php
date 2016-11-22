<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	
	<xsl:variable name="topmenu" select="'settings'" />
	<xsl:variable name="creation"><xsl:if test="count(/page/response-user) = 0">1</xsl:if></xsl:variable>
	
	<xsl:param name="ISFORM">1</xsl:param>
	<xsl:param name="FORMTITLE">User preferences</xsl:param>
	
	<xsl:template name="content">
		
		<xsl:call-template name="displayErrors" />
		
		<xsl:choose>
			
			<!-- USER CREATION -->
			<xsl:when test="$creation = 1">
				<form method="post">
					<input type="hidden" name="action" value="updatePreferences" />
					
					<p>
						<label>Change password:</label>
						<input type="password" name="password" placeholder="New password" />
					</p>
					
					<p>
						<label>Confirm password:</label>
						<input type="password" name="password2" placeholder="Confirm password" />
					</p>
					
					<p>
						<label>Prefered node</label>
						<select name="prefered_node">
							<xsl:for-each select="/page/evqueue-nodes/node">
								<option name="@name">
									<xsl:if test="/page/user/prefered_node = @name"><xsl:attribute name="selected">selected</xsl:attribute></xsl:if>
									<xsl:value-of select="@name" />
								</option>
							</xsl:for-each>
						</select>
					</p>
					
					<input type="submit" value="Update preferences" />
				</form>
			</xsl:when>
			
		</xsl:choose>
	</xsl:template>

</xsl:stylesheet>
