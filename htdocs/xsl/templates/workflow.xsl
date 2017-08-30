<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" xmlns:php="http://php.net/xsl" version="1.0">
	<xsl:import href="datetime.xsl" />
	<xsl:import href="xmlhighlight.xsl" />


	<xsl:template match="workflow" mode="tree">
		<div id="workflow-{@id}">
			<div class="workflow" data-id="{@id}">
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
		
		<div class="job {$jobClass}" data-type="job" data-evqid="{@evqid}">
			<xsl:if test="@status = 'ABORTED'">
				<span class="faicon fa-exclamation error" title="{@details}"></span>
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
		
		<div class="task {$taskClass}" data-name="{@name}" data-type="task" data-evqid="{@evqid}">
			
			<span class="taskName">
				<xsl:apply-templates select="." mode="status" />
				<xsl:value-of select="@name" />
			</span>
			
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
	
	<xsl:template match="subjobs" mode="details">
		<xsl:for-each select="job">
			<xsl:variable name="jobid" select="@evqid" />
			<div id="workflow-{/page/instance/workflow/@id}-{$jobid}"></div>
			
			<xsl:for-each select="tasks/task">
				<xsl:variable name="taskid" select="@evqid" />
				<div id="{/page/instance/workflow/@id}-{$taskid}-general">
					<fieldset class="tabbed">
						<legend>Inputs</legend>
						<xsl:for-each select="input">
							<div>
								<div><xsl:value-of select="@name" /></div>
								<div><xsl:value-of select="." /></div>
							</div>
						</xsl:for-each>
					</fieldset>
					
					<br />
					
					<fieldset class="tabbed">
						<legend>Execution</legend>
						<div>
							<div>Status</div>
							<div><xsl:value-of select="@status" /></div>
						</div>
						<div>
							<div>Return value</div>
							<div><xsl:value-of select="@retval" /></div>
						</div>
						<div>
							<div>Started at</div>
							<div><xsl:value-of select="@execution_time" /></div>
						</div>
						<div>
							<div>Number of executions</div>
							<div><xsl:value-of select="count(output)" /></div>
						</div>
					</fieldset>
				</div>
				
				<xsl:for-each select="output">
					<div id="{/page/instance/workflow/@id}-{$taskid}-stdout-{position()}"><xsl:value-of select="." /></div>
				</xsl:for-each>
				
				<xsl:for-each select="stderr">
					<div id="{/page/instance/workflow/@id}-{$taskid}-stderr-{position()}"><xsl:value-of select="." /></div>
				</xsl:for-each>
				
				<xsl:for-each select="log">
					<div id="{/page/instance/workflow/@id}-{$taskid}-log-{position()}"><xsl:value-of select="." /></div>
				</xsl:for-each>
				
				<div id="{/page/instance/workflow/@id}-{$taskid}-executions">
					<xsl:for-each select="output">
						<div class="task_execution"><xsl:value-of select="@execution_time" /> (ret <xsl:value-of select="@retval" />)</div>
					</xsl:for-each>
				</div>
			</xsl:for-each>
			
			<xsl:apply-templates select="subjobs" mode="details" />
		</xsl:for-each>
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


	


	


	
	
	
	
	
	
	<xsl:template match="task" mode="status">
		<span class="taskState">
			<xsl:choose>
				<xsl:when test="@status='ABORTED'">
					<span class="faicon fa-exclamation-circle error" title="{@status} - {@error}"></span>
				</xsl:when>
				<xsl:when test="@status='QUEUED'">
					<span class="faicon fa-hand-stop-o" title="QUEUED"></span>
				</xsl:when>
				<xsl:when test="@status='EXECUTING'">
					<span class="fa fa-spinner fa-pulse fa-fw"></span>
				</xsl:when>
				<xsl:when test="@status='TERMINATED' and @retval != 0">
					<span class="faicon fa-exclamation error" title="Return value: {@retval}"></span>
				</xsl:when>
				<xsl:when test="@status='TERMINATED' and @retval = 0 and count(./output[@retval != '0']) > 0">
					<span class="faicon fa-check errorThenSuccess"></span>
				</xsl:when>
				<xsl:when test="@status='TERMINATED' and @retval = 0">
					<span class="faicon fa-check success"></span>
				</xsl:when>
			</xsl:choose>
			
			<!-- extra "alarm clock" icon if the task will be retried -->
			<xsl:if test="@status='TERMINATED' and @retry_at != ''">
				<span class="faicon fa-clock" title="{@retry_at}"></span>
			</xsl:if>
			
		</span>
	</xsl:template>
	
	<xsl:template match="output" mode="status">
		<xsl:choose>
			<xsl:when test="@retval = '0'"><span class="faicon fa-check success"></span></xsl:when>
			<xsl:otherwise><span class="faicon fa-exclamation error"></span></xsl:otherwise>
		</xsl:choose>
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

</xsl:stylesheet>
