<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:php="http://php.net/xsl">
	<xsl:import href="templates/main-template.xsl" />
	<xsl:import href="templates/dropdown_utils.xsl" />
	<xsl:import href="templates/task.xsl" />
	
	<xsl:variable name="topmenu" select="'settings'" />
	
	<xsl:param name="ISFORM">1</xsl:param>
	<xsl:param name="FORMTITLE">
		<xsl:if test="$creation = 1">Create a new task</xsl:if>
		<xsl:if test="$creation != 1">Edit task</xsl:if>
	</xsl:param>
	
	<xsl:variable name="javascript">
		<src>js/manage-task.js</src>
	</xsl:variable>
	
	<xsl:template name="content">
		
		
		<script type="text/javascript">
			availableTags = [
				<xsl:for-each select="/page/tasks-groups/group">
					<xsl:if test=". != ''">
						<!--<xsl:value-of select="." />-->
						<xsl:text> '</xsl:text><xsl:value-of select="php:function('addslashes', string(.))" /><xsl:text>'</xsl:text>,
						<!--<xsl:text disable-output-escaping="yes">"</xsl:text><xsl:call-template name="escapeQuote"/><xsl:text disable-output-escaping="yes">",</xsl:text>-->
					</xsl:if>
				</xsl:for-each>
			];
			availableTagsWF = [
				<xsl:for-each select="/page/groups/group">
					<xsl:if test=". != ''">
						<!--<xsl:value-of select="." />-->
						<xsl:text> '</xsl:text><xsl:value-of select="php:function('addslashes', string(.))" /><xsl:text>'</xsl:text>,
						<!--<xsl:text disable-output-escaping="yes">"</xsl:text><xsl:call-template name="escapeQuote"/><xsl:text disable-output-escaping="yes">",</xsl:text>-->
					</xsl:if>
				</xsl:for-each>
			];
		</script>
		
	
		<xsl:call-template name="displayErrors" />
		<xsl:if test="/page/@create_workflow = 'yes'">
			<p><i>You are in simple workflow mode. A simple workflow only contains one task and is named after its task name.</i></p>
		</xsl:if>

		<form name="formTask" id="formTask" method="post">
			<xsl:call-template name="taskFormInputs" />
			<xsl:if test="count(/page/get/@task_id) = 0">
				<div>
					<label class="formLabel" for="create_workflow">Create workflow</label>
					<input type="checkbox" name="create_workflow" id="create_workflow" value="yes">
						<xsl:if test="/page/post/@create_workflow = 'yes' or /page/get/@create_workflow = 'yes' or (/page/task/task/@create_workflow = 1 and count(/page/post/@create_workflow) = 0)">
							<xsl:attribute name="checked">checked</xsl:attribute>
						</xsl:if>
					</input>
				</div>
			</xsl:if>
			
			<input type="submit" name="submitFormTask" id="submitFormTask" class="submitFormButton submitFormButtonSmall">
				<xsl:attribute name="value">
					<xsl:choose>
						<xsl:when test="/page/get/@task_id">
							<xsl:text>Update Task</xsl:text>
						</xsl:when>
						<xsl:otherwise>
							<xsl:text>Create Task</xsl:text>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:attribute>
			</input>
		</form>
		<xsl:if test="/page/linked-workflows/workflow">
			<div class="linked-workflow">
				<h4>Linked workflows</h4>
				<ul>
					<xsl:for-each select="/page/linked-workflows/workflow" >
						<li>
							<xsl:value-of select="." />
						</li>
					</xsl:for-each>
				</ul>
			</div>
		</xsl:if>
    </xsl:template>
</xsl:stylesheet>
