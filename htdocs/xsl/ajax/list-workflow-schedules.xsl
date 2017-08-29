<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="../templates/datetime.xsl" />
	
	<xsl:key name="groups" match="/page/workflows/workflow/@group" use="." />
	
	<xsl:template match="/">
		<div class="contentList">
			<div class="boxTitle">
				<span class="title">Planned workflows</span>
				<span class="faicon fa-file-o action" title="Plan a new workflow"></span>
			</div>
			<table>
				<tbody>
					<tr>
						<th>Workflow</th>
						<th>On failure</th>
						<th style="width:100px;">Node</th>
						<th>Host</th>
						<th style="width:170px;">Last execution</th>
						<th style="width:140px;">Next execution time</th>
						<th style="width:60px;">Status</th>
						<th class="thActions">Actions</th>
					</tr>
					
					<xsl:for-each select="/page/workflows/workflow/@group[generate-id(.) = generate-id(key('groups', .))]">
						<xsl:sort select="." />
						
						<xsl:variable name="groupName" select="." />
						<xsl:variable name="nbwfs" select="count(/page/schedules/workflow_schedule[ @workflow_id = /page/workflows/workflow[ @group = $groupName ]/@id ])" />

						<xsl:if test="$nbwfs > 0">
							<xsl:if test="position() != 1">
								<tr class="groupspace"><td></td></tr>
							</xsl:if>
							<tr class="group">
								<td colspan="8" >
									<xsl:choose>
										<xsl:when test="$groupName != ''">
											<xsl:value-of select="$groupName" />
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
						
						<xsl:for-each select="/page/schedules/workflow_schedule">
							<xsl:if test="/page/workflows/workflow[@id = current()/@workflow_id]/@group = $groupName">
								<tr class="evenOdd" data-id="{@id}">
									<td>
										<xsl:value-of select="/page/workflows/workflow[@id = current()/@workflow_id]/@name" />
										<xsl:if test="@comment != ''">
											(<i><xsl:value-of select="@comment" /></i>)
										</xsl:if>
										<ul class="scheduleParameters">
											<xsl:for-each select="parameter">
												<li><xsl:value-of select="@name" />: <xsl:value-of select="@value" /></li>
											</xsl:for-each>
										</ul>
									</td>
										<td class="center">
											<xsl:value-of select="@onfailure" />
										</td>
									<td class="center">
										<xsl:value-of select="@node" />
									</td>
									<td class="center">
										<xsl:choose>
											<xsl:when test="@host != ''"><xsl:value-of select="@host" /></xsl:when>
											<xsl:otherwise>localhost</xsl:otherwise>
										</xsl:choose>
									</td>
									<td class="center">
										<a href="index.php?workflow_instance_id={/page/workflow-schedules-instance/workflow[@schedule_id = current()/@id]/@id}">
											<xsl:choose>
												<xsl:when test="/page/workflow-schedules-instance/workflow[@schedule_id = current()/@id]/@errors>0">
													<img src="images/exclamation.png" alt="Errors" title="Errors" />
												</xsl:when>
												<xsl:when test="count(/page/workflow-schedules-instance/workflow[@schedule_id = current()/@id]/@end_time) > 0">
													<img src="images/ok.png" />
												</xsl:when>
												<xsl:when test="count(/page/workflow-schedules-instance/workflow[@schedule_id = current()/@id]) = 0">

												</xsl:when>
												<xsl:otherwise>
													<img src="images/ajax-loader.gif" />
												</xsl:otherwise>
											</xsl:choose>
										</a>
										<xsl:text>&#160;</xsl:text>
										<xsl:call-template name="displayDateAndTime">
											<xsl:with-param name="datetime_start" select="/page/workflow-schedules-instance/workflow[@schedule_id = current()/@id]/@start_time" />
										</xsl:call-template>
									</td>
									<td class="center">
										<xsl:call-template name="displayDateAndTime">
											<xsl:with-param name="datetime_start" select="/page/status/response/status/workflow[@workflow_schedule_id = current()/@id]/@scheduled_at" />
										</xsl:call-template>
									</td>
									<td class="tdActions">
										<a href="index.php?workflow_schedule_id={@id}"><span class="faicon fa-eye" title="View launched instances"></span></a>
										<xsl:choose>
											<xsl:when test="@active = 1"><span class="faicon fa-check" title="Disable this schedule"></span></xsl:when>
											<xsl:otherwise test="@active = 1"><span class="faicon fa-lock" title="Enable this schedule"></span></xsl:otherwise>
											<xsl:otherwise>-</xsl:otherwise>
										</xsl:choose>
									</td>
									<td class="tdActions">
										<span class="faicon fa-edit" title="Edit schedule"></span>
										<xsl:text>&#160;</xsl:text>
										<span class="faicon fa-remove" title="Delete schedule" data-confirm="You are about to delete the selected schedule"></span>
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