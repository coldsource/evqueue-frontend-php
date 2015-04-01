<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:php="http://php.net/xsl">
	<xsl:import href="templates/main-template.xsl" />
	<xsl:import href="templates/dropdown_utils.xsl" />
	
	<xsl:variable name="javascript">
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
		</script>
		
		<div class="contentManage">
			<div class="boxTitle">
				<span class="title">
					<xsl:choose>
					<xsl:when test="/page/task/@id">
						Update Task
					</xsl:when>
					<xsl:otherwise>
						Create Task
					</xsl:otherwise>
					</xsl:choose>
				</span>
			</div>
			<div id="task" class="formdiv">
				<xsl:call-template name="displayErrors" />

				<form name="formTask" id="formTask" action="manage-task.php" method="post">
					<input type="hidden" name="task_id" value="{/page/task/@id}" />
					<label class="formLabel" for="task_name" >Task name:</label>
					<input type="text" name="task_name" id="task_name" value="{/page/task/task_name}" />
					<br />
					<label class="formLabel" for="task_binary_path">Task binary:</label>
					<input type="text" name="task_binary_path" id="task_binary_path" value="{/page/task/task_binary}" placeholder="Absolute path to your script on the host machine" class="filenameInput" />
					<br />
					<label class="formLabel" for="task_group">Task group:</label>
					<input type="text" name="task_group" id="task_group" value="{/page/task/task_group}" />
					<br />
					<label class="formLabel" for="task_wd">Task working directory:</label>
					<input type="text" name="task_wd" id="task_wd" value="{/page/task/task_wd}" />
					<br />
					<label class="formLabel" for="task_parameters_mode">Parameters mode:</label>
					<select name="task_parameters_mode" id="task_parameters_mode">
						<xsl:call-template name="getSelectedItem">
						<xsl:with-param name="default" select="/page/task/task_parameters_mode" />
						<xsl:with-param name="condition" select="document('data/task_parameters_mode.xml')/task_parameters_modes/task_parameters_mode" />
						</xsl:call-template>
					</select>				
					<br />
					<label class="formLabel" for="task_output_method">Output type:</label>
					<select name="task_output_method" id="task_output_method">
						<xsl:call-template name="getSelectedItem">
						<xsl:with-param name="default" select="/page/task/task_output_method" />
						<xsl:with-param name="condition" select="document('data/task_output_method.xml')/task_output_methods/task_output_method" />
						</xsl:call-template>
					</select>				
					<br />
					<label class="formLabel" for="task_xsd">Task XSD:</label>
					<input type="text" name="task_xsd" id="task_xsd" value="{/page/task/task_xsd}" />

					<br />
					<label class="formLabel" for="task_user">Task user:</label>
					<input type="text" name="task_user" id="task_user" value="{/page/task/task_user}" />

					<br />
					<label class="formLabel" for="task_host">Task host:</label>
					<input type="text" name="task_host" id="task_host" value="{/page/task/task_host}" />

					<br />
					<input type="submit" name="submitFormTask" id="submitFormTask" class="submitFormButton submitFormButtonSmall" value="Submit" />
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
			</div>
		</div>
    </xsl:template>
</xsl:stylesheet>
