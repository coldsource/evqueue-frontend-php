<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	
	<xsl:variable name="topmenu" select="'settings'" />
	
	<xsl:template name="content">
		<p>
			<b>Login: </b>
			<xsl:value-of select="/page/user/@login" />
		</p>
		<p>
			<b>Profile: </b>
			<xsl:value-of select="/page/user/@profile" />
		</p>
		
		<!-- Change Password Form -->
		<xsl:if test="/page/user/@login = /page/private/logged-in-user/@login">
			<p>
				<b>Change password</b>
				<xsl:call-template name="displayErrors" />
				<xsl:if test="/page/post/@action = 'chpwd' and count(/page/errors/error) = 0">
					<p class="success">
						Your password was changed successfully
					</p>
				</xsl:if>
				<form method="post">
					<input type="hidden" name="action" value="chpwd" />
					<input type="hidden" name="login" value="{/page/private/logged-in-user/@login}" />
					Current Password: <input type="password" name="current_password" placeholder="Current Password" /><br/>
					New Password:
					<input type="password" name="password" placeholder="New Password" />
					<input type="password" name="password2" placeholder="Confirm New Password" /><br/>
					<input type="submit" value="Change Password" />
				</form>
			</p>
		</xsl:if>
		
		<xsl:if test="/page/user/@profile = 'ADMIN'">
			<p>
				<b>Rights</b>
				All rights on everything (admin)
			</p>
		</xsl:if>
		<xsl:if test="/page/user/@profile != 'ADMIN' and /page/private/logged-in-user/@profile = 'ADMIN'">
			<b>Rights</b>
			<form method="post">
				<input type="hidden" name="action" value="editRights" />
				<input type="hidden" name="login" value="{/page/user/@login}" />
				
				<table class="userRights" style="min-width: 50%; width: auto; margin-top: 10px;">
					<tbody>
						<tr>
							<th>Workflow</th>
							<xsl:for-each select="/page/private/rights/right">
								<th>
									<xsl:value-of select="@action" />
								</th>
							</xsl:for-each>
						</tr>
						<xsl:for-each select="/page/workflows/workflow">
							<xsl:variable name="wfid" select="@id" />

							<tr>
								<td><xsl:value-of select="@name" /></td>
								<xsl:for-each select="/page/private/rights/right">
									<td>
										<input type="checkbox" name="rights[]" value="{@action}{$wfid}">
											<xsl:if test="/page/user/workflow[@wfid = $wfid]/right[@action = current()/@action] = 1">
												<xsl:attribute name="checked">checked</xsl:attribute>
											</xsl:if>
										</input>
									</td>
								</xsl:for-each>
							</tr>
						</xsl:for-each>
					</tbody>
				</table>
				<input type="submit" value="Save Rights" />
			</form>
		</xsl:if>
		
	</xsl:template>

</xsl:stylesheet>
