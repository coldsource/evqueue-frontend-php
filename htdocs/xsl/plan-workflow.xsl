<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:php="http://php.net/xsl">
	<xsl:import href="templates/main-template.xsl" />
	<xsl:import href="templates/workflow.xsl" />
	<xsl:import href="templates/edit_workflow.xsl" />
	<xsl:import href="templates/task.xsl" />
		
	<xsl:variable name="topmenu" select="'settings'" />

	<xsl:variable name="javascript">
		<src>js/plan-wf.js</src>
	</xsl:variable>

	<xsl:template name="content">
		<script type="text/javascript">
			availableTags = [
				<xsl:for-each select="/page/groups/group">
					<xsl:if test=". != ''">
						<xsl:text> '</xsl:text><xsl:value-of select="php:function('addslashes', string(.))" /><xsl:text>'</xsl:text>,
					</xsl:if>
				</xsl:for-each>
			];
		</script>
		
		<div class="contentManage formdiv">
			<div class="boxTitle leaveMenuSpace">
				<span class="title">Schedule a workflow</span>
			</div>
			
			<form id="formWorkflowSchedule" method="POST">
				<div id="tabs" class="">
					<ul>
						<li><a href="#generalTab">General</a></li>
						<li><a href="#nodeTab">Node</a></li>
						<li class="paramsTab"><a href="#paramsTab">Parameters</a></li>
						<li><a href="#hostTab">Host</a></li>
					</ul>
					
					<xsl:call-template name="displayErrors" />
					
					<div id="generalTab">
						<div class="infoBloc">
							<b>When?</b>
							<div class="selectMode" data-group="when">
								<span class="">Daily</span>
								<span class="selectModeOff">Custom</span>
							</div>
							<div class="cb"></div>
							
							<div class="planChoice item" data-group="when">
								<br />
								<label class="formLabel" for="daily">Every day at : </label> 
								<input id="daily" type="text" placeholder="Pick a daily time at which the workflow should run" >
									<xsl:if test="count(/page/units/unit[@label='Seconds']/value[@checked='true']) = 1 
										 and /page/units/unit[@label='Seconds']/value[@checked='true']/@label = 0
										 and count(/page/units/unit[@label='Minutes']/value[@checked='true']) = 1 
										 and count(/page/units/unit[@label='Hours']/value[@checked='true']) = 1 
										 and count(/page/units/unit[@label='Days']/value[@checked='true']) = 0 
										 and count(/page/units/unit[@label='Months']/value[@checked='true']) = 0 
										 and count(/page/units/unit[@label='Weekdays']/value[@checked='true']) = 0
									" >
										<xsl:attribute name="value">
											<xsl:if test="/page/units/unit[@label='Hours']/value[@checked='true']/@label &lt; 10" >
												<xsl:text>0</xsl:text>
											</xsl:if>
											<xsl:value-of select="/page/units/unit[@label='Hours']/value[@checked='true']/@label" />
											<xsl:text>:</xsl:text>
											<xsl:if test="/page/units/unit[@label='Minutes']/value[@checked='true']/@label &lt; 10" >
												<xsl:text>0</xsl:text>
											</xsl:if>
											<xsl:value-of select="/page/units/unit[@label='Minutes']/value[@checked='true']/@label" />
										</xsl:attribute>
									</xsl:if>
								</input>
							</div>

							<div class="planChoice hideMe item" data-group="when">
								<p>
									<b>Have your custom schedule :</b>
								</p>
								<table>
									<tbody>
										<tr>
											<xsl:for-each select="/page/units/unit">
												<td>
													<xsl:value-of select="@label" />
												</td>
											</xsl:for-each>
										</tr>
										<tr>
											<xsl:for-each select="/page/units/unit">
												<td>
													<select name="{@input_name}" multiple="multiple" size="12" class="custom-schedule-select">
														<option value="">
															<xsl:if test="count(value[@checked='true']) = 0">
																<xsl:attribute name="selected">selected</xsl:attribute>
															</xsl:if>
															*
														</option>
														<xsl:for-each select="value">
															<option value="{@index}">
																<xsl:if test="@checked = 'true'">
																	<xsl:attribute name="selected">selected</xsl:attribute>
																</xsl:if>

																<xsl:value-of select="@label" />
															</option>
														</xsl:for-each>
													</select>
												</td>
											</xsl:for-each>
										</tr>
									</tbody>
								</table>
								<p id="scheduleInEnglish"></p>
							</div>
						</div>


						<input type="hidden" name="workflow_schedule_id" value="{/page/get/@id}" />
						<input type="hidden" name="schedule" placeholder="Schedule definition" style="width: 50%;" value="{/page/schedule/workflow_schedule/@schedule}" />
						
						<div class="infoBloc">
							<b>What?</b>
							<div class="selectMode" data-group="what">
								<span class="">Workflow</span>
								<span class="selectModeOff">Script</span>
							</div>
							<div class="cb"></div>
							
							<div class="item planChoice" data-group="what">
								<label class="formLabel" >Workflow to run : </label>
								
								<xsl:choose>
									<xsl:when test="count(/page/schedule) = 0">
										<xsl:apply-templates select="/page/groups" mode="select_workflow">
											<xsl:with-param name="name" select="'workflow_id_select'" />
											<xsl:with-param name="selected_value" select=" /page/schedule/workflow_schedule/@workflow_id" />
											<xsl:with-param name="value" select="'id'" />
											<xsl:with-param name="display-bound-workflows" select="'no'" />
										</xsl:apply-templates>
									</xsl:when>
									<xsl:otherwise>
										<input type="hidden" name="workflow_id_select" value="{/page/schedule/workflow_schedule/@workflow_id}" />
										<xsl:value-of select="/page/workflows/workflow[@id = /page/schedule/workflow_schedule/@workflow_id]/@name" />
									</xsl:otherwise>
								</xsl:choose>
							</div>
							
							<div class="item planChoice hideMe" data-group="what">
								<xsl:call-template name="taskFormInputs" />
							</div>
							
							<xsl:if test="/page/workflows/workflow[@id = /page/schedule/workflow_schedule/@workflow_id]/@bound-to-schedule = 0">
								<script type="text/javascript">
									$('.selectMode[data-group=what] span:eq(1)').remove();
								</script>
							</xsl:if>
							
							<xsl:if test="/page/workflows/workflow[@id = /page/schedule/workflow_schedule/@workflow_id]/@bound-to-schedule = 1">
								<script type="text/javascript">
									$('.selectMode[data-group=what] span:eq(1)').click();
									$('.selectMode[data-group=what] span:eq(0)').remove();
								</script>
							</xsl:if>
							
						</div>
						
						<div class="infoBloc">
							<b>Config</b>
							<div class="item">
								<label class="formLabel">On failure : </label>
								<select name="onfailure">
									<option value="SUSPEND">
										<xsl:if test="/page/schedule/workflow_schedule/@onfailure = 'SUSPEND'">
											<xsl:attribute name="selected">selected</xsl:attribute>
										</xsl:if>
										Suspend
									</option>
									<option value="CONTINUE">
										<xsl:if test="/page/schedule/workflow_schedule/@onfailure = 'CONTINUE'">
											<xsl:attribute name="selected">selected</xsl:attribute>
										</xsl:if>
										Continue
									</option>
								</select>
							</div>

							<div class="item">
								<label class="formLabel" for="schedule_comment">Comment : </label>
								<input type="text" name="schedule_comment" id="schedule_comment" value="{/page/post/@schedule_comment | /page/schedule/workflow_schedule/@comment }" placeholder="" />	
							</div>

							<div class="item">
								<label class="formLabel" for="active">Active : </label>
								<input type="checkbox" name="active" id="active">
									<xsl:if test="/page/schedule/workflow_schedule/@active = 1">
										<xsl:attribute name="checked">checked</xsl:attribute>
									</xsl:if>
								</input>
							</div>
						</div>
					</div>
					<div id="paramsTab">
						<input type="hidden" name="schedule_parameters" value="" />
						<div id="paramsTabForm"></div>
					</div>
					<div id="nodeTab">
						<label>Plan workflow on node:</label>
						<select name="node_name">
							<xsl:for-each select="/page/evqueue-nodes/node">
								<option value="{@name}">
									<xsl:if test="@name = /page/schedule/node_name"><xsl:attribute name="selected">selected</xsl:attribute></xsl:if>
									<xsl:value-of select="@name" />
								</option>
							</xsl:for-each>
						</select>
					</div>
					<div id="hostTab">
						<br />
						<label for="schedule_user">Task user : </label>
						<input type="text" name="schedule_user" id="schedule_user" value="{/page/schedule/workflow_schedule/@user}" placeholder="Enter user here, leave blank for local execution" />

						<br />
						<label for="schedule_host">Task host : </label>
						<input type="text" name="schedule_host" id="schedule_host" value="{/page/schedule/workflow_schedule/@host}" placeholder="Enter host here, leave blank for local execution" />
					</div>
					<input type="button" value="Save this plan" onclick="setParameter(); $('#formWorkflowSchedule').submit();" />
				</div>
			</form>
			<div id="paramsTabClone">
				<xsl:for-each select="/page/workflows/workflow">
					<div id="schedule_workflow_parameter_{@id}" class="schedule_workflow_parameter">
						<div id="paramsTab_{@name}">
							<input type="hidden" name="id" value="{@name}" />
							<xsl:if test="count(parameters/parameter) = 0">
								No parameters for this workflow
							</xsl:if>
							<xsl:apply-templates select="parameters" mode="edit" />
						</div>
					</div>
				</xsl:for-each>
			</div>
		</div>
	</xsl:template>
	
</xsl:stylesheet>