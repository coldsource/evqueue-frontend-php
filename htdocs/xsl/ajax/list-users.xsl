<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:output method="html"/>

	<xsl:template match="/">
		<div>
			<div class="boxTitle">
				<span class="title">Users list</span>
				<span class="faicon fa-file-o action" title="Add new user"></span>
			</div>
			<table>
				<tr>
					<th>Login</th>
					<th style='width:6em'>Profile</th>
					<th class="thActions" style="width:60px;">Actions</th>
				</tr>
				
				<xsl:for-each select="/page/users/user">
					<tr class="evenOdd" data-id="{@name}">
						<td>
							<xsl:value-of select="@name" />
						</td>
						<td class="center">
							<xsl:value-of select="@profile" />
						</td>
						<td class="tdActions">
							<xsl:if test="@profile='USER'">
								<span class="faicon fa-id-card-o" title="Edit user rights"></span>
							</xsl:if>
							<span class="faicon fa-edit" title="Edit user"></span>
							<span class="faicon fa-remove" title="Delete user"></span>
						</td>
					</tr>
				</xsl:for-each>
			</table>
		</div>
	</xsl:template>

</xsl:stylesheet>
