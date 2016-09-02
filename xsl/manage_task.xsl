<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:php="http://php.net/xsl">
	<xsl:import href="templates/main-template.xsl" />
	<xsl:import href="templates/dropdown_utils.xsl" />
	
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

				<form name="formTask" id="formTask" action="manage-task.php" method="post">
					<input type="hidden" name="id" value="{/page/get/@task_id}" />
					<label class="formLabel" for="name" >Task name</label>
					<input type="text" name="name" id="name" value="{/page/post/@name | /page/task/task/@name}" />
					<br />
					<label class="formLabel" for="binary">Task binary</label>
					<input type="text" name="binary" id="binary" value="{/page/post/@binary | /page/task/task/@binary}" placeholder="Absolute path to your script on the host machine" class="filenameInput" />
					<br />
					<label class="formLabel" for="group">Task group</label>
					<input type="text" name="group" id="group" value="{/page/post/@group | /page/task/task/@group}" />
					<br />
					<label class="formLabel" for="wd">Task working directory</label>
					<input type="text" name="wd" id="wd" value="{/page/post/@wd | /page/task/task/@wd}" />
					<br />
					<label class="formLabel" for="parameters_mode">Parameters mode</label>
					<select name="parameters_mode" id="parameters_mode">
						<xsl:call-template name="getSelectedItem">
						<xsl:with-param name="default" select="/page/get/@parameters_mode | /page/post/@parameters_mode | /page/task/task/@parameters_mode" />
						<xsl:with-param name="condition" select="document('data/task_parameters_mode.xml')/task_parameters_modes/task_parameters_mode" />
						</xsl:call-template>
					</select>				
					<br />
					<label class="formLabel" for="output_method">Output type</label>
					<select name="output_method" id="output_method">
						<xsl:call-template name="getSelectedItem">
						<xsl:with-param name="default" select="/page/post/@output_method | /page/task/task/@output_method" />
						<xsl:with-param name="condition" select="document('data/task_output_method.xml')/task_output_methods/task_output_method" />
						</xsl:call-template>
					</select>				
					<br />
					
					<label class="formLabel" for="user">Task user</label>
					<input type="text" name="user" id="user" value="{/page/post/@user | /page/task/task/@user}" />
					<br />

					<label class="formLabel" for="host">Task host</label>
					<input type="text" name="host" id="host" value="{/page/post/@host | /page/task/task/@host}" />
					<br />
					
					<label class="formLabel" for="use_agent">Use evqueue agent</label>
					<input type="checkbox" name="use_agent" id="use_agent" value="yes">
						<xsl:if test="/page/post/@use_agent = 'yes' or (/page/task/task/@use_agent = 1 and count(/page/post/@use_agent) = 0)">
							<xsl:attribute name="checked">checked</xsl:attribute>
						</xsl:if>
					</input>
					<br />
					
					<label class="formLabel" for="merge_stderr">Merge stderr with stdout</label>
					<input type="checkbox" name="merge_stderr" id="merge_stderr" value="yes">
						<xsl:if test="/page/post/@merge_stderr = 'yes' or (/page/task/task/@merge_stderr = 1 and count(/page/post/@merge_stderr) = 0)">
							<xsl:attribute name="checked">checked</xsl:attribute>
						</xsl:if>
					</input>
					<br />
					
					<label class="formLabel" for="create_workflow">Create workflow</label>
					<input type="checkbox" name="create_workflow" id="create_workflow" value="yes">
						<xsl:if test="/page/post/@create_workflow = 'yes' or /page/get/@create_workflow = 'yes' or (/page/task/task/@create_workflow = 1 and count(/page/post/@create_workflow) = 0)">
							<xsl:attribute name="checked">checked</xsl:attribute>
						</xsl:if>
					</input>
					<br />
					
					<input type="submit" name="submitFormTask" id="submitFormTask" class="submitFormButton submitFormButtonSmall">
						<xsl:attribute name="value">
							<xsl:choose>
								<xsl:when test="/page/task/@id">
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
