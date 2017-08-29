<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" xmlns:php="http://php.net/xsl" version="1.0">
	<xsl:import href="datetime.xsl" />
	<xsl:import href="xmlhighlight.xsl" />


	<xsl:template match="workflow">
		<tr>
			<td class="workflowStatus">
				<xsl:variable name="current-node">
					<xsl:copy-of select="." />
				</xsl:variable>
				<xsl:choose>
					<xsl:when test="@running_tasks - @queued_tasks > 0">
						<img src="images/ajax-loader.gif" alt="Running" title="Task(s) running" />
					</xsl:when>
					<xsl:when test="@queued_tasks > 0">
						<img src="images/waitpoint.gif" alt="Queued" title="Task(s) queued" />
					</xsl:when>
					<xsl:when test="@retrying_tasks > 0">
						<img src="images/alarm_clock.png" alt="Retrying" title="A task ended badly and will retry" />
					</xsl:when>
					<xsl:when test="@errors > 0">
						<span class="faicon fa-exclamation" title="Errors"></span>
					</xsl:when>
					<xsl:when test="count(@end_time) > 0">
						<img src="images/ok.png" alt="Terminated" title="Workflow terminated" />
					</xsl:when>
					<xsl:otherwise>
						<b>?</b>
					</xsl:otherwise>
				</xsl:choose>
			</td>

			<td>
				<span class="action showWorkflowDetails" data-id="{@id}" data-node-name="{@node_name | ../@node}">
					<span class="faicon fa-plus-square-o"></span>
					<xsl:text> </xsl:text>
					<xsl:value-of select="@id" />
					–
					<xsl:value-of select="@name" />
				</span>
				<xsl:text>&#160;</xsl:text>
				<xsl:variable name="seconds">
					<xsl:apply-templates select="." mode="total-time" />
				</xsl:variable>

				(<xsl:value-of select="php:function('humanTime',$seconds)" />)
			</td>
			<td class="tdHost">
				<xsl:value-of select="@node_name | ../@node" />
			</td>
			<td class="tdHost">
				<xsl:choose>
					<xsl:when test="@host != ''"><xsl:value-of select="@host" /></xsl:when>
					<xsl:otherwise>localhost</xsl:otherwise>
				</xsl:choose>
			</td>
			<td class="tdStarted">
				<xsl:value-of select="php:function('timeSpan',string(@start_time),string(@end_time))" />
			</td>
			
			<td class="tdActions">
				<xsl:if test="@status='EXECUTING'">
					<img src="images/stop.png" alt="Stop execution of this workflow" title="Stop execution of this workflow" onclick="
						evqueueAPI({{
							confirm: 'Are you sure you want to stop the execution of this workflow?',
							group: 'instance',
							action: 'cancel',
							attributes: {{ 'id':{@id} }},
							node: '{../@node}'
						}});"/>
				</xsl:if>

				<xsl:if test="@status='TERMINATED'">
					<img src="images/delete.gif" class="action" onclick="
						evqueueAPI({{
							confirm: 'Delete workflow instance {@id}?',
							group: 'instance',
							action: 'delete',
							attributes: {{ 'id':'{@id}' }}
						}}).done( function () {{
							location.reload();
						}});" />
				</xsl:if>
			</td>
		</tr>
		<tr id="tr{@id}" class="hidden">
			<td colspan="7" class="details">
				<img src="images/ajax-loader.gif" />
			</td>
		</tr>
	</xsl:template>


	<xsl:template match="instance|workflow" mode="total-time">
		<xsl:choose>
			<xsl:when test="count(@end_time) > 0">
				<xsl:value-of select="php:function('timeDiff',string(@start_time),string(@end_time))" />
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="php:function('timeDiff',string(@start_time))" />
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>


	<xsl:template match="workflow" mode="launch">
		<xsl:apply-templates select="." mode="launchbox">
			<xsl:with-param name="prefix" select="''" />
			<xsl:with-param name="identifier" select="@name" />
		</xsl:apply-templates>
	</xsl:template>

	<xsl:template match="workflow" mode="launchbox">
		<xsl:param name="prefix" select="'re'" />
		<xsl:param name="identifier" select="@id" />

		<div id="{$prefix}launch_{$identifier}" class="hidden">
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

					<input type="hidden" name="id" value="{@name}" />

					<div id="paramsTab_{$identifier}" class="paramsTab">
						<xsl:if test="count(parameters/parameter) = 0">
							No parameters for this workflow
						</xsl:if>
					</div>

					<div id="nodeTab_{$identifier}" class="nodeTab">
						<select name="node">
							<xsl:for-each select="/page/evqueue-nodes/node">
								<option value="{@name}">
									<xsl:if test="@name = /page/get/@node_name or @name = /page/get/@node">
										<xsl:attribute name="selected">selected</xsl:attribute>
									</xsl:if>
									<xsl:value-of select="@name" />
								</option>
							</xsl:for-each>
						</select>
					</div>

					<div id="hostTab_{$identifier}" class="hostTab">
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
		<div>
			<xsl:apply-templates select="." mode="launchbox" />

			<div class="workflow" id="workflow{@id}" data-id="{@id}" data-node-name="{@node_name | ../@node}">
				
				<!-- Display workflow parameters -->
				<span class="faicon spaced fa-list" src="images/listli.png" title="Workflow Parameters" onclick="$(this).nextAll('div.workflowParameters').toggleClass('hidden');"></span>
				
				<!-- Relaunch workflow -->
				<span class="relaunch faicon spaced fa-rocket" data-wfiid="{@id}" data-node-name="{../@node_name}" alt="Re-launch workflow instance" title="Re-launch workflow instance" ></span>
				
				<!-- Display formatted XML -->
				<span class="faicon spaced fa-code" src="images/bigger.png" title="View workflow XML" onclick="$('#xmlcontent{@id}').dialog({{width:800}});"></span>
				<div id="xmlcontent{@id}" style="display:none;">
					<xsl:apply-templates select="." mode="xml_display" />
				</div>
				
				<xsl:variable name="totalTime">
					<xsl:apply-templates select="." mode="total-time" />
				</xsl:variable>
				
				<xsl:variable name="execTime" select="php:function('sumExecTimes', .//task/output)" />
				<xsl:variable name="retryTime" select="php:function('sumRetryTimes', .//task/output)" />
				<xsl:variable name="queueTime" select="$totalTime - $execTime - $retryTime" />
				
				<span class="exectime" style="margin-left: 5px; background-color: rgba(0,255,0,0.1); padding: 2px 5px; /* TODO: move to stylesheet */">
					<xsl:text>real time </xsl:text>
					<xsl:value-of select="php:function('humanTime',$execTime)" />
				</span>
				<span class="queuetime" style="margin-left: 5px; background-color: rgba(0,0,255,0.1); padding: 2px 5px; /* TODO: move to stylesheet */">
					<xsl:text>queued for </xsl:text>
					<xsl:value-of select="php:function('humanTime',$queueTime)" />
				</span>
				<span class="retrytime" style="margin-left: 5px; background-color: rgba(255,0,0,0.1); padding: 2px 5px; /* TODO: move to stylesheet */">
					<xsl:text>waited </xsl:text>
					<xsl:value-of select="php:function('humanTime',$retryTime)" />
					<xsl:text> for retrials</xsl:text>
				</span>

				<div class="workflowParameters hidden">
					<xsl:if test="count(parameters/parameter) = 0">
						<i>no parameters</i>
					</xsl:if>
					<xsl:apply-templates select="parameters" />
				</div>

				<div id="jobs_{@id}">
					<xsl:apply-templates select="subjobs/job">
						<xsl:with-param name="first" select="1" />
					</xsl:apply-templates>
				</div>
				
			</div>
		</div>
	</xsl:template>


	<xsl:template match="job">

		<xsl:variable name="jobClass">
			<xsl:if test="@status = 'SKIPPED' or ancestor::job[@status = 'SKIPPED']">skipped</xsl:if>
		</xsl:variable>
		
		<div class="job {$jobClass}" data-type="job" data-name="{@name}" data-loop="{@loop}" data-condition="{@condition}">
			<xsl:if test="@status = 'ABORTED'">
				<span class="faicon fa-exclamation" title="{@details}"></span>
				<xsl:text>&#160;</xsl:text>
				<xsl:value-of select="@details" />
			</xsl:if>
			
			<div class="tasks">
				<xsl:if test="count(subjobs/job) > 0">
					<span class="foldSubjobs faicon fa-minus-square-o" onclick="
						$(this).parent().nextAll('.job').toggle('fast');
						$(this).toggleClass('fa-minus-square-o fa-plus-square-o');"></span>
				</xsl:if>
				<xsl:apply-templates select="tasks/task" />
			</div>
			
			<xsl:apply-templates select="subjobs/job" />
		</div>
	</xsl:template>


	<xsl:template match="task">
		
		<xsl:variable name="taskClass">
			<xsl:if test="@status = 'SKIPPED' or ancestor::job[@status = 'SKIPPED']">skipped</xsl:if>
		</xsl:variable>
		
		<div class="task {$taskClass}" data-name="{@name}" data-type="task" data-queue="{@queue}" data-retry-schedule="{@retry_schedule}" data-loop="{@loop}" data-condition="{@condition}">
			
			<span class="taskName">
				<xsl:apply-templates select="." mode="status" />
				<xsl:value-of select="@name" />
			</span>
			<xsl:apply-templates select="." mode="details" />
			
			<xsl:if test="@status='EXECUTING'">
				<span class="faicon fa-bomb" title="Kill Task" onclick="
					evqueueAPI({{
						confirm: 'Are you sure you want to kill this task?',
						group: 'instance',
						action: 'killtask',
						attributes: {{ 'id':{ancestor::workflow[1]/@id}, 'pid':{@pid} }},
						node: '{/page/instance/@node}'
					}});"></span>
			</xsl:if>
			
			<xsl:if test="@progression != 0 and @progression != 100">
				<div class="progressbar-wrapper">
					<div class="progressbar" style="width: {@progression}%;"></div>
					<span><xsl:value-of select="@progression" />%</span>
				</div>
			</xsl:if>
		</div>
	</xsl:template>
	
	
	<xsl:template match="task" mode="details">
		<div class="taskDetails dialog">
			<h2>
				<xsl:apply-templates select="." mode="status" />
				<xsl:value-of select="@name" />
			</h2>
			
			<div class="tabs">
				<ul>
					<li><a href="#tab-taskGeneral">General</a></li>
					<li><a href="#tab-taskStdout">Stdout</a></li>
					<li><a href="#tab-taskStderr">Stderr</a></li>
					<li><a href="#tab-taskLog">Log</a></li>
					<xsl:if test="count(output) > 1">
						<li><a href="#tab-taskPrevExecs">Previous Executions</a></li>
					</xsl:if>
				</ul>
				<div id="tab-taskGeneral">
					<xsl:if test="count(input) = 0">
						<i>no input</i>
					</xsl:if>
					<ul class="inputs unstyled">
						<xsl:for-each select="input">
							<li>
								<xsl:if test="@name">
									<b><xsl:value-of select="@name" /></b>:
								</xsl:if>
								<xsl:value-of select="." />
							</li>
						</xsl:for-each>
					</ul>
					<ul class="error unstyled">
						<xsl:if test="@status = 'ABORTED'">
							<li>ABORTED</li>
						</xsl:if>
						<xsl:if test="@error">
							<li>error from engine: <xsl:value-of select="@error" /></li>
						</xsl:if>
						<xsl:if test="@retval != '0'">
							<li>return value <xsl:value-of select="@retval" /></li>
						</xsl:if>
					</ul>
				</div>
				<div id="tab-taskStdout">
					<ul class="unstyled">
						<xsl:for-each select="output">
							<li class="output">
								<xsl:choose>
									<xsl:when test="@method = 'text'">
										<xsl:attribute name="style">white-space:pre-wrap;</xsl:attribute>
										<xsl:value-of select="." />
									</xsl:when>
									<xsl:when test="@method = 'xml'">
										<xsl:apply-templates select="." mode="xml_display" />
									</xsl:when>
								</xsl:choose>
							</li>
						</xsl:for-each>
					</ul>
				</div>
				<div id="tab-taskStderr">
					<ul class="unstyled">
						<xsl:for-each select="stderr">
							<li class="stderr"><xsl:value-of select="." /></li>
						</xsl:for-each>
					</ul>
				</div>
				<div id="tab-taskLog">
					<ul class="unstyled">
						<xsl:for-each select="log">
							<li class="log"><xsl:value-of select="." /></li>
						</xsl:for-each>
					</ul>
				</div>
				<xsl:if test="count(output) > 1">
					<div id="tab-taskPrevExecs">
						<ul class="js-execs unstyled">
							<xsl:for-each select="output">
								<li class="action">
									<xsl:if test="position() = last()"><xsl:attribute name="style">font-weight: bold;</xsl:attribute></xsl:if>
									<xsl:choose>
										<xsl:when test="@retval = '0'"><span class="faicon fa-check"></span></xsl:when>
										<xsl:otherwise><span class="faicon fa-exclamation"></span></xsl:otherwise>
									</xsl:choose>
									<xsl:value-of select="@exit_time" />:
									return code <xsl:value-of select="@retval" />
								</li>
							</xsl:for-each>
						</ul>
					</div>
				</xsl:if>
			</div>
		</div>
	</xsl:template>
	
	
	<xsl:template match="task" mode="status">
		<span class="taskState">
			<xsl:choose>
				<xsl:when test="@status='ABORTED'">
					<span class="faicon fa-exclamation-circle" title="{@status} - {@error}"></span>
				</xsl:when>
				<xsl:when test="@status='QUEUED'">
					<span class="faicon fa-hand-stop-o" title="QUEUED"></span>
				</xsl:when>
				<xsl:when test="@status='EXECUTING'">
					<span class="fa fa-spinner fa-pulse fa-fw"></span>
				</xsl:when>
				<xsl:when test="@status='TERMINATED' and @retval != 0">
					<span class="faicon fa-exclamation" title="Return value: {@retval}"></span>
				</xsl:when>
				<xsl:when test="@status='TERMINATED' and @retval = 0 and count(./output[@retval != '0']) > 0">
					<span class="faicon fa-check errorThenSuccess"></span>
				</xsl:when>
				<xsl:when test="@status='TERMINATED' and @retval = 0">
					<span class="faicon fa-check"></span>
				</xsl:when>
			</xsl:choose>
			
			<!-- extra "alarm clock" icon if the task will be retried -->
			<xsl:if test="@status='TERMINATED' and @retry_at != ''">
				<span class="faicon fa-clock" title="{@retry_at}"></span>
			</xsl:if>
			
		</span>
	</xsl:template>


	<xsl:template name="instances">
		<xsl:param name="instances" />
		<xsl:param name="status" />

		<div id="{$status}-workflows" class="workflow-list">

			<xsl:for-each select="error[@id='evqueue-not-running']">
				<div id="evqueue-not-running">
					Evqueue is not running on node '<xsl:value-of select="@node" />'!!!<br/>
					<!--If you expect workflows to be launched, you should start the evqueue process urgently!-->
				</div>
			</xsl:for-each>

			<xsl:choose>
				<xsl:when test="count(exsl:node-set($instances))=0">
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
								<xsl:value-of select="count(/page/instances/workflow)" />
							</xsl:if>
							<xsl:text> </xsl:text>
							<xsl:value-of select="$status" />
							Workflows
							<xsl:if test="$status = 'EXECUTING' and count(exsl:node-set($instances)) != count(/page/instances/workflow)">
								(<xsl:value-of select="count(exsl:node-set($instances))" /> displayed)
							</xsl:if>
							<xsl:if test="$status = 'TERMINATED'">
								<xsl:value-of select="($PAGE*$LIMIT)+1-$LIMIT" />-<xsl:value-of select="($PAGE*$LIMIT)" />&#160;<span style="font-size: 80%">(<xsl:value-of select="/page/instances/@rows" /> total)</span>
							</xsl:if>
							<xsl:text> </xsl:text>
							<xsl:if test="$status = 'TERMINATED'">
								<span class="nextPage action" data-status="{$status}">&gt;</span>
							</xsl:if>
						</span>
						<img src="images/refresh.png" class="refreshWorkflows action" title="Refresh workflow list" data-status="{$status}" style="margin-left: 5px;" />
						<xsl:if test="$status = 'EXECUTING'">
							<img src="images/alarm_clock.png" onclick="retryAllTasks();" class="pointer" data-confirm='Do you really want to retry all tasks? This can lead to tasks stopping in error sooner than expected, since their retry "counter" gets decremented.' title="Retry all tasks" style="margin-left: 5px;"/>
						</xsl:if>
						<div style="float:right;"><input type="checkbox" class="autorefresh" checked="checked" />&#160;Auto-refresh</div>
					</div>
					<table class="tb_workflows highlight_row">
						<tr>
							<th class="thState">State</th>
							<th>ID &#8211; Name</th>
							<th>Node</th>
							<th class="thStarted">Host</th>
							<th class="thStarted">Time</th>
							<th class="thActions">Actions</th>
						</tr>
						<xsl:apply-templates select="exsl:node-set($instances)[@status = $status]">
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
		<ul class="unstyled">
			<xsl:for-each select="parameter">
				<li>
					<xsl:value-of select="@name" />: <xsl:value-of select="." />
				</li>
			</xsl:for-each>
		</ul>
	</xsl:template>


	<xsl:template match="input|stdin">
		<li class="taskInput" data-name="{@name}" data-type="{local-name(.)}" data-mode="{@mode}">

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
		</li>
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

</xsl:stylesheet>
