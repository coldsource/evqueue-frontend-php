<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	<xsl:import href="templates/edit_workflow.xsl" />
	<xsl:import href="templates/list_queues.xsl" />
	<xsl:import href="templates/list_schedules.xsl" />
	<xsl:import href="templates/list_tasks.xsl" />
	<xsl:import href="templates/workflow.xsl" />
	
	<xsl:variable name="topmenu" select="'settings'" />
	
	<xsl:variable name="javascript">
		<src>js/manage-workflow.js</src>
	</xsl:variable>

	<xsl:template name="content">
		
		<div id="popinMsg">Message</div>
		
		<div class="contentManage">
			<div style="display: none;">
				<form id="editTask">
					<table class="unstyled">
						<tbody>
							<tr>
								<td>Task name</td>
								<td>
									<xsl:apply-templates select="/page/tasks-groups" mode="tasks-select">
										<xsl:with-param name="name" select="'task_name'" />
										<xsl:with-param name="value" select="'name'" />
									</xsl:apply-templates>
								</td>
							</tr>
							<tr>
								<td>Queue</td>
								<td>
									<xsl:call-template name="queues-select" />
								</td>
							</tr>
							<tr>
								<td>Retry schedule</td>
								<td>
									<xsl:call-template name="schedules-select" />
								</td>
							</tr>
							<tr>
								<td>Task loop expression</td>
								<td class="xPathAble">
									<input name="loop" class="taskLoop w100" title="loop expression" placeholder="loop expression" />
									<img class="action startXPathHelp embedded" src="images/edition/help.png" />
								</td>
							</tr>
							<tr>
								<td>Task condition</td>
								<td class="xPathAble">
									<input name="condition" class="taskCondition w100" title="condition" placeholder="condition" />
									<img class="action startXPathHelp embedded" src="images/edition/help.png" />
								</td>
							</tr>
							<tr colspan="2">
								<td>
									<input type="button" class="spaced-v" value="Save" onclick="executeAction('editTask',$(this));" />
									<a class="action spaced" onclick="window.location.reload(); return false;">Cancel</a>
								</td>
							</tr>
						</tbody>
					</table>
				</form>
			</div>
			<div style="display: none;">
				<form id="editJob" onsubmit="executeAction('editJob',$(this)); return false;">
					<table class="unstyled">
						<tbody>
							<tr>
								<td>Job name</td>
								<td>
									<input name="name" placeholder="job name" />
								</td>
							</tr>
							<tr>
								<td>Job condition</td>
								<td class="xPathAble">
									<input name="condition" class="w100" title="execution condition" placeholder="execution condition" />
									<img class="action startXPathHelp embedded" src="images/edition/help.png" />
								</td>
							</tr>
							<tr>
								<td>Job loop</td>
								<td class="xPathAble">
									<input name="loop" class="w100" title="loop expression" placeholder="loop expression" />
									<img class="action startXPathHelp embedded" src="images/edition/help.png" />
								</td>
							</tr>
							<tr>
								<td colspan="2">
									<input type="submit" class="spaced-v" value="Save" />
									<a class="action spaced" onclick="window.location.reload(); return false;">Cancel</a>
								</td>
							</tr>
						</tbody>
					</table>
				</form>
			</div>
			<div style="display: none;">
				<div id="taskInputValueSample" style="display: none;">
					<div class="taskInputValue">
						<select name="value_type[]">
							<option value="text">text</option>
							<option value="xpath">xpath value</option>
							<option value="copy">xpath copy</option>
						</select>
						<input name="value[]" class="large" />
						<img class="action startXPathHelp" src="images/edition/help.png" />
						<img onclick="deleteTaskInputValue($(this));" title="Delete this value" src="images/edition/delete.png" />
						<br/>
					</div>
				</div>
				
				<form id="editTaskInput" onsubmit="executeAction('editTaskInput',$(this)); return false;">
					<input type="hidden" name="type" />
					
					<table class="unstyled">
						<tbody>
							<tr>
								<td>
									Input name
								</td>
								<td>
									<input name="name" placeholder="input name" />
									<span class="hint spaced-h">(only useful when passing ENV parameters, but does not hurt the command line)</span>
								</td>
							</tr>
							<tr class="stdinMode">
								<td>
									Stdin mode
								</td>
								<td>
									<select name="mode" onchange="$(this).next('span').text( $(this).children('option:selected').attr('title') );">
										<option value="xml" title="Texts, values and copies here after will be concatenated and serialised as XML, including the stdin node.">xml</option>
										<option value="text" title="Texts, values and copies here after will be concatenated as a simple text value. XML nodes will be stripped.">text</option>
									</select>
									<span class="hint spaced-h"></span>
								</td>
							</tr>
							<tr class="vat">
								<td>
									Input value
								</td>
								<td>
									<div class="taskInputValues">
										<!-- value/copy/text lines will be appended here by the javascript -->
									</div>
									<div class="spaced-v">
										<img class="addTaskInputValue" src="images/edition/addTask.png" onclick="addTaskInputValue($(this));" />
									</div>
								</td>
							</tr>
							<tr>
								<td colspan="2">
									<input class="spaced-v" type="submit" value="Save" />
									<a class="action spaced" onclick="window.location.reload(); return false;">Cancel</a>
								</td>
							</tr>
						</tbody>
					</table>
				</form>
			</div>
			<div class="boxTitle" style="width: 100%;">		
				<span class="title">
					<xsl:choose>
						<xsl:when test="/page/workflow/@id">
							Updating Workflow <xsl:value-of select="/page/workflow/@id" />: <xsl:value-of select="/page/workflow/@name" />
						</xsl:when>
						<xsl:otherwise>
							Create Workflow
						</xsl:otherwise>
					</xsl:choose>
				</span>
			</div>
				
			<div id="Workflow" class="formdiv">
				<xsl:call-template name="displayErrors" />
				
				<div class="actionItem">
					<form onsubmit="return false;" style="display: inline;">
						<xsl:call-template name="form_workflow_header"/>
						<input type="hidden" name="reference" class="reference" />
					</form>
				</div>	
						
				<xsl:apply-templates select="/page/session/workflow/workflow" mode="tree">
					<xsl:with-param name="edition" select="1" />
				</xsl:apply-templates>
		    </div>
				
		    <div class="actionItem" style="float: right; padding: 10px;">
					<a class="action" onclick="cancelEdition(); return false;">
						<button type="button" class="blue spaced-h">Cancel changes</button>
					</a>
					<form onsubmit="return false;" style="display: inline;">
						<xsl:choose>
							<xsl:when test="/page/workflow/@id">  <!-- edition -->
								<input id="saveWorkflow" type="button" value="Overwrite workflow {/page/workflow/@id}" onclick="executeAction('saveWorkflow',$('.reference'));" autocomplete="off" />
							</xsl:when>
							<xsl:otherwise>  <!-- creation [TODO] -->
								<input id="saveWorkflow" type="button" value="Create and save workflow" onclick="executeAction('saveWorkflow',$('.reference'));" autocomplete="off" />
							</xsl:otherwise>
						</xsl:choose>
					</form>
		    </div>
				
		    <p id="statusBar"></p>
				
				<div style="height: 3em;" />
				<h2 style="text-align: center; text-decoration: underline;">Tree Visualisation</h2>
				<xsl:apply-templates select="/page/session/workflow/workflow" mode="light-tree" />
				
		    <div style="height: 20em;" />
			</div>
    </xsl:template>
	
</xsl:stylesheet>
