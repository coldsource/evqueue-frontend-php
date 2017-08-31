<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" xmlns:php="http://php.net/xsl" version="1.0">
	<xsl:import href="datetime.xsl" />

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
			<div class="tasks">
				<xsl:if test="count(subjobs/job) > 0">
					<span class="foldSubjobs faicon fa-minus-square-o" onclick="
						$(this).parent().nextAll('.job').toggle('fast');
						$(this).toggleClass('fa-minus-square-o fa-plus-square-o');"></span>
					</xsl:if>
				<xsl:choose>
					<xsl:when test="@status = 'SKIPPED'">
						<div class="jobStatus skipped">
							<span class="faicon fa-remove" title="{@details} ({@condition})"></span> job skipped
						</div>
					</xsl:when>
					<xsl:when test="@status = 'ABORTED'">
						<div class="jobStatus error">
							<span class="faicon fa-exclamation-circle" title="{@details}"></span> job aborted
						</div>
					</xsl:when>
					<xsl:otherwise>
						<xsl:if test="@details">
							<div class="jobStatus">
								<span class="faicon fa-question-circle-o" title="{@details}"></span>
							</div>
						</xsl:if>
					</xsl:otherwise>
				</xsl:choose>
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
						<xsl:if test="@error">
							<div>
								<div>Error</div>
								<div><xsl:value-of select="@error" /></div>
							</div>
						</xsl:if>
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
						<div class="task_execution">
							<xsl:apply-templates select="." mode="status" />
							<xsl:value-of select="@execution_time" /> (ret <xsl:value-of select="@retval" />)
						</div>
					</xsl:for-each>
				</div>
			</xsl:for-each>
			
			<xsl:apply-templates select="subjobs" mode="details" />
		</xsl:for-each>
	</xsl:template>
	
	
	
	
	
</xsl:stylesheet>
