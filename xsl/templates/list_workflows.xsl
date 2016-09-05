<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:import href="dropdown_utils.xsl" />
	<xsl:import href="xmlhighlight.xsl" />
	<xsl:import href="workflow.xsl" />
	
	<xsl:key name="groups" match="/page/workflows/workflow/@group" use="." />
	
	<xsl:template name="list_workflows">
		
		<div style="text-align: center; margin-top: 2em;">
			<form method="post" enctype="multipart/form-data">
				<input type="file" name="workflow_zip_file" onchange="$(this).parents('form:eq(0)').submit();" />
				Drag-and-drop or browse for a zip file to add a new workflow.
				<input type="submit" value="Install" />
			</form>
			<xsl:call-template name="displayNotices" />
			<xsl:call-template name="displayErrors" />
		</div>
		
		<div id="workflow_edit_select" style="display:none;">Select workflow edition mode</div>
		<div class="boxTitle">
			<span class="title">Workflows List</span>
			<img src="images/plus3.png" title="Add new workflow (simple)" onclick="workflow_edit_method();" class="action"/>
		</div>
		<table>
			<tr>
				<th>Id</th>
				<th>Name</th>
				<th>Comment</th>
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
					<tr class="evenOdd">
						<td>
							<xsl:value-of select="@id" />
						</td>
						<td>
							
							<span>
								<xsl:if test="$USE_GIT = 1">
									<xsl:choose>
										<xsl:when test="count(/page/git-workflows/entry[@name=current()/@name]) > 0 and
										count(/page/git-workflows/entry[@lastcommit=current()/@lastcommit]) = 0">
											<xsl:attribute name="class">gitNeedUpdate</xsl:attribute>
											<xsl:attribute name="title">A newer version of this task exists</xsl:attribute>
										</xsl:when>
										<xsl:when test="@modified = 1">
											<xsl:attribute name="class">gitModified</xsl:attribute>
											<xsl:attribute name="title">This task as been modified</xsl:attribute>
										</xsl:when>
										<xsl:when test="count(/page/git-workflows/entry[@name=current()/@name]) = 0">
											<xsl:attribute name="class">gitNew</xsl:attribute>
											<xsl:attribute name="title">This task is not yet versionned</xsl:attribute>
										</xsl:when>
									</xsl:choose>
								</xsl:if>
								<xsl:value-of select="@name" />
							</span>
							
							
							<xsl:if test="@has-bound-task = 1">
								<span style="font-size: 80%; color: darkgray;"> (simple)</span>
							</xsl:if>
							<xsl:text>&#160;</xsl:text>
							<img src="images/bigger.png" title="View workflow XML" class="pointer" onclick = "$('#xmlcontent{@id}').dialog({{width:800}});" />
							<div id="xmlcontent{@id}" style="display:none;">
								<xsl:apply-templates select="." mode="xml_display" />
							</div>
							<img src="images/workflow.png" title="Tree Visualisation" class="pointer" onclick="$('#lightTree{@id}').dialog({{width: 'auto'}});" />
							<div id="lightTree{@id}" style="display:none;">
								<xsl:apply-templates select="." mode="light-tree" />
							</div>
						</td>
						<td>
							<xsl:value-of select="@comment" />
						</td>
						<td class="tdActions" style="min-width: 80px;">
							<xsl:if test="$USE_GIT = 1 and (@modified = 1 or @lastcommit = '')">
								<xsl:choose>
									<xsl:when test="count(/page/git-workflows/entry[@name=current()/@name]) > 0 and
									(count(/page/git-workflows/entry[@lastcommit=current()/@lastcommit]) > 0 or @lastcommit = '')">
										<img src="images/database_go.png" onclick="commit(this,'{@name}')" class="pointer" title="Save this workflow to Git"/>
									</xsl:when>
									<xsl:when test="count(/page/git-workflows/entry[@name=current()/@name]) = 0">
										<img src="images/database_go.png" onclick="commit(this,'{@name}')" class="pointer" title="Save this workflow to Git"/>
									</xsl:when>
									<xsl:when test="count(/page/git-workflows/entry[@name=current()/@name]) > 0 and
									count(/page/git-workflows/entry[@lastcommit=current()/@lastcommit]) = 0">
										<img src="images/database_go2.png" onclick="confirm('You are about to overwrite changes to the repository');commit(this,'{@name}', 'workflow', 'yes')" class="pointer" title="Save this workflow to Git"/>
										<img src="images/database_refresh.png" onclick="evqueueAPI(this, 'git', 'load_workflow', {{ 'name':'{@name}' }});location.reload();" class="pointer" title="Load this workflow from Git"/>
									</xsl:when>
								</xsl:choose>
							</xsl:if>
							
							<a href="manage-workflow.php?workflow_id={@id}" title="Text edit">
								<img src="images/edition/edit-txt.png" />
							</a>
							<a href="manage-workflow-gui.php?workflow_id={@id}" title="Graphical edit">
								<img src="images/edition/edit-gui.png" />
							</a>
							<a href="export.php?workflow_id={@id}" title="Export (zip file)">
								<img src="images/zip.png" />
							</a>
							<xsl:text>&#160;</xsl:text>
							<img data-confirm="Delete workflow {@id}" src="images/delete.gif" onclick="evqueueAPI(this, 'workflow', 'delete', {{ 'id':'{@id}' }});location.reload();" class="pointer" />
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
						<td colspan="3">
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
	</xsl:template>
	
	
	<xsl:template match="*" mode="minimal" priority="-1">
		<xsl:apply-templates select="*" mode="minimal" />
	</xsl:template>
	
	
	<xsl:template match="job" mode="minimal">
		<div class="job">
			<xsl:apply-templates select="*" mode="minimal" />
		</div>
	</xsl:template>
	
	
	<xsl:template match="workflow[@has-bound-task = 1]//task" mode="minimal" priority="1">
		<xsl:value-of select="/page/tasks/task[task_name = current()/@name]/task_binary" />
		<br/>
	</xsl:template>
	
	<xsl:template match="task" mode="minimal">
		<xsl:value-of select="@name" />
		<br/>
	</xsl:template>
	
	
</xsl:stylesheet>
