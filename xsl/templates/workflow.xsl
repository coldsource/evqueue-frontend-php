<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" xmlns:php="http://php.net/xsl" version="1.0">
	<xsl:import href="datetime.xsl" />
	<xsl:import href="xmlhighlight.xsl" />
	
	<xsl:template match="workflow">
		<xsl:variable name="trClass">
			<xsl:choose>
				<xsl:when test="position() mod(2) = 1">evenTr</xsl:when>
				<xsl:otherwise>oddTr</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="nbErrorsMsg">
			<xsl:choose>
				<xsl:when test="count(@errors)=1">1 error</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="count(@errors)" /> errors</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<tr class="{$trClass}">
			<td class="workflowStatus">
				<xsl:variable name="current-node">
					<xsl:copy-of select="." />
				</xsl:variable>
				<xsl:choose>
					<xsl:when test="@errors>0">
						<img src="images/exclamation.png" alt="Errors" title="Errors" />
					</xsl:when>
					<xsl:when test="count(exsl:node-set($current-node)//task[@retry_at != '']) > 0">
						<img src="images/alarm_clock.png" title="A task ended badly and will retry" />
					</xsl:when>
					<xsl:when test="count(exsl:node-set($current-node)//task[@status = 'QUEUED']) > 0">
						<img src="images/waitpoint.gif" />
					</xsl:when>
					<xsl:when test="count(@end_time) > 0">
						<img src="images/ok.png" />
					</xsl:when>
					<xsl:otherwise>
						<img src="images/ajax-loader.gif" />
					</xsl:otherwise>
				</xsl:choose>
			</td>

			<td>
				<span class="action" data-id="{@id}" data-node-name="{@node_name | ../@node_name}">
					<img src="images/plus.png" />
					<xsl:text> </xsl:text>
					<xsl:value-of select="@id" />
					&#8211; 
					<xsl:value-of select="@name" />
				</span>
				<xsl:text>&#160;</xsl:text>
				<xsl:variable name="seconds">
					<xsl:apply-templates select="." mode="total-time" />
				</xsl:variable>
				
				<xsl:text>(</xsl:text>
				<xsl:call-template name="display-split-time">
					<xsl:with-param name="seconds" select="$seconds" />
				</xsl:call-template>
				<xsl:text>)</xsl:text>
			</td>
			<td class="tdHost">
				<xsl:value-of select="@node_name | ../@node_name" />
			</td>
			<td class="tdHost">
				<xsl:choose>
					<xsl:when test="@host != ''"><xsl:value-of select="@host" /></xsl:when>
					<xsl:otherwise>localhost</xsl:otherwise>
				</xsl:choose>
			</td>
			<td class="tdStarted">
				<xsl:call-template name="displayDateAndTime">
					<xsl:with-param name="datetime_start" select="@start_time" />
				</xsl:call-template>
			</td>
			<xsl:if test="count(@end_time) > 0">
				<td class="tdFinished">
					<xsl:if test="@end_time != '0000-00-00 00:00:00'">
						<xsl:call-template name="displayDateAndTime">
							<xsl:with-param name="datetime_end" select="@end_time" />
						</xsl:call-template>
					</xsl:if>		
				</td>
			</xsl:if>
			
			<td class="tdActions">
				<xsl:if test="@status='EXECUTING' and (/page/private/logged-in-user/@profile = 'ADMIN' or /page/private/logged-in-user/workflow[@wfname = current()/@name]/right[@action='kill'] = 1)">
					<img src="images/stop.png" data-wfiid="{@id}" data-node-name="{../@node_name}" class="stopWFI" alt="Stop execution of this workflow" title="Stop execution of this workflow" />
				</xsl:if>
				
				<xsl:if test="@status='TERMINATED'">
					<xsl:call-template name="deleteWFI">
						<xsl:with-param name="wfiid" select="@id" />
					</xsl:call-template>
				</xsl:if>
			</td>		
		</tr>
		<tr id="tr{@id}" class="hidden">
			<td colspan="7" class="details">
			</td>
		</tr>
	</xsl:template>
	
	
	<xsl:template match="workflow" mode="total-time">
		<xsl:choose>
			<xsl:when test="count(@end_time) > 0">
				<xsl:value-of select="php:function('strtotime',string(@end_time))-php:function('strtotime',string(@start_time))" />
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="php:function('strtotime',string($NOW))-php:function('strtotime',string(@start_time))" />
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	
	
	<xsl:template name="display-split-time">
		<xsl:param name="seconds" />
		
		<xsl:if test="$seconds div 86400 >= 1">
			<xsl:value-of select="floor($seconds div 86400)" />
			<xsl:text>days, </xsl:text>
		</xsl:if>
		<xsl:if test="$seconds div 3600 >= 1">
			<xsl:value-of select="floor($seconds div 3600) mod 24" />
			<xsl:text>h </xsl:text>
		</xsl:if>
		<xsl:if test="$seconds div 60 >= 1">
			<xsl:value-of select="floor($seconds div 60) mod 60" />
			<xsl:text>m </xsl:text>
		</xsl:if>
		<xsl:value-of select="$seconds mod 60" />
		<xsl:text>s</xsl:text>
	</xsl:template>
	
	
	<xsl:template match="workflow" mode="launch">
		<xsl:apply-templates select="." mode="launchbox">
			<xsl:with-param name="prefix" select="''" />
			<xsl:with-param name="identifier" select="../@name" />
		</xsl:apply-templates>
	</xsl:template>
	
	<xsl:template match="workflow" mode="relaunch">
		<xsl:apply-templates select="." mode="launchbox" />
	</xsl:template>
	
	<xsl:template match="workflow" mode="launchbox">
		<xsl:param name="prefix" select="'re'" />
		<xsl:param name="identifier" select="@id" />
		<!-- default parameters for relaunching -->
		
		<div id="{$prefix}launch_{$identifier}" class="hideMe">
			<div class="modalTitle">
				<xsl:value-of select="@name" />
			</div>
			
			<form method="post" id="{$prefix}launchForm_{$identifier}">
				<div id="tabs_{$identifier}" class="makeMeTabz">
					<ul>
						<li><a href="#paramsTab_{$identifier}">Parameters</a></li>
						<li><a href="#nodeTab_{$identifier}">Node</a></li>
						<li><a href="#hostTab_{$identifier}">Host</a></li>
					</ul>
					
					
					<div id="paramsTab_{$identifier}">
						<input type="hidden" name="id" value="{$identifier}" />
						<xsl:if test="count(parameters/parameter) = 0">
							No parameters for this workflow
						</xsl:if>
						<xsl:apply-templates select="parameters" mode="edit"></xsl:apply-templates>
					</div>
					
					
					<div id="nodeTab_{$identifier}">
						<select name="node">
							<xsl:for-each select="/page/evqueue-nodes/node">
								<option value="{@name}"><xsl:value-of select="@name" /></option>
							</xsl:for-each>
						</select>
					</div>
					
					<div id="hostTab_{$identifier}">
						<table>
							<tr class="evenOdd">
								<td>User</td>
								<td><input type="text" name="user" value="{@user}" placeholder="Enter user here, leave blank for local execution" /></td>
							</tr>
							<tr class="evenOdd">
								<td>Host</td>
								<td><input type="text" name="host" value="{@host}" placeholder="Enter host here, leave blank for local execution" /></td>
							</tr>
						</table>
					</div>
				</div>
				<input id="searchSubmit2_{$identifier}" class="righty searchSubmit2" type="submit" value="Launch workflow" />
			</form>
		</div>
	</xsl:template>
	
	
	<xsl:template match="workflow" mode="tree">
		<xsl:apply-templates select="." mode="relaunch" />
		
		<xsl:variable name="hiddenClass">
			<xsl:if test="$EDITION = 0">
				<xsl:text> hidden</xsl:text>
			</xsl:if>
		</xsl:variable>
		<xsl:variable name="editionClass">
			<xsl:if test="$EDITION = 1">editionWorkflow</xsl:if>
		</xsl:variable>
		
		<div class="workflow {$editionClass}" id="workflow{@id}">
			<img src="images/listli.png" class="formattedXml" /> 
			<xsl:text>&#160;</xsl:text>
			<img src="images/re-launch.png" data-wfiid="{@id}" class="relaunch" alt="Re-launch workflow instance" title="Re-launch workflow instance" ></img>
			<xsl:text>&#160;</xsl:text>
			<img class="viewXML" src="images/bigger.png" title="View workflow XML" onclick="$('#xmlcontent{@id}').dialog({{width:800}});" />
			<div id="xmlcontent{@id}" style="display:none;">
				<xsl:apply-templates select="." mode="xml_display" />
			</div>
			
			<xsl:if test="@version != '' and $EDITION = 0">
				(version <xsl:value-of select="@version" />)
			</xsl:if>
			
			<xsl:if test="$EDITION = 0">
				<xsl:variable name="totalTime">
					<xsl:apply-templates select="." mode="total-time" />
				</xsl:variable>
				
				<xsl:variable name="execTime" select="php:function('sumExecTimes', .//task/output)" />
				<xsl:variable name="retryTime" select="php:function('sumRetryTimes', .//task/output)" />
				<xsl:variable name="queueTime" select="$totalTime - $execTime - $retryTime" />
				
				<span class="exectime" style="margin-left: 5px; background-color: rgba(0,255,0,0.1); padding: 2px 5px; /* TODO: move to stylesheet */">
					<xsl:text>real time </xsl:text>
					<xsl:call-template name="display-split-time">
						<xsl:with-param name="seconds" select="$execTime" />
					</xsl:call-template>
				</span>
				<span class="queuetime" style="margin-left: 5px; background-color: rgba(0,0,255,0.1); padding: 2px 5px; /* TODO: move to stylesheet */">
					<xsl:text>queued for </xsl:text>
					<xsl:call-template name="display-split-time">
						<xsl:with-param name="seconds" select="$queueTime" />
					</xsl:call-template>
				</span>
				<span class="retrytime" style="margin-left: 5px; background-color: rgba(255,0,0,0.1); padding: 2px 5px; /* TODO: move to stylesheet */">
					<xsl:text>waited </xsl:text>
					<xsl:call-template name="display-split-time">
						<xsl:with-param name="seconds" select="$retryTime" />
					</xsl:call-template>
					<xsl:text> for retrials</xsl:text>
				</span>
			</xsl:if>
			
			<div id="xml_{@id}" class="xml">
				<div class="okxml{$hiddenClass}">
					<xsl:apply-templates select="parameters" />
				</div>
			</div>
			
			<div id="jobs_{@id}">
				<xsl:apply-templates select="subjobs/job">
					<xsl:with-param name="first" select="1" />
				</xsl:apply-templates>
			</div>
			
			<xsl:if test="$EDITION = 1">
				<xsl:variable name="another">
					<xsl:if test="count(/page/session/workflow/workflow/subjobs) > 0">another </xsl:if>
				</xsl:variable>
				<input type="button" onclick="executeAction('addTask');" value="Add {$another}root task" />
			</xsl:if>
		</div>
	</xsl:template>
	
	
	<xsl:template match="job">
		<xsl:param name="first" select="0" />
		<xsl:param name="skipped" select="0" />
		
		<xsl:variable name="skipped2">
			<xsl:choose>
				<xsl:when test="$skipped = 1 or @status = 'SKIPPED'">1</xsl:when>
				<xsl:otherwise>0</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		
		<xsl:variable name="jobClass">
			job actionItem
			<xsl:if test="$first = 1">
				noLeftPadding
			</xsl:if>
			<xsl:if test="$skipped2 = 1">
				skipped
			</xsl:if>
		</xsl:variable>
		
		<div class="{$jobClass}" data-type="job" data-name="{@name}" data-loop="{@loop}" data-condition="{@condition}">
			<xsl:attribute name="data-xpath">
				<xsl:apply-templates select="." mode="xpath" />
			</xsl:attribute>
			
			<xsl:if test="@status = 'ABORTED'">
				<img src="images/exclamation.png" class="exclamationdetails" alt="{@details}" title="{@details}" />
				<xsl:text>&#160;</xsl:text>
				<xsl:value-of select="@details" />
			</xsl:if>
			
			<div class="tasks">
				<xsl:if test="count(subjobs/job/tasks/task) > 0">
					<img src="images/minus.png" class="showmemore" />
				</xsl:if>
				
				<xsl:if test="$EDITION=1">
					<div class="jobInfos">
						<img class="editJob" src="images/edition/edit.gif" title="Edit this job (name, loop, condition)" onclick="editJob($(this));" />
						<xsl:if test="count(@name) > 0">
							<div class="boxTitleJob">
								<span title="Job name">
									<xsl:value-of select="@name" />
								</span>
							</div>
						</xsl:if>
						<xsl:if test="count(@condition) > 0">
							<span class="jobCondition" title="Job condition is: {@condition}">[?]</span>
						</xsl:if>
						<xsl:if test="count(@loop) > 0">
							<span class="jobLoop" title="Loop on: {@loop}">⟲</span>
						</xsl:if>
					</div>
				</xsl:if>
				
				<xsl:apply-templates select="tasks/task">
					<xsl:with-param name="skipped">
						<xsl:value-of select="$skipped2" />
					</xsl:with-param>
				</xsl:apply-templates>
			</div>
			
			<xsl:apply-templates select="subjobs/job">
				<xsl:with-param name="skipped">
					<xsl:value-of select="$skipped2" />
				</xsl:with-param>
			</xsl:apply-templates>
		</div>
	</xsl:template>
	
	
	<xsl:template match="task">
		<xsl:param name="skipped" select="0" />
		
		<xsl:variable name="nbErrorsMsg">
			<xsl:choose>
				<xsl:when test="count(@errors)=1">1 error</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="count(@errors)" /> errors</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		
		<div data-name="{@name}" data-type="task" data-queue="{@queue}" data-retry-schedule="{@retry_schedule}" data-loop="{@loop}">
			<xsl:attribute name="class">
				task actionItem
				<xsl:if test="position() = 1">
					firstJobTask
				</xsl:if>
			</xsl:attribute>
			<xsl:attribute name="data-xpath">
				<xsl:apply-templates select="." mode="xpath" />
			</xsl:attribute>
			
			<xsl:variable name="nbtasks" select="count(../../subjobs/job/tasks/task)" />
			
			<span class="tasktitle">
				<xsl:if test="@loop != ''">
					<span title="Loop on: {@loop}" class="taskLoop">⟲</span>
				</xsl:if>
				Task
				<xsl:variable name="tied-task-binary">
					<xsl:value-of select="/page/tasks/task[workflow_id != '' and task_name = current()/@name]/task_binary" />
				</xsl:variable>
				<span class="eyeCatchy taskName">
					<xsl:choose>
						<xsl:when test="$tied-task-binary != ''">
							<xsl:value-of select="$tied-task-binary" />
						</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="@name" />
						</xsl:otherwise>
					</xsl:choose>
				</span>
				<xsl:if test="@queue">
					<span class="queueInfo" title="task in queue '{@queue}'"> [<xsl:value-of select="@queue" />]</span>
				</xsl:if>
			</span>
			
			<div class="retrySchedule" title="Retry schedule">
				<xsl:if test="@retry_schedule != ''">
					[<xsl:value-of select="@retry_schedule" />]
				</xsl:if>
			</div>
			
			<xsl:if test="$EDITION=0">
				<span class="taskState">
					<xsl:choose>
						<xsl:when test="@status">
							<xsl:choose>
								<xsl:when test="@status='TERMINATED' and @retry_at != ''">
									<img src="images/exclamation.png" class="exclamationdetails" alt="{$nbErrorsMsg}" title="{$nbErrorsMsg}" />
									<img src="images/alarm_clock.png" class="alarm_clock" /> 
									<xsl:value-of select="@retry_at" /> 
								</xsl:when>
								<xsl:when test="@status='TERMINATED' and @retval!= '' and @retval!= '0'">
									<img src="images/exclamation.png" class="exclamationdetails" /> 
									<xsl:value-of select="@retry_at" />
									
									return value: <xsl:value-of select="@retval" />
								</xsl:when>
								<xsl:when test="@status='TERMINATED'">
									<img src="images/ok.png" class="terminatedico" /> 
								</xsl:when>
								<xsl:when test="@status='ABORTED'">
									<img src="images/exclamation.png" alt="{@status}" title="{@status}" />
								</xsl:when>
								<xsl:when test="@status='EXECUTING'">
									EXECUTING
									<xsl:if test="@status='EXECUTING' and (/page/private/logged-in-user/@profile = 'ADMIN' or /page/private/logged-in-user/workflow[@wfname = current()/ancestor::workflow[1]/@name]/right[@action='kill'] = 1)">
										<img class="killTask" src="images/bomb.png" title="Kill Task" onclick="killTask({ancestor::workflow[1]/@id}, {@pid});" />
									</xsl:if>
								</xsl:when>
								<xsl:when test="@status='QUEUED'">
									QUEUED
								</xsl:when>
							</xsl:choose>
						</xsl:when>
						<xsl:otherwise>
							<xsl:choose>
								<xsl:when test="$skipped=0">
									<img src="images/waitpoint.gif" title="Waiting for the previous job to finish" alt="Waiting for the previous job to finish" class="waitpoint" />
									<span class="taskStats">Waiting for the previous job to finish</span>
								</xsl:when>
								<xsl:otherwise>
									<img src="images/skipped.gif" alt="skipped" title="skipped" class="showskippeddetails" align="absolutemiddle" />
									<div class="skippedcause hidden">
										<ul>
											<li>Status: <xsl:value-of select="../../@status" /></li>
											<li>Name: <xsl:value-of select="../../@name" /></li>
											<li>Details: <xsl:value-of select="../../@details" /></li>
											<li>Condition:  <xsl:value-of select="../../@condition" /></li>
										</ul>
									</div>
								</xsl:otherwise>
							</xsl:choose>
						</xsl:otherwise>
					</xsl:choose>
				</span>
			</xsl:if>
			
			<xsl:if test="@error">
				<span>
					<xsl:value-of select="@error" />
				</span>
			</xsl:if>
			
			<span class="nbsubjobs">
				<xsl:if test="$nbtasks > 1">
					(<xsl:value-of select="$nbtasks" /> sub-tasks)
				</xsl:if>
			</span>
			
			<xsl:if test="@execution_time">
				<span class="taskStats">
					last execution time: 
					<xsl:call-template name="display-time">
						<xsl:with-param name="timestamp" select="@execution_time" />
					</xsl:call-template>
				</span>
			</xsl:if>
			
			<xsl:if test="@status='TERMINATED'">
				<div class="taskOutput hidden">
					<xsl:if test="@retval and @retval != 0">
						<xsl:variable name="retval">
							<xsl:value-of select="@retval" />
						</xsl:variable>
						<ul class="errors">
							<li>
								return value: <xsl:value-of select="@retval" />
							</li>
						</ul>
					</xsl:if>
					<xsl:variable name="not-tied-task-binary">
						<xsl:value-of select="/page/tasks/task[workflow_id = '' and task_name = current()/@name]/task_binary" />
					</xsl:variable>
					<xsl:if test="$not-tied-task-binary != ''">
						<ul class="file">
							<li>
								<xsl:value-of select="$not-tied-task-binary" />
							</li>
						</ul>
					</xsl:if>
					<ul class="inputs">
						<xsl:for-each select="input">
							<li>
								<xsl:if test="@name">
									<b>
										<xsl:value-of select="@name" />
									</b>: 
								</xsl:if>
								<xsl:value-of select="." />
							</li>
						</xsl:for-each>
					</ul>
					<ul class="errors">
						<xsl:if test="@status = 'ABORTED'">
							<li>ABORTED</li>
						</xsl:if>
						<xsl:if test="@error">
							<li>
								<xsl:value-of select="@error" />
							</li>
						</xsl:if>
					</ul>
					<xsl:for-each select="output">
						<xsl:call-template name="node" />
					</xsl:for-each>
				</div>
			</xsl:if>
			
			<xsl:if test="$EDITION=1">
				<div class="actions">
					<div class="addTaskContainer" title="Add a parallel task" onclick="executeAction('addParallelTask',$(this))">
						<img class="addTaskArrowDown" src="images/edition/arrow-down.png" />
						<img src="images/edition/addTask.png" />
					</div>
					<div class="addTaskContainer" title="Add a child task" onclick="executeAction('addChildTask',$(this))" style="margin: 0 5px;">
						<img class="addTaskArrowRight" src="images/edition/arrow-right.png" />
						<img src="images/edition/addTask.png" />
					</div>
					<div class="addTaskContainer" title="Add a parent task" onclick="executeAction('addParentTask',$(this))" style="margin-left: 5px;">
						<img class="addTaskArrowLeft" src="images/edition/arrow-right.png" />
						<img src="images/edition/addTask.png" />
					</div>
					<img class="editTask" src="images/edition/edit.gif" title="Edit this task" onclick="editTask($(this));" />
					<img src="images/edition/delete.png" class="deleteTask" title="Delete this task" onclick="executeAction('deleteTask',$(this));" />
					<img class="editTaskInputs" src="images/input.png" title="Edit this task's inputs" onclick="editTaskInputs($(this));" />
				</div>
				
				<ul class="taskInputs">
					<xsl:apply-templates select="input|stdin" />
					
					<!-- display STDIN in edition mode even if there's none -->
					<xsl:if test="count(stdin) = 0">
						<li class="taskInput" data-name="stdin" data-type="stdin">
							<span class="taskInputName taskInputNameSTDIN">STDIN</span>
							<div class="taskInputValues">
								<span data-type="text" data-value="" title="text">not used yet</span>
							</div>
							<xsl:call-template name="inputActions" />
						</li>
					</xsl:if>
						
					<li>
						<form>
							<input type="button" onclick="executeAction('addTaskInput',$(this));" value="Add input" />
						</form>
					</li>
				</ul>
			</xsl:if>
		</div>
	</xsl:template>
	
	
	<xsl:template name="workflows">
		<xsl:param name="workflows" />
		<xsl:param name="status" />
		
		<div id="{$status}-workflows" class="workflow-list">
			<xsl:choose>
				<xsl:when test="count(exsl:node-set($workflows))=0">
					<div style="text-align: center">
						<div class="boxTitle workflowTitle titleNoResults">
							<span class="workflowPages">No <xsl:value-of select="$status" /> workflow.</span>
						</div>
					</div>
				</xsl:when>
				<xsl:otherwise>
					<div class="boxTitle workflowTitle">
						<xsl:if test="$status = 'TERMINATED'">
							<div class="statusFilter" title="Click to see workflows in error only">
								<input type="checkbox" onclick="window.location.href = 'index.php'+($(this).is(':checked') ? '?filter=errors' : '');">
									<xsl:if test="/page/get/@filter = 'errors'">
										<xsl:attribute name="checked">checked</xsl:attribute>
									</xsl:if>
								</input>
								<img src="images/exclamation.png" />
							</div>
						</xsl:if>
						<span class="workflowPages" style="line-height:20px;">
							<xsl:if test="$status = 'TERMINATED'">
								<span class="prevPage action" data-status="{$status}">&lt;</span>
							</xsl:if>
							<xsl:if test="$status = 'EXECUTING'">
								<xsl:value-of select="count(exsl:node-set($workflows))" />
							</xsl:if>
							<xsl:text> </xsl:text>
							<xsl:value-of select="$status" />
							Workflows
							<xsl:if test="$status = 'TERMINATED'">
								<xsl:value-of select="/page/workflows/@first" />-<xsl:value-of select="/page/workflows/@last" />&#160;<span style="font-size: 80%">(<xsl:value-of select="/page/workflows/@total" /> total)</span>
							</xsl:if>
							<xsl:text> </xsl:text>
							<xsl:if test="$status = 'TERMINATED'">
								<span class="nextPage action" data-status="{$status}">&gt;</span>
							</xsl:if>
						</span>
						<img src="images/refresh.png" class="refreshWorkflows action" title="Refresh workflow list" data-status="{$status}" style="margin-left: 5px;" />
						<xsl:if test="$status = 'EXECUTING'">
							<img src="images/alarm_clock.png" class="retryAllTasks action" title="Retry all tasks" style="margin-left: 5px;" onclick="retryAllTasks();" />
						</xsl:if>
						<div style="float:right;"><input type="checkbox" class="autorefresh" checked="checked" />&#160;Auto-refresh</div>
					</div>
					<table class="tb_workflows highlight_row">
						<tr>
							<th class="thState">State</th>
							<th>ID &#8211; Name</th>
							<th>Node</th>
							<th class="thStarted">Host</th>
							<th class="thStarted">Started</th>
							<xsl:if test="$status = 'TERMINATED'">
								<th class="thFinished">Finished</th>
							</xsl:if>
							<th class="thActions">Actions</th>
						</tr>
						<xsl:apply-templates select="exsl:node-set($workflows)[@status = $status]">
							<xsl:sort select="@end_time" order="descending" />
							<xsl:sort select="@start_time" order="descending" />
						</xsl:apply-templates>
					</table>			

				</xsl:otherwise>
			</xsl:choose>
		</div>
				
	</xsl:template>
	
	
	<xsl:template match="parameters">
		Parameters list:
		<ul class="inputs">
			<xsl:for-each select="parameter">
				<li class="parameter actionItem" data-name="{@name}">
					<xsl:attribute name="data-xpath">
						<xsl:apply-templates select="." mode="xpath" />
					</xsl:attribute>
					
					<xsl:value-of select="@name"/>
					<xsl:if test="$EDITION = 0">
						<xsl:text>: </xsl:text>
						<xsl:value-of select="."/>
					</xsl:if>
					<xsl:if test="$EDITION = 1">
						<div class="actions">
							<img src="images/edition/delete.png" class="deleteWorkflowParameter" title="Delete this parameter" onclick="executeAction('deleteParameter',$(this));" />
						</div>
					</xsl:if>
				</li>
			</xsl:for-each>
			<xsl:if test="$EDITION=1">
				<li class="actionItem">
					<form onsubmit="executeAction('addParameter',$(this)); return false;">
						<input name="parameter_name" placeholder="new parameter" autocomplete="off" />
						<input type="submit" value="Add parameter" />
					</form>
				</li>
			</xsl:if>
		</ul>
	</xsl:template>
	
	<xsl:template match="parameters" mode="edit">
		<table>
			<xsl:for-each select="parameter">
				<xsl:sort select="@name" data-type="text" order="ascending"/>
				<tr class="evenOdd">
					<td>
						<xsl:value-of select="@name" />
					</td>
					<td>
						<input type="text" name="{@name}" value="{. | /page/schedule/parameters/parameter[current()/@name=./@name]}" />
					</td>
				</tr>
			</xsl:for-each>
		</table>
	</xsl:template>
	
	
	<xsl:template match="input|stdin">
		<li class="taskInput actionItem" data-name="{@name}" data-type="{local-name(.)}" data-mode="{@mode}">
			<xsl:attribute name="data-xpath">
				<xsl:apply-templates select="." mode="xpath" />
			</xsl:attribute>
			
			<!-- stdin -->
			<xsl:if test="local-name(.) = 'stdin'">
				<span class="taskInputName taskInputNameSTDIN">STDIN (<xsl:value-of select="@mode" />)</span>
			</xsl:if>
			
			<!-- regular <input>s -->
			<xsl:if test="count(@name) > 0">
				<span class="taskInputName">
					<xsl:value-of select="@name" />:
				</span>
			</xsl:if>
			
			<!-- values: <value>, <copy>, text nodes -->
			<div class="taskInputValues">
				<xsl:for-each select="*|text()">
					<xsl:choose>
						<xsl:when test="local-name(.) = 'value'">
							<span class="taskInputValueXPath" data-type="xpath" data-value="{@select}" title="xpath value">
								<xsl:value-of select="@select" />
							</span>
						</xsl:when>
						<xsl:when test="local-name(.) = 'copy'">
							<span class="taskInputValueCopy" data-type="copy" data-value="{@select}" title="xpath copy">
								<xsl:value-of select="@select" />
							</span>
						</xsl:when>
						<xsl:otherwise>  <!-- text values -->
							<span class="taskInputValueText" data-type="text" data-value="{.}" title="text">
								<xsl:value-of select="." />
							</span>
						</xsl:otherwise>
					</xsl:choose>
					<xsl:if test="position() != last()">
						<br/>
					</xsl:if>
				</xsl:for-each>
			</div>
			
			<xsl:call-template name="inputActions">
				<xsl:with-param name="type" select="local-name(.)" />
			</xsl:call-template>
		</li>
	</xsl:template>
	
	
	<xsl:template name="inputActions">
		<xsl:param name="type" />
		
		<div class="actions">
			<img class="editTaskInput" src="images/edition/edit.gif" title="Edit this input" onclick="editTaskInput($(this));" />
			<xsl:if test="$type = 'input' or $type = 'stdin'">
				<img src="images/edition/delete.png" class="deleteTaskInput" title="Delete this input" onclick="executeAction('deleteTaskInput',$(this));" />
			</xsl:if>
		</div>
	</xsl:template>
	
	
	<xsl:template name="node">
		<span class="taskStats">
			Task returned code <xsl:value-of select="@retval" /> at <xsl:value-of select="@exit_time" /> (execution took <xsl:value-of select="php:function('strtotime',string(@exit_time))-php:function('strtotime',string(@execution_time))" />&#160;s). Output :
		</span>
		
		<div class="taskOutputContent">
			<xsl:if test="@retval != 0">
				<div class="error "><xsl:value-of select="." /></div>
			</xsl:if>
			<xsl:if test="@retval = 0">
				<xsl:choose>
					<xsl:when test="@method = 'text'">
						<xsl:attribute name="style">white-space:pre-wrap;</xsl:attribute>
						<xsl:value-of select="." />
					</xsl:when>
					<xsl:when test="@method = 'xml'">
						<xsl:apply-templates select="." mode="xml_display" />
					</xsl:when>
				</xsl:choose>
			</xsl:if>
		</div>
	</xsl:template>
	
	
	<xsl:template name="deleteWFI">
		<xsl:param name="wfiid" />
		
		<xsl:if test="/page/private/logged-in-user/workflow[@wfname = current()/@name]/right[@action='del'] = 1 or /page/private/logged-in-user/@profile = 'ADMIN'">
			<img src="images/delete.gif" class="deleteWFI pointer" data-wfiid="{$wfiid}" alt="Delete workflow instance" title="Delete workflow instance"></img>
		</xsl:if>
	</xsl:template>
	
	
	<xsl:template name="age">
		<xsl:param name="days" />
		
		<xsl:choose>
			<xsl:when test="count($days) = 0">
				<xsl:text>all</xsl:text>
			</xsl:when>
			<xsl:when test="$days mod 7 = 0 and $days != 0">
				<xsl:value-of select="$days div 7" />
				<xsl:choose>
					<xsl:when test="$days div 7 &lt; 2">
						<xsl:text> week old</xsl:text>
					</xsl:when>
					<xsl:otherwise>
						<xsl:text> weeks old</xsl:text>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="$days" />
				<xsl:choose>
					<xsl:when test="$days &lt; 2">
						<xsl:text> day old</xsl:text>
					</xsl:when>
					<xsl:otherwise>
						<xsl:text> days old</xsl:text>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	
	
	<xsl:template match="*" mode="xpath">
		<xsl:param name="stopOn" select="'workflow'" />
		
		<xsl:if test="local-name(.) != $stopOn">
			<xsl:apply-templates select=".." mode="xpath" />
		</xsl:if>
		
		<xsl:text>/</xsl:text>
		
		<xsl:value-of select="local-name()" />
		<xsl:text>[</xsl:text>
		<xsl:number />
		<xsl:text>]</xsl:text>
	</xsl:template>
	
	
	<xsl:template match="groups" mode="select_workflow">
		<xsl:param name="name" select="'wf_name'" />
		<xsl:param name="id" select="''" />
		<xsl:param name="selected_value" select="''" />
		<xsl:param name="value" select="'id'" />
		<xsl:param name="min_parameters" select="'0'" />
		<xsl:param name="display-bound-workflows" select="'yes'" />
		
		<select name="{$name}" id="{$id}" >
			<option></option>
			<xsl:for-each select="group">
				<xsl:if test="/page/*[local-name()='workflows' or local-name()='available-workflows']/workflow[@group=current()][count(workflow/parameters/parameter) &gt;= $min_parameters]">
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
						<xsl:for-each select="/page/*[local-name()='workflows' or local-name()='available-workflows']/workflow[@group=current()][count(workflow/parameters/parameter) &gt;= $min_parameters]">
							<xsl:if test="@bound-to-schedule=0 or $display-bound-workflows = 'yes'">
								<option value="{@id}">
									<xsl:if test="$value = 'id'">
										<xsl:if test="@id = $selected_value">
											<xsl:attribute name="selected">selected</xsl:attribute>
										</xsl:if>
										<xsl:attribute name="value"><xsl:value-of select="@id" /></xsl:attribute>
									</xsl:if>
									<xsl:if test="$value = 'name'">
										<xsl:if test="@name = $selected_value">
											<xsl:attribute name="selected">selected</xsl:attribute>
										</xsl:if>
										<xsl:attribute name="value"><xsl:value-of select="@name" /></xsl:attribute>
									</xsl:if>
									<xsl:value-of select="@name" />
								</option>
							</xsl:if>
						</xsl:for-each>
					</optgroup>
				</xsl:if>
			</xsl:for-each>
		</select>
	</xsl:template>
	
	
	<!-- LIGHT-TREE MODE -->
	<xsl:template match="workflow" mode="light-tree">
		<div class="lightTreeTasks">
			<div class="lightTreeTask" style="font-weight: bold;">
				Workflow Start
			</div>
		</div>
		<xsl:apply-templates select="subjobs" mode="light-tree" />
	</xsl:template>
	
	<xsl:template match="subjobs" mode="light-tree">
		<xsl:apply-templates select="job" mode="light-tree" />
	</xsl:template>
	
	<xsl:template match="job" mode="light-tree">
		<xsl:variable name="nbSiblings" select="count(preceding-sibling::job) + 1 + count(following-sibling::job)" />
		
		<div class="lightTreeJob" style="width: {(98 - $nbSiblings*2) * count(.//task) div count(..//task) }%;">
			<div class="lightTreeTasks">
				<xsl:if test="@condition != ''">
					<span class="lightTreeJobCondition" title="{@condition}">?</span>
				</xsl:if>
				<xsl:if test="@loop != ''">
					<span class="jobLoop lightTreeJobLoop" title="Loop on: {@loop}">⟲</span>
				</xsl:if>
				<xsl:apply-templates select="tasks/task" mode="light-tree" />
			</div>
			<xsl:apply-templates select="subjobs" mode="light-tree" />
		</div>
	</xsl:template>
	
	<xsl:template match="task" mode="light-tree">
		<div class="lightTreeTask" title="{@name}">
			<xsl:if test="@loop != ''">
				<span class="taskLoop" title="Loop on: {@loop}">⟲ </span>
			</xsl:if>
			<xsl:value-of select="@name" />
		</div>
	</xsl:template>
	<!-- END LIGHT-TREE MODE -->
	
	
</xsl:stylesheet>