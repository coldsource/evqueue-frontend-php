<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	<xsl:import href="templates/datetime.xsl" />
	
	<xsl:key name="groups" match="/page/workflows/workflow/@group" use="." />
	
	<xsl:variable name="topmenu">
		<xsl:if test="$DISPLAY='state'">system-state</xsl:if>
		<xsl:if test="$DISPLAY='settings'">settings</xsl:if>
	</xsl:variable>
	
	<xsl:variable name="javascript">
	</xsl:variable>
	
	<xsl:template name="content">
		<div class="contentList">
			<div class="boxTitle">
				<span class="title">Planned workflows</span>
				<xsl:if test="$DISPLAY = 'settings'">
					<a href="plan-workflow.php"><img class="action" src="images/plus3.png" title="Schedule a new workflow" /></a>
				</xsl:if>
			</div>
			<table>
				<tbody>
					<tr>
						<th>ID</th>
						<th>Workflow</th>
						<xsl:if test="$DISPLAY = 'settings'">
							<th>On failure</th>
						</xsl:if>
						<th>Node</th>
						<xsl:if test="$DISPLAY = 'settings'">
							<th>Host</th>
						</xsl:if>
						<xsl:if test="$DISPLAY = 'state'">
							<th style="width:130px;">Last execution</th>
						</xsl:if>
						<th style="width:130px;">Next execution time</th>
						<xsl:if test="$DISPLAY = 'settings'">
							<th style="width:60px;">Status</th>
						</xsl:if>
						<th class="thActions">Actions</th>
					</tr>
					
					<xsl:for-each select="/page/workflows/workflow/@group[generate-id(.) = generate-id(key('groups', .))]">
						<xsl:sort select="." />
						
						<xsl:variable name="groupName" select="." />
						<xsl:variable name="nbwfs" select="count(/page/schedules/schedule[ workflow_id = /page/workflows/workflow[ @group = $groupName ]/@id ])" />
						
						<xsl:if test="$nbwfs > 0">
							<xsl:if test="position() != 1">
								<tr class="groupspace"><td></td></tr>
							</xsl:if>
							<tr class="group">
								<td colspan="8" >
									<xsl:choose>
										<xsl:when test="$groupName != ''">
											<xsl:value-of select="$groupName" />  <!-- /page/workflows/workflow[@id = current()/workflow_id]/@group -->
										</xsl:when>
										<xsl:otherwise>
											No group
										</xsl:otherwise>
									</xsl:choose>
									<xsl:text> </xsl:text>
									(<xsl:value-of select="$nbwfs" />)
								</td>
							</tr>
						</xsl:if>
						
						<xsl:for-each select="/page/schedules/schedule">
							<xsl:if test="/page/workflows/workflow[@id = current()/workflow_id]/@group = $groupName">
								<tr class="evenOdd">
									<td>
										<xsl:value-of select="@id" />
									</td>
									<td>
										<xsl:value-of select="/page/workflows/workflow[@id = current()/workflow_id]/@name" />
										<xsl:if test="comment != ''">
											(<xsl:value-of select="comment" />)
										</xsl:if>
										<ul class="scheduleParameters">
											<xsl:for-each select="parameters/parameter">
												<li><xsl:value-of select="@name" />: <xsl:value-of select="." /></li>
											</xsl:for-each>
										</ul>
									</td>
									<xsl:if test="$DISPLAY = 'settings'">
										<td class="center">
											<xsl:value-of select="onfailure" />
										</td>
									</xsl:if>
									<td class="center">
										<xsl:value-of select="@node_name" />
									</td>
									<xsl:if test="$DISPLAY = 'settings'">
										<td class="center">
											<xsl:choose>
												<xsl:when test="host != ''"><xsl:value-of select="host" /></xsl:when>
												<xsl:otherwise>localhost</xsl:otherwise>
											</xsl:choose>
										</td>
									</xsl:if>
									<xsl:if test="$DISPLAY = 'state'">
										<td class="center">
											<a href="index.php?workflow_instance_id={/page/last-execution/workflow[@workflow_schedule_id = current()/@id]/@workflow_instance_id}">
												<xsl:choose>
													<xsl:when test="/page/last-execution/workflow[@workflow_schedule_id = current()/@id]/@workflow_instance_errors>0">
														<img src="images/exclamation.png" alt="Errors" title="Errors" />
													</xsl:when>
													<xsl:when test="count(/page/last-execution/workflow[@workflow_schedule_id = current()/@id]/@workflow_instance_end) > 0">
														<img src="images/ok.png" />
													</xsl:when>
													<xsl:when test="count(/page/last-execution/workflow[@workflow_schedule_id = current()/@id]) = 0">

													</xsl:when>
													<xsl:otherwise>
														<img src="images/ajax-loader.gif" />
													</xsl:otherwise>
												</xsl:choose>
											</a>
											<xsl:text>&#160;</xsl:text>
											<xsl:call-template name="displayDateAndTime">
												<xsl:with-param name="datetime_start" select="/page/last-execution/workflow[@workflow_schedule_id = current()/@id]/@workflow_instance_start" />
											</xsl:call-template>
										</td>
									</xsl:if>
									<td class="center">
										<xsl:call-template name="displayDateAndTime">
											<xsl:with-param name="datetime_start" select="/page/status/workflow[@workflow_schedule_id = current()/@id]/@scheduled_at" />
										</xsl:call-template>
									</td>
									<xsl:if test="$DISPLAY = 'settings'">
										<td class="center">
											<xsl:choose>
												<xsl:when test="active = 1"><img src="images/ok.png" /></xsl:when>
												<xsl:otherwise test="active = 1"><img src="images/locked.png" /></xsl:otherwise>
												<xsl:otherwise>-</xsl:otherwise>
											</xsl:choose>
										</td>
									</xsl:if>
									<td class="center">
										<a href="index.php?workflow_schedule_id={@id}" title="See workflows launched by this schedule" style="text-decoration: none;">
											<img src="images/eye.png" />
										</a>
										<xsl:if test="$DISPLAY = 'settings'">
											<xsl:text>&#160;</xsl:text>
											<a href="plan-workflow.php?id={@id}" style="text-decoration: none;"><img src="images/edit.gif" /></a>
											<xsl:text>&#160;</xsl:text>
											<img onclick="if (confirm('Really delete (and deactivate) workflow schedule '+{@id}+'?')) ajaxDelete('deleteWorkflowSchedule',{@id},'list-workflow-schedules.php');" src="images/delete.gif" class="pointer"/>
										</xsl:if>
									</td>
								</tr>
							</xsl:if>
						</xsl:for-each>
					</xsl:for-each>
				</tbody>
			</table>
		</div>
	</xsl:template>
	
</xsl:stylesheet>