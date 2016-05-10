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
					<xsl:apply-templates select="/page/tasks-groups" mode="tasks-select">
						<xsl:with-param name="name" select="'task_name'" />
						<xsl:with-param name="value" select="'name'" />
					</xsl:apply-templates>
					
					<xsl:call-template name="queues-select" />
					<xsl:call-template name="schedules-select" />
					<input type="button" value="Save" onclick="executeAction('editTask',$(this));" />
					<a class="action" onclick="window.location.reload(); return false;">Cancel</a>
					<br/>
					<label class="taskLoopLabel">Task loop expression: </label>
					<input name="loop" class="taskLoop" title="loop expression" placeholder="loop expression" />
					<img class="action startXPathHelp" src="images/edition/help.png" />
					<label class="taskConditionLabel">Task condition: </label>
					<input name="condition" class="taskCondition" title="condition" placeholder="condition" />
					<img class="action startXPathHelp" src="images/edition/help.png" />
				</form>
			</div>
			<div style="display: none;">
				<form id="editJob" onsubmit="executeAction('editJob',$(this)); return false;">
					<input name="name" placeholder="job name" />
					<input name="condition" title="execution condition" placeholder="execution condition" />
					<img class="action startXPathHelp" src="images/edition/help.png" />
					<input name="loop" title="loop expression" placeholder="loop expression" />
					<img class="action startXPathHelp" src="images/edition/help.png" />
					<input type="submit" value="Save" />
					<a class="action" onclick="window.location.reload(); return false;">Cancel</a>
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
						<input name="value[]" />
						<img class="action startXPathHelp" src="images/edition/help.png" />
						<img onclick="deleteTaskInputValue($(this));" title="Delete this value" src="images/edition/delete.png" />
						<br/>
					</div>
				</div>
				
				<form id="editTaskInput" onsubmit="executeAction('editTaskInput',$(this)); return false;">
					<input type="hidden" name="type" />
					<input name="name" placeholder="input name" />
					<select name="mode">
						<option value="xml" title="Texts, values and copies here on the right will be concatenated and serialised as XML, including the stdin node.">xml</option>
						<option value="text" title="Texts, values and copies here on the right will be concatenated as a simple text value. Any encountered XML node will be stripped.">text</option>
					</select>
					
					<div class="taskInputValues">
						<!-- value/copy/text lines will be appended here by the javascript -->
						<img class="addTaskInputValue" src="images/edition/addTask.png" onclick="addTaskInputValue($(this));" />
					</div>
					<input type="submit" value="Save" />
					<a class="action" onclick="window.location.reload(); return false;">Cancel</a>
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
				<a class="action" onclick="cancelEdition(); return false;"><button type="button" class="blue">Cancel changes</button></a>
				<form onsubmit="return false;" style="display: inline;">
					<xsl:choose>
						<xsl:when test="/page/workflow/@id">  <!-- edition -->
							<input type="button" value="Overwrite workflow {/page/workflow/@id}" onclick="executeAction('saveWorkflow',$('.reference'));" />
						</xsl:when>
						<xsl:otherwise>  <!-- creation [TODO] -->
							<input type="button" value="Create and save workflow" onclick="executeAction('saveWorkflow',$('.reference'));" />
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
