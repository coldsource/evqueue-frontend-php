<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:output method="html" indent="yes" omit-xml-declaration="yes" encoding="utf-8" doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" />
	
	<xsl:key name="groups" match="/page/tasks/task/@group" use="." />
	
	<xsl:template match="/">
		<div>
			<div class="boxTitle">
				<span class="title">Tasks list</span>
				<span class="faicon fa-file-o action" title="Add new task"></span>
				<xsl:if test="$USE_GIT = 1">
					<span class="faicon fa-cloud action" title="Pull git repository"></span>
				</xsl:if>
			</div>
			<table>
				<tr>
					<th style="width:200px;">Name</th>
					<th>Binary</th>
					<th style="width:150px;">Parameters mode</th>
					<th style="width:150px;">Host</th>
					<xsl:if test="$USE_GIT = 1">
						<th style="width:80px;">Git</th>
					</xsl:if>
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
							<span class="faicon fa-link" title="View workflows using this group's tasks"></span>
						</td>
					</tr>

					<xsl:for-each select="/page/tasks/task[@group = $groupName]">
						<xsl:variable name="is-in-git" select="$USE_GIT = 1 and count(/page/git-tasks/entry[@name=current()/@name]) > 0" />
						<xsl:variable name="is-same-git-version" select="$USE_GIT = 1  and count(/page/git-tasks/entry[@name=current()/@name and @lastcommit=current()/@lastcommit]) != 0" />
						<xsl:variable name="git-status">
							<xsl:choose>
								<xsl:when test="$is-same-git-version and @modified=0">uptodate</xsl:when>
								<xsl:when test="$is-same-git-version and @modified=1">needpush</xsl:when>
								<xsl:when test="@lastcommit!='' and not($is-same-git-version) and @modified=0">needpull</xsl:when>
								<xsl:otherwise>conflict</xsl:otherwise>
							</xsl:choose>
						</xsl:variable>
						<xsl:variable name="git-status-human">
							<xsl:choose>
								<xsl:when test="$git-status = 'uptodate'">Up-to-date with git version</xsl:when>
								<xsl:when test="$git-status = 'needpush'">You have local modifications that can be pushed to git</xsl:when>
								<xsl:when test="$git-status = 'needpull'">Git version is more recent, update local version to avoid conflicts</xsl:when>
								<xsl:otherwise>Conflict with git version</xsl:otherwise>
							</xsl:choose>
						</xsl:variable>
						
						<tr class="evenOdd" data-id="{@id}" data-name="{@name}">
							<td>
								<span>
									<xsl:value-of select="@name" />
									<xsl:if test="$USE_GIT = 1">
										<xsl:if test="$is-in-git">
											<xsl:text>&#160;</xsl:text>
											<span class="faicon fa-git git_{$git-status}" title="{$git-status-human}"></span>
										</xsl:if>
									</xsl:if>
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
							<xsl:if test="$USE_GIT = 1">
								
								<xsl:variable name="clsConflict">
									<xsl:if test="$is-in-git and $git-status='conflict'">conflict</xsl:if>
								</xsl:variable>
								
								<td class="tdActions">
									<xsl:if test="not($is-in-git) or $git-status='needpush' or $git-status='conflict'">
										<span data-name="{@name}" class="faicon fa-cloud-upload git {$clsConflict}" title="Commit this task to Git"></span>
									</xsl:if>
									<xsl:if test="$is-in-git and ($git-status='needpull' or $git-status='conflict')">
										<span data-name="{@name}" class="faicon fa-cloud-download git {$clsConflict}" title="Load Git version"></span>
									</xsl:if>
								</td>
							</xsl:if>
							<td class="tdActions">
								<span class="faicon fa-edit" title="Edit task"></span>
								<span class="faicon fa-remove" title="Delete task"></span>
							</td>
						</tr>
					</xsl:for-each>
				</xsl:for-each>

				<xsl:if test="$USE_GIT = 1">
					<tr class="groupspace"><td></td></tr>
					<tr class="group">
						<td colspan="6">These workflows are in the git repository but are present locally</td>
					</tr>
					<xsl:for-each select="/page/git-tasks/entry">
						<xsl:if test="count(/page/tasks/task[@name = current()/@name]) = 0">
							<tr class="evenOdd">
								<td colspan="5">
									<xsl:value-of select="@name" />
								</td>
								<td class="tdActions" style="min-width: 80px;">
									<span data-name="{@name}" class="faicon fa-cloud-download git" title="Import from Git"></span>
									<xsl:text>&#160;</xsl:text>
									<span class="faicon fa-remove git" title="Delete from git repository" data-name="{@name}"></span>
								</td>
							</tr>
						</xsl:if>
					</xsl:for-each>
				</xsl:if>
			</table>
		</div>
	</xsl:template>

</xsl:stylesheet>
