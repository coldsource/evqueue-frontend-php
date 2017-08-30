<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	
	<xsl:variable name="topmenu" select="'settings'" />
	
	<xsl:variable name="javascript">
		<src>js/user.js</src>
	</xsl:variable>
	
	<xsl:template name="content">
		<div id="list-users"></div>
		
		<xsl:call-template name="user-editor" />
		<xsl:call-template name="user-rights-editor" />
	</xsl:template>
	
	<xsl:template name="user-editor">
		<div id="user-editor" class="dialog formdiv" data-width="900" data-height="300">
			<h2>
				User properties
				<span class="help faicon fa-question-circle" title="Users have access to evqueue interface and API commands. Admin profiles can access everything, including the settings. Users profiles can only access a specified set of workflows.&#10;&#10;User access rights are managed after user creation, from the dedicated interface."></span>
			</h2>
			<form>
				<div>
					<label>Login</label>
					<input type="text" name="name" />
				</div>
				<div>
					<label>Profile</label>
					<select name="profile">
						<option value="ADMIN">Admin</option>
						<option value="USER">User</option>
					</select>
				</div>
				<div>
					<label>Password</label>
					<input type="password" name="password" />
				</div>
				<div>
					<label>Confirm password</label>
					<input type="password" name="password2" class="nosubmit" />
				</div>
			</form>
			<button class="submit">Save</button>
		</div>
	</xsl:template>
	
	<xsl:template name="user-rights-editor">
		<div id="user-rights-editor" class="dialog">
			<table class="userRights" style="min-width: 50%; width: auto; margin-top: 10px; display:inline;">
				<tbody>
					<tr>
						<th>Workflow</th>
						<th>read</th>
						<th>exec</th>
						<th>edit</th>
						<th>kill</th>
					</tr>
					<xsl:for-each select="/page/workflows/workflow">
						<tr data-workflow-id="{@id}">
							<td><xsl:value-of select="@name" /></td>
							<td>
								<input type="checkbox" name="read" />
							</td>
							<td>
								<input type="checkbox" name="exec" />
							</td>
							<td>
								<input type="checkbox" name="edit" />
							</td>
							<td>
								<input type="checkbox" name="kill" />
							</td>
						</tr>
					</xsl:for-each>
				</tbody>
			</table>
		</div>
	</xsl:template>
	
</xsl:stylesheet>