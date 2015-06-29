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
							<xsl:value-of select="@name" />
							<xsl:if test="@has-bound-task = 'yes'">
								<span style="font-size: 80%; color: darkgray;"> (simple)</span>
							</xsl:if>
							<xsl:text>&#160;</xsl:text>
							<img src="images/bigger.png" title="View workflow XML" class="pointer" onclick = "$('#xmlcontent{@id}').dialog({{width:800}});" />
							<div id="xmlcontent{@id}" style="display:none;">
								<xsl:apply-templates select="workflow" mode="xml_display" />
							</div>
							<img src="images/workflow.png" title="Tree Visualisation" class="pointer" onclick="$('#lightTree{@id}').dialog({{width: 'auto'}});" />
							<div id="lightTree{@id}" style="display:none;">
								<xsl:apply-templates select="workflow" mode="light-tree" />
							</div>
						</td>
						<td>
							<xsl:value-of select="@comment" />
						</td>
						<td class="tdActions" style="min-width: 80px;">
							<xsl:choose>
								<xsl:when test="@has-bound-task='no'">
									<a href="manage-workflow.php?workflow_id={@id}" title="Text edit">
										<img src="images/edition/edit-txt.png" />
									</a>
									<a href="manage-workflow-gui.php?workflow_id={@id}" title="Graphical edit">
										<img src="images/edition/edit-gui.png" />
									</a>
									<a href="export.php?workflow_id={@id}" title="Export (zip file)">
										<img src="images/zip.png" />
									</a>
								</xsl:when>
								<xsl:otherwise>
									<a href="manage-simple-workflow.php?workflow_id={@id}" title="Text edit">
										<img src="images/edition/edit-txt.png" />
									</a>
								</xsl:otherwise>
							</xsl:choose>
							<xsl:text>&#160;</xsl:text>
							<img src="images/delete.gif" onclick="deleteWorkflow({@id})" class="pointer" />
						</td>
					</tr>
				</xsl:for-each>
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
	
	
	<xsl:template match="workflow[@has-bound-task='yes']//task" mode="minimal" priority="1">
		<xsl:value-of select="/page/tasks/task[task_name = current()/@name]/task_binary" />
		<br/>
	</xsl:template>
	
	<xsl:template match="task" mode="minimal">
		<xsl:value-of select="@name" />
		<br/>
	</xsl:template>
	
	
</xsl:stylesheet>
