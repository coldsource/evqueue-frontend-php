<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	
	<xsl:variable name="topmenu" select="'settings'" />
	<xsl:variable name="creation">
		<xsl:if test="/page/user/@login = ''">1</xsl:if>
	</xsl:variable>
	
	<xsl:template name="content">
		
		<xsl:call-template name="displayErrors" />
		
		<xsl:choose>
			
			<!-- USER CREATION -->
			<xsl:when test="$creation = 1">
				<form method="post">
					<input type="hidden" name="action" value="createUser" />
					
					<p>
						<label class="formLabel">Login: </label>
						<input name="login" placeholder="Enter new login" value="{/page/post/@login}" autocomplete="off" />
					</p>
					<p>
						<label class="formLabel">Profile: </label>
						<select name="profile" onchange="profileChanged();">
							<option value="ADMIN">ADMIN</option>
							<option value="REGULAR_EVERYDAY_NORMAL_GUY">
								<xsl:if test="/page/post/@profile = 'REGULAR_EVERYDAY_NORMAL_GUY'">
									<xsl:attribute name="selected">selected</xsl:attribute>
								</xsl:if>
								REGULAR_EVERYDAY_NORMAL_GUY
							</option>
						</select>
						
						<script type="text/javascript">
							$(document).ready(profileChanged);
							
							function profileChanged () {
								var profile = $('select[name=profile] option:checked').val();
								if (profile == 'ADMIN') {
									$('#specificRights').hide();
									$('#adminRights').show();
								} else {
									$('#specificRights').show();
									$('#adminRights').hide();
								}
							}
						</script>
					</p>
					
					<p>
						<xsl:call-template name="new-password-fields" />
					</p>
					<xsl:call-template name="rights" />
					
					<input type="submit" value="Create User" />
				</form>
			</xsl:when>
			
			<!-- USER EDITION -->
			<xsl:otherwise>
				<p>
					<label class="formLabel">Login: </label>
					<xsl:value-of select="/page/response-user/user/@name" />
				</p>
				<p>
					<label class="formLabel">Profile: </label>
					<xsl:value-of select="/page/response-user/user/@profile" />
				</p>
				
				<!-- Change Password Form -->
				<xsl:if test="/page/response-user/user/@name = $LOGIN">
					<p>
						<b>Change password</b>
					</p>
					<p>
						<xsl:if test="/page/post/@action = 'chpwd' and count(/page/errors/error) = 0">
							<p class="success">
								Your password was changed successfully
							</p>
						</xsl:if>
						
						<form method="post">
							<input type="hidden" name="action" value="chpwd" />
							<input type="hidden" name="login" value="{$LOGIN}" />
							<label class="formLabel">Current Password: </label>
							<input type="password" name="current_password" placeholder="Current Password" />
							<br/>
							<xsl:call-template name="new-password-fields" />
							<input type="submit" value="Change Password" />
						</form>
					</p>
				</xsl:if>
				
				<xsl:call-template name="rights" />
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	
	
	<xsl:template name="rights">
		<!-- ADMIN -->
		<p>
			<label class="formLabel">
				<b>Rights</b>
			</label>
		</p>
		<div id="adminRights">
			<xsl:if test="$creation = 1 or /page/user/@profile = 'ADMIN'">
				All rights on everything (admin)
			</xsl:if>
		</div>
		
		<!-- PROFILE USER -->
		<div id="specificRights">
			<xsl:choose>
				<xsl:when test="$creation = 1">
					<xsl:call-template name="rightsTable" />
				</xsl:when>
				<xsl:when test="/page/response-user/user/@profile != 'ADMIN' and $PROFILE = 'ADMIN'">
					<form method="post">
						<input type="hidden" name="action" value="editRights" />
						<input type="hidden" name="login" value="{/page/response-user/user/@name}" />
						<xsl:call-template name="rightsTable" />
						<input type="submit" value="Save Rights" />
					</form>
				</xsl:when>
			</xsl:choose>
		</div>
	</xsl:template>
	
	
	<xsl:template name="new-password-fields">
		<label class="formLabel">New Password: </label>
		<input type="password" name="password" placeholder="New Password" />
		<input type="password" name="password2" placeholder="Confirm New Password" />
		<br/>
	</xsl:template>
	
	
	<xsl:template name="rightsTable">
		<table class="userRights" style="min-width: 50%; width: auto; margin-top: 10px;">
			<tbody>
				<tr>
					<th>Workflow</th>
					<xsl:for-each select="/page/ rights/right">
						<th>
							<xsl:value-of select="@action" />
						</th>
					</xsl:for-each>
				</tr>
				<xsl:for-each select="/page/workflows/workflow">
					<xsl:variable name="wfid" select="@id" />
					
					<tr>
						<td><xsl:value-of select="@name" /></td>
						<xsl:for-each select="/page/rights/right">
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
	</xsl:template>

</xsl:stylesheet>
