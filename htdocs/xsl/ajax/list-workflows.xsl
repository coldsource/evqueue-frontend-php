<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:output method="html" indent="yes" omit-xml-declaration="yes" encoding="utf-8" doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" />
	
	<xsl:key name="groups" match="/page/workflows/workflow/@group" use="." />
	
	<xsl:template match="/">
		<div>
			<div class="boxTitle">
				<span class="title">Workflows List</span>
				<span class="faicon fa-file-o action" title="Create new workflow"></span>
			</div>
			<table>
				<tr>
					<th>Name</th>
					<th>Comment</th>
					<xsl:if test="$USE_GIT = 1">
						<th>Git</th>
					</xsl:if>
					<th class="thActions">Actions</th>
				</tr>

				<xsl:for-each select="/page/workflows/workflow/@group[generate-id(.) = generate-id(key('groups', .))]">
					<xsl:sort select="." />

					<xsl:variable name="groupName" select="." />

					<xsl:if test="position() != 1">
						<tr class="groupspace"><td></td></tr>
					</xsl:if>
					<tr class="group">
						<td colspan="5">
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

					<xsl:for-each select="/page/workflows/workflow[@group = $groupName]">
						<tr class="evenOdd" data-id = "{@id}">
							<td>
								<span>
									<xsl:value-of select="@name" />
									
									<xsl:if test="$USE_GIT = 1">
										<xsl:if test="count(/page/git-workflows/entry[@name=current()/@name])">
											<xsl:text>&#160;</xsl:text><span class="faicon fa-git" title="This workflow is versioned"></span>
										</xsl:if>
									</xsl:if>
								</span>

							</td>
							<td>
								<xsl:value-of select="@comment" />
							</td>
							<xsl:if test="$USE_GIT = 1">
								<td class="tdActions">
									<xsl:if test="@modified = 1 or @lastcommit = ''">
										<span class="faicon fa-upload" title="Commit this workflow to Git">
											<xsl:if test="count(/page/git-workflows/entry[@name=current()/@name]) > 0 and count(/page/git-workflows/entry[@lastcommit=current()/@lastcommit]) = 0">
												<xsl:attribute name="data-confirm">You are about to overwrite changes to the repository</xsl:attribute>
												<xsl:attribute name="data-force">yes</xsl:attribute>
											</xsl:if>
										</span>
										<xsl:text>&#160;</xsl:text>
										
										<xsl:if test="count(/page/git-workflows/entry[@name=current()/@name]) > 0 and count(/page/git-workflows/entry[@lastcommit=current()/@lastcommit]) = 0">
											<span class="faicon fa-download" title="Load Git version (erase local modifications)"></span>
											<xsl:text>&#160;</xsl:text>
										</xsl:if>
									</xsl:if>
								</td>
							</xsl:if>
							<td class="tdActions" style="min-width: 80px;">
								<span class="faicon fa-file-archive-o" title="Export workflow and dependencies"></span>
								<xsl:text>&#160;</xsl:text>
								<span class="faicon fa-edit" title="Edit workflow"></span>
								<xsl:text>&#160;</xsl:text>
								<span class="faicon fa-remove" title="Delete workflow" data-confirm="You are about to delete the selected workflow"></span>
							</td>
						</tr>
					</xsl:for-each>
				</xsl:for-each>


				<tr class="groupspace"><td></td></tr>
				<tr class="group">
					<td colspan="5">Git only</td>
				</tr>
				<xsl:for-each select="/page/git-workflows/entry">
					<xsl:if test="count(/page/workflows/workflow[@name = current()/@name]) = 0">
						<tr class="evenOdd">
							<td colspan="2">
								<xsl:value-of select="@name" />
							</td>
							<td class="tdActions" style="min-width: 80px;">
								<img src="images/database_refresh.png" onclick="evqueueAPI(this, 'git', 'load_workflow', {{ 'name':'{@name}' }});location.reload();" class="pointer"/>
								<img data-confirm="Delete workflow {@name}" src="images/delete.gif" onclick="evqueueAPI(this, 'git', 'remove_workflow', {{ 'name':'{@name}', 'commit_log':'{@name} removed' }});location.reload();" class="pointer" />
							</td>
						</tr>
					</xsl:if>
				</xsl:for-each>
			</table>
		</div>
	</xsl:template>

</xsl:stylesheet>
