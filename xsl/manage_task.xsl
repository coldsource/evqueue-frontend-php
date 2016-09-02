<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:php="http://php.net/xsl">
	<xsl:import href="templates/main-template.xsl" />
	<xsl:import href="templates/dropdown_utils.xsl" />
	
	<xsl:variable name="topmenu" select="'settings'" />
	
	<xsl:variable name="javascript">
	</xsl:variable>
	
	<xsl:param name="ISFORM">1</xsl:param>
	<xsl:param name="FORMTITLE">
		<xsl:if test="$creation = 1">Create a new task</xsl:if>
		<xsl:if test="$creation != 1">Edit task</xsl:if>
	</xsl:param>
	
	
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
		</script>
		
	
				<xsl:call-template name="displayErrors" />

				<form name="formTask" id="formTask" action="manage-task.php" method="post">
					<input type="hidden" name="id" value="{/page/get/@task_id}" />
					<label class="formLabel" for="task_name" >Task name</label>
					<input type="text" name="name" id="task_name" value="{/page/task/task/@name}" />
					<br />
					<label class="formLabel" for="task_binary_path">Task binary</label>
					<input type="text" name="binary_path" id="task_binary_path" value="{/page/task/task/@binary}" placeholder="Absolute path to your script on the host machine" class="filenameInput" />
					<br />
					<label class="formLabel" for="task_group">Task group</label>
					<input type="text" name="group" id="task_group" value="{/page/task/task/@group}" />
					<br />
					<label class="formLabel" for="task_wd">Task working directory</label>
					<input type="text" name="wd" id="task_wd" value="{/page/task/task/@wd}" />
					<br />
					<label class="formLabel" for="task_parameters_mode">Parameters mode</label>
					<select name="parameters_mode" id="task_parameters_mode">
						<xsl:call-template name="getSelectedItem">
						<xsl:with-param name="default" select="/page/task/task/@parameters_mode" />
						<xsl:with-param name="condition" select="document('data/task_parameters_mode.xml')/task_parameters_modes/task_parameters_mode" />
						</xsl:call-template>
					</select>				
					<br />
					<label class="formLabel" for="task_output_method">Output type</label>
					<select name="output_method" id="task_output_method">
						<xsl:call-template name="getSelectedItem">
						<xsl:with-param name="default" select="/page/task/task/@output_method" />
						<xsl:with-param name="condition" select="document('data/task_output_method.xml')/task_output_methods/task_output_method" />
						</xsl:call-template>
					</select>				
					<br />
					
					<label class="formLabel" for="task_user">Task user</label>
					<input type="text" name="user" id="task_user" value="{/page/task/task/@user}" />
					<br />

					<label class="formLabel" for="task_host">Task host</label>
					<input type="text" name="host" id="task_host" value="{/page/task/task/@host}" />
					<br />
					
					<label class="formLabel" for="task_use_agent">Use evqueue agent</label>
					<input type="checkbox" name="use_agent" id="task_use_agent">
						<xsl:if test="/page/task/task/@use_agent = 1">
							<xsl:attribute name="checked">checked</xsl:attribute>
						</xsl:if>
					</input>
					<br />
					
					<label class="formLabel" for="task_merge_stderr">Merge stderr with stdout</label>
					<input type="checkbox" name="merge_stderr" id="task_merge_stderr">
						<xsl:if test="/page/task/task/@merge_stderr = 1">
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
