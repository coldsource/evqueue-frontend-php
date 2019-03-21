<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" xmlns:php="http://php.net/xsl" version="1.0">
	<xsl:import href="datetime.xsl" />
	<xsl:import href="xmlhighlight.xsl" />

	<xsl:template match="workflow" mode="tree">
		<div id="workflow-{@id}">
			<xsl:if test="@comment != ''">
				<div><i>Comment : <xsl:value-of select="@comment" /></i></div>
				<br />
			</xsl:if>
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
		
		<div class="task {$taskClass}" data-name="{@name}" data-type="task" data-evqid="{@evqid}" data-outputs="{count(output)}">
			
			<xsl:if test="@progression != 0 and @progression != 100">
				<xsl:attribute name="title"><xsl:value-of select="@progression" />%</xsl:attribute>
				<div class="progressbar" style="background: linear-gradient(to right, #27ae60 0%, #27ae60 {@progression}%, lightgray {@progression+1}%, lightgray 100%);"></div>
			</xsl:if>
			
			<span class="taskName">
				<xsl:apply-templates select="." mode="status" />
				<xsl:variable name="command" select="php:function('preg_replace', '_^(\S*)\s.*$_', '$1', string(@path))" />
				<xsl:variable name="parameters" select="php:function('preg_replace', '_^\S*(\s.*|$)_', '$1', string(@path))" />
				<xsl:variable name="filename" select="php:function('preg_replace', '_.*/_', '', $command)" />
				<span title="{$command}">
					<xsl:value-of select="$filename" />
				</span>
				<xsl:text> </xsl:text>
				<small>
					<xsl:value-of select="$parameters" />
				</small>
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
				<xsl:when test="@status='TERMINATED' and @retry_at != ''">
					<span class="faicon fa-clock-o" title="Will retry at : {@retry_at}"></span>
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
					<xsl:if test="count(@tid) > 0">
						<fieldset class="tabbed">
							<legend>Live</legend>
							<div>
								This task is currently running.
								<br />You can view it's live output :
								<a target="_blank" class="action" href="ajax/datastore.php?node={/page/instance/@node}&amp;tid={@tid}&amp;type=stdout">stdout</a>
								<xsl:text>&#160;-&#160;</xsl:text>
								<a target="_blank" class="action" href="ajax/datastore.php?node={/page/instance/@node}&amp;tid={@tid}&amp;type=stderr">stderr</a>
								<xsl:text>&#160;-&#160;</xsl:text>
								<a target="_blank" class="action" href="ajax/datastore.php?node={/page/instance/@node}&amp;tid={@tid}&amp;type=log">log</a>
							</div>
						</fieldset>
					</xsl:if>
					
					<br />
					
					<fieldset class="tabbed">
						<legend>Inputs</legend>
						<xsl:if test="count(input) = 0">
							<div>This task has no inputs</div>
						</xsl:if>
						<xsl:for-each select="input[count(@status)=0 or @status!='SKIPPED']">
							<div>
								<div><xsl:value-of select="@name" /></div>
								<xsl:if test="count(@error) = 0">
									<div><xsl:value-of select="." /></div>
								</xsl:if>
								<xsl:if test="count(@error) != 0">
									<div class="error"><xsl:value-of select="@error" /></div>
								</xsl:if>
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
						<xsl:if test="@details">
							<div>
								<div>Infos</div>
								<div><xsl:value-of select="@details" /></div>
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
							<div>Ended at</div>
							<div><xsl:value-of select="output[position() = last()]/@exit_time" /></div>
						</div>
						<div>
							<div>Execution time</div>
							<div><xsl:value-of select="php:function('timeDiff',string(@execution_time),string(output[position() = last()]/@exit_time))" /> second(s)</div>
						</div>
						<div>
							<div>Number of executions</div>
							<div><xsl:value-of select="count(output)" /></div>
						</div>
						<div>
							<div>Queue</div>
							<div><xsl:value-of select="@queue" /></div>
						</div>
					</fieldset>
					
					<xsl:if test="count(@host) > 0">
						<br />
						<fieldset class="tabbed">
							<legend>Remote</legend>
							<xsl:if test="count(@user) > 0">
								<div>
									<div>User</div>
									<div><xsl:value-of select="@user" /></div>
								</div>
							</xsl:if>
							<div>
								<div>Host</div>
								<div><xsl:value-of select="@host" /></div>
							</div>
						</fieldset>
					</xsl:if>
				</div>
				
				<xsl:for-each select="output">
					<div id="{/page/instance/workflow/@id}-{$taskid}-stdout-{position()}"><xsl:apply-templates mode="display_output" select="." /></div>
				</xsl:for-each>
				
				<xsl:for-each select="stderr">
					<div id="{/page/instance/workflow/@id}-{$taskid}-stderr-{position()}"><xsl:apply-templates mode="display_output" select="." /></div>
				</xsl:for-each>
				
				<xsl:for-each select="log">
					<div id="{/page/instance/workflow/@id}-{$taskid}-log-{position()}"><xsl:apply-templates mode="display_output" select="." /></div>
				</xsl:for-each>
				
				<div id="{/page/instance/workflow/@id}-{$taskid}-executions">
					<div>
						<xsl:for-each select="output">
							<div class="task_execution">
								<xsl:apply-templates select="." mode="status" />
								<xsl:value-of select="php:function('timeSpan',string(@execution_time),string(@exit_time))" /> (ret <xsl:value-of select="@retval" />)
							</div>
						</xsl:for-each>
					</div>
					<xsl:if test="count(@retry_at) = 1">
						<p>
							Next execution: <xsl:value-of select="php:function('timeSpan',string(@retry_at))" />
						</p>
					</xsl:if>
				</div>
			</xsl:for-each>
			
			<xsl:apply-templates select="subjobs" mode="details" />
		</xsl:for-each>
	</xsl:template>
	
	<xsl:template match="*" mode="display_output">
		<xsl:choose>
			<xsl:when test="count(@datastore-id) > 0">
				<div><i>The output of this task is too big and has been stored in the datastore.</i></div>
				<br />
				<div><a href="ajax/datastore.php?id={@datastore-id}&amp;download"><span class="faicon fa-download"></span>Download from datastore</a></div>
				<div><a target="_blank" href="ajax/datastore.php?id={@datastore-id}"><span class="faicon fa-eye"></span>View in browser</a></div>
			</xsl:when>
			<xsl:when test="@method = 'xml'">
				<xsl:apply-templates select="*" mode="xml_display" />
			</xsl:when>
			<xsl:otherwise>
				<pre>
					<xsl:value-of select="." />
				</pre>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	
	
	
</xsl:stylesheet>
