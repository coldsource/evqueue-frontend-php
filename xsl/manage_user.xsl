<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	
	<xsl:variable name="topmenu" select="'settings'" />
	<xsl:variable name="creation"><xsl:if test="count(/page/response-user) = 0">1</xsl:if></xsl:variable>
	
	<xsl:param name="ISFORM">1</xsl:param>
	<xsl:param name="FORMTITLE">
		<xsl:if test="$creation = 1">Create a new user</xsl:if>
		<xsl:if test="$creation != 1">Edit user</xsl:if>
	</xsl:param>
	
	<xsl:template name="content">
		
		<xsl:call-template name="displayErrors" />
		
		<xsl:choose>
			
			<!-- USER CREATION -->
			<xsl:when test="$creation = 1">
				<form method="post">
					<input type="hidden" name="action" value="createUser" />
					
					<p>
						<label>Login:</label>
						<input name="login" placeholder="Enter new login" value="{/page/post/@login}" autocomplete="off" />
					</p>
					<p>
						<label>Profile:</label>
						<select name="profile" onchange="profileChanged();">
							<option value="ADMIN">ADMIN</option>
							<option value="USER">
								<xsl:if test="/page/post/@profile = 'USER'">
									<xsl:attribute name="selected">selected</xsl:attribute>
								</xsl:if>
								USER
							</option>
						</select>
						
					</p>
					
					<p>
						<label>Password:</label>
						<input type="password" name="password" placeholder="Password" />
					</p>
					
					<p>
						<label>Confirm password:</label>
						<input type="password" name="password2" placeholder="Confirm password" />
					</p>
					
					<xsl:call-template name="rights" />
					
					<input type="submit" value="Create User" />
				</form>
			</xsl:when>
			
			<!-- USER EDITION -->
			<xsl:otherwise>
				<form method="post">
					<p>
						<label>Login: </label>
						<xsl:value-of select="/page/response-user/user/@name" />
					</p>
					<p>
						<label>Profile: </label>
						<xsl:value-of select="/page/response-user/user/@profile" />
					</p>
					
					<xsl:call-template name="rights" />
					
					<input type="submit" value="Save user" />
				</form>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	
	
	<xsl:template name="rights">
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
	
		<!-- ADMIN -->
		<p>
			<label class="formLabel">
				<b>User rights</b>
			</label>
		
		<div id="adminRights">
			<xsl:if test="$creation = 1 or /page/user/@profile = 'ADMIN'">
				All rights on everything (admin)
			</xsl:if>
		</div>
		</p>
		
		<!-- PROFILE USER -->
		<div id="specificRights">
			<xsl:choose>
				<xsl:when test="$creation = 1">
					<xsl:call-template name="rightsTable" />
				</xsl:when>
				<xsl:when test="/page/response-user/user/@profile != 'ADMIN' and $PROFILE = 'ADMIN'">
					<input type="hidden" name="action" value="editRights" />
					<input type="hidden" name="login" value="{/page/response-user/user/@name}" />
					<xsl:call-template name="rightsTable" />
				</xsl:when>
			</xsl:choose>
		</div>
	</xsl:template>
	
	
	<xsl:template name="rightsTable">
		<table class="userRights" style="min-width: 50%; width: auto; margin-top: 10px;">
			<tbody>
				<tr>
					<th>Workflow</th>
					<th>read</th>
					<th>exec</th>
					<th>edit</th>
					<th>kill</th>
				</tr>
				<xsl:for-each select="/page/workflows/workflow">
					<xsl:variable name="wfid" select="@id" />
					
					<tr>
						<td><xsl:value-of select="@name" /></td>
						<td>
							<input type="checkbox" name="rights[]" value="read{$wfid}">
								<xsl:if test="/page/response-user/user/right[@workflow-id = $wfid]/@read = 'yes'">
									<xsl:attribute name="checked">checked</xsl:attribute>
								</xsl:if>
							</input>
						</td>
						<td>
							<input type="checkbox" name="rights[]" value="exec{$wfid}">
								<xsl:if test="/page/response-user/user/right[@workflow-id = $wfid]/@exec = 'yes'">
									<xsl:attribute name="checked">checked</xsl:attribute>
								</xsl:if>
							</input>
						</td>
						<td>
							<input type="checkbox" name="rights[]" value="edit{$wfid}">
								<xsl:if test="/page/response-user/user/right[@workflow-id = $wfid]/@edit = 'yes'">
									<xsl:attribute name="checked">checked</xsl:attribute>
								</xsl:if>
							</input>
						</td>
						<td>
							<input type="checkbox" name="rights[]" value="kill{$wfid}">
								<xsl:if test="/page/response-user/user/right[@workflow-id = $wfid]/@kill = 'yes'">
									<xsl:attribute name="checked">checked</xsl:attribute>
								</xsl:if>
							</input>
						</td>
					</tr>
				</xsl:for-each>
			</tbody>
		</table>
	</xsl:template>

</xsl:stylesheet>
