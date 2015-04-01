<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	
	<xsl:variable name="javascript">
	</xsl:variable>
	
	<xsl:template name="content">
		<div class="boxTitle">
			<span class="title">Users list</span>
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
						<xsl:text>&#160;</xsl:text>
						<!--<img src="images/delete.gif" onclick="deleteTask({@id})" class="pointer" />-->
					</td>
				</tr>
			</xsl:for-each>
		</table>
	</xsl:template>
	
</xsl:stylesheet>