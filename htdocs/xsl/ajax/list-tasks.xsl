<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:output method="html" indent="yes" omit-xml-declaration="yes" encoding="utf-8" doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" />
	
	<xsl:key name="groups" match="/page/tasks/task/@group" use="." />
	
	<xsl:template match="/">
		<div>
			<div class="boxTitle">
				<span class="title">Tasks list</span>
				<span class="faicon fa-file-o action" title="Add new task"></span>
			</div>
			<table>
				<tr>
					<th>Name</th>
					<th>Binary</th>
					<th>Parameters mode</th>
					<th>Host</th>
					<th class="thActions">Actions</th>
				</tr>

				<xsl:for-each select="/page/tasks/task/@group[generate-id(.) = generate-id(key('groups', .))]">
					<xsl:sort select="." />

					<xsl:variable name="groupName" select="." />
					<xsl:if test="position() != 1">
						<tr class="groupspace"><td></td></tr>
					</xsl:if>
					<tr class="group">
						<td colspan="6" >
							<xsl:choose>
								<xsl:when test="$groupName != ''">
									<xsl:value-of select="$groupName" />
								</xsl:when>
								<xsl:otherwise>
									No group
								</xsl:otherwise>
							</xsl:choose>
						</td>
					</tr>

					<xsl:for-each select="/page/tasks/task[@group = $groupName]">
						<tr class="evenOdd" data-id="{@id}">
							<td>
								<span>
									<xsl:if test="$USE_GIT = 1">
										<xsl:choose>
											<xsl:when test="count(/page/git-tasks/entry[@name=current()/@name]) > 0 and
											count(/page/git-tasks/entry[@lastcommit=current()/@lastcommit]) = 0">
												<xsl:attribute name="class">gitNeedUpdate</xsl:attribute>
												<xsl:attribute name="title">A newer version of this task exists</xsl:attribute>
											</xsl:when>
											<xsl:when test="@modified = 1">
												<xsl:attribute name="class">gitModified</xsl:attribute>
												<xsl:attribute name="title">This task as been modified</xsl:attribute>
											</xsl:when>
											<xsl:when test="count(/page/git-tasks/entry[@name=current()/@name]) = 0">
												<xsl:attribute name="class">gitNew</xsl:attribute>
												<xsl:attribute name="title">This task is not yet versionned</xsl:attribute>
											</xsl:when>
										</xsl:choose>
									</xsl:if>
									<xsl:value-of select="@name" />
								</span>
							</td>
							<td>
								<xsl:value-of select="@binary" />
							</td>
							<td class="center">
								<xsl:value-of select="@parameters_mode" />
							</td>
							<td class="center">
								<xsl:choose>
									<xsl:when test="@host != ''"><xsl:value-of select="@host" /></xsl:when>
									<xsl:otherwise>localhost</xsl:otherwise>
								</xsl:choose>
							</td>
							<td class="tdActions">
								<xsl:if test="$USE_GIT = 1 and (@modified = 1 or @lastcommit = '')">
									<xsl:choose>
										<xsl:when test="count(/page/git-tasks/entry[@name=current()/@name]) > 0 and
										(count(/page/git-tasks/entry[@lastcommit=current()/@lastcommit]) > 0 or @lastcommit = '')">
											<img src="images/database_go.png" onclick="commit(this,'{@name}', 'task')" class="pointer" title="Save this workflow to Git"/>
										</xsl:when>
										<xsl:when test="count(/page/git-tasks/entry[@name=current()/@name]) = 0">
											<img src="images/database_go.png" onclick="commit(this,'{@name}', 'task')" class="pointer" title="Save this workflow to Git"/>
										</xsl:when>
										<xsl:when test="count(/page/git-tasks/entry[@name=current()/@name]) > 0 and
										count(/page/git-tasks/entry[@lastcommit=current()/@lastcommit]) = 0">
											<img src="images/database_go2.png" onclick="confirm('You are about to overwrite changes to the repository');commit(this,'{@name}', 'task', 'yes')" class="pointer" title="Save this workflow to Git"/>
											<img src="images/database_refresh.png" onclick="evqueueAPI(this, 'git', 'load_task', {{ 'name':'{@name}' }});location.reload();" class="pointer" title="Load this workflow from Git"/>
										</xsl:when>
									</xsl:choose>
								</xsl:if>

								<span class="faicon fa-edit" title="Edit task"></span>
								<xsl:text>&#160;</xsl:text>
								<span class="faicon fa-remove" title="Delete task" data-confirm="You are about to delete the selected task"></span>
							</td>
						</tr>
					</xsl:for-each>
				</xsl:for-each>

				<tr class="groupspace"><td></td></tr>
				<tr class="group">
					<td colspan="6">Git only</td>
				</tr>
				<xsl:for-each select="/page/git-tasks/entry">
					<xsl:if test="count(/page/tasks/task[@name = current()/@name]) = 0">
						<tr class="evenOdd">
							<td colspan="5">
								<xsl:value-of select="@name" />
							</td>
							<td class="tdActions" style="min-width: 80px;">
								<img src="images/database_refresh.png" onclick="evqueueAPI(this, 'git', 'load_task', {{ 'name':'{@name}' }});location.reload();" class="pointer"/>
								<img data-confirm="Delete task {@name}" src="images/delete.gif" onclick="evqueueAPI(this, 'git', 'remove_task', {{ 'name':'{@name}', 'commit_log':'{@name} removed' }});location.reload();" class="pointer" />
							</td>
						</tr>
					</xsl:if>
				</xsl:for-each>
			</table>
		</div>
	</xsl:template>

</xsl:stylesheet>
