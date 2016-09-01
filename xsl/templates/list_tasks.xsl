<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:import href="dropdown_utils.xsl" />
	<xsl:output method="xml"/>
	
	<xsl:key name="groups" match="/page/tasks/task/@group" use="." />
	
	<xsl:template name="list_tasks">
		
		<div class="boxTitle">
			<span class="title">Tasks list</span>
			<a href="manage-task.php"><img class="action" src="images/plus3.png" title="Add new task" /></a>
		</div>
		<table>
			<tr>
				<th>Id</th>
				<th>Name</th>
				<th>Binary</th>
				<th>Parameters mode</th>
				<th>Host</th>
				<th class="thActions">Actions</th>
			</tr>
			
			<xsl:for-each select="page/tasks/task/@group[generate-id(.) = generate-id(key('groups', .))]">
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
					<tr class="evenOdd">
						<td>
							<xsl:value-of select="@id" />
						</td>
						<td>
							<span>
								<xsl:if test="$USE_GIT = 1">
									<xsl:attribute name="class">
										<xsl:choose>
											<xsl:when test="count(/page/git-tasks/entry[@name=current()/@name]) > 0 and
											count(/page/git-tasks/entry[@lastcommit=current()/@lastcommit]) = 0">gitNeedUpdate</xsl:when>
											<xsl:when test="@modified = 1">gitModified</xsl:when>
											<xsl:when test="count(/page/git-tasks/entry[@name=current()/@name]) = 0">gitNew</xsl:when>
										</xsl:choose>
									</xsl:attribute>
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
							
							<a href="manage-task.php?task_id={@id}">
								<img src="images/edit.gif"  />
							</a>
							<xsl:text>&#160;</xsl:text>
							<img data-confirm="Delete task {@name}" src="images/delete.gif" onclick="evqueueAPI(this, 'task', 'delete', {{ 'id':'{@id}' }});location.reload();" class="pointer" />
						</td>
					</tr>
				</xsl:for-each>
			</xsl:for-each>
			
			<tr class="groupspace"><td></td></tr>
			<tr class="group">
				<td colspan="6">Git</td>
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
		
		<div id="deleteTaskDlg" title="Delete task" style="display: none;">
			<i>Really delete task '<span class="taskName" />'? (#<span class="taskId" />)</i>
			<br/><br/>
			<label>
				<input type="checkbox" name="deleteBinary" />
				Also delete binary stored by evQueue
			</label>
			<br/><br/>
			<input type="submit" value="Delete Task" onclick="ajaxDelete('deleteTask',$('span.taskId').text(),'list-tasks.php',{{deleteBinary: $('input[name=deleteBinary]').is(':checked')?1:0 }});" />
		</div>
		
	</xsl:template>
	
	
	<xsl:template name="tasks-select">
		<select name="task_name">
			<optgroup>Retry schedule</optgroup>
			<xsl:for-each select="/page/tasks/task">
				<option value="{@name}">
					<xsl:value-of select="@name" />
				</option>
			</xsl:for-each>
		</select>
	</xsl:template>
	
	<xsl:template match="tasks-groups" mode="tasks-select">
		<xsl:param name="name" select="'@name'" />
		<xsl:param name="id" select="''" />
		<xsl:param name="selected_value" select="''" />
		
		<select name="{$name}" id="{$id}" >
			<xsl:for-each select="group">
				<optgroup>
					<xsl:attribute name="label">
						<xsl:choose>
							<xsl:when test=". = ''">
								No Group
							</xsl:when>
							<xsl:otherwise>
								<xsl:value-of select="." />
							</xsl:otherwise>
						</xsl:choose>
					</xsl:attribute>
					<xsl:for-each select="/page/tasks/task[@group=current()]">
						<option value="{@name}">
							<xsl:value-of select="@name" />
						</option>
					</xsl:for-each>
				</optgroup>
			</xsl:for-each>
		</select>
	</xsl:template>
	
</xsl:stylesheet>
