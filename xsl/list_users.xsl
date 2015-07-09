<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	
	<xsl:variable name="topmenu" select="'settings'" />
	
	<xsl:variable name="javascript">
	</xsl:variable>
	
	<xsl:template name="content">
		<div class="contentList">
			<div class="boxTitle">
				<span class="title">Users list</span>
				<a href="manage-user.php">
					<img class="action" src="{$SITE_BASE}images/plus3.png" onclick="createNotif();" />
				</a>
			</div>
			<table>
				<tr>
					<th>Login</th>
					<th>Profile</th>
					<th class="thActions">Actions</th>
				</tr>
				
				<xsl:for-each select="/page/users/user">
					<tr class="evenOdd">
						<td>
							<xsl:value-of select="@login" />
						</td>
						<td>
							<xsl:value-of select="@profile" />
						</td>
						<td class="tdActions">
							<a href="manage-user.php?user_login={@login}">
								<img src="images/edit.gif"  />
							</a>
						</td>
					</tr>
				</xsl:for-each>
			</table>
		</div>
	</xsl:template>
	
</xsl:stylesheet>