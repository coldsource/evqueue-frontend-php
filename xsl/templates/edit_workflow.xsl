<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0" xmlns:php="http://php.net/xsl">
	<xsl:output method="xml"/>

	<xsl:template name="form_workflow">
		<form name="formWorkflow" id="formWorkflow" action="manage-workflow.php?workflow_id={/page/get/@workflow_id}" method="post">
			<xsl:call-template name="form_workflow_header"/>
			<br />
			Workflow xml:
			<br />
			<textarea id="workflow_xml" name="workflow_xml" class="large">
				<xsl:choose>
					<xsl:when test="/page/post/@workflow_xml != ''">
						<xsl:value-of select="/page/post/@workflow_xml" />
					</xsl:when>
					<xsl:otherwise>
						<xsl:copy-of select="/page/response-workflow/workflow/workflow" />
					</xsl:otherwise>
				</xsl:choose>
			</textarea>
			<br />
			<input type="submit" name="submitFormWorkflow" class="submitFormButton submitFormButtonLarge" value="Save workflow" />
		</form>
	</xsl:template>
	
	<xsl:template name="form_workflow_header">
		<input type="hidden" name="workflow_id" value="{/page/workflow/@id}" />
		<label class="formLabel" for="workflow_name">Name:</label>
		<input type="text" name="workflow_name" id="workflow_name" placeholder="The name of your workflow" value="{/page/post/@workflow_name | /page/response-workflow/workflow/@name}"  />
		<br />
		
		<script type="text/javascript">
			availableTags = [
				<xsl:for-each select="/page/groups/group">
					<xsl:if test=". != ''">
						<xsl:text disable-output-escaping="yes">"</xsl:text><xsl:call-template name="escapeQuote"/><xsl:text disable-output-escaping="yes">",</xsl:text>
					</xsl:if>
				</xsl:for-each>
			];
		</script>
		
		<label class="formLabel" for="workflow_group">Group:</label>
		<input type="text" name="workflow_group" id="workflow_group" value="{/page/post/@workflow_group | /page/response-workflow/workflow/@group }" placeholder="Group name" />
		
		<br />
		<label class="formLabel" for="workflow_comment">Comment:</label>
		<input type="text" name="workflow_comment" id="workflow_comment" value="{/page/post/@workflow_comment | /page/response-workflow/workflow/@comment }" placeholder="Comment" />
		<br />
		
		<br />
		<table style="width:560px;">
			<xsl:for-each select="/page/notification_types/notification_type">
				<xsl:variable name="notification_type_id" select="@id" />
				<tr>
					<td colspan="2">
						Notifications <xsl:value-of select="name" />
					</td>
				</tr>
				<xsl:for-each select="/page/notifications/notification[@type_id=$notification_type_id]">
					<tr>
						<td style="width:20px;">
							<input type="checkbox" name="notification[]" value="{@id}">
								<xsl:if test="/page/workflow-notifications/notification/@id = @id">
									<xsl:attribute name="checked">checked</xsl:attribute>
								</xsl:if>
							</input>
						</td>
						<td>
							<xsl:value-of select="@name" />
						</td>
					</tr>
				</xsl:for-each>
			</xsl:for-each>
		</table>
	</xsl:template>
	
	<xsl:template name="escapeQuote">
		<xsl:param name="pText" select="."/>
		<xsl:if test="string-length($pText) >0">
			<xsl:value-of select="substring-before(concat($pText, '&quot;'), '&quot;')"/>
			<xsl:if test="contains($pText, '&quot;')">
				<xsl:text>\"</xsl:text>
				<xsl:call-template name="escapeQuote">
				  <xsl:with-param name="pText" select="substring-after($pText, '&quot;')"/>
				</xsl:call-template>
			</xsl:if>
		</xsl:if>
	</xsl:template>
	
	
	<xsl:template name="edit-simple-workflow">
		<xsl:param name="standalone" select="'yes'" />
		
		<form method="post">
			<xsl:call-template name="form_workflow_header"/>
			<br />
			<label class="formLabel" for="task_wd">Script working directory:</label>
			<input type="text" name="task_wd" id="task_wd" value="{/page/tasks/task[task_name = /page/workflow//task/@name]/task_wd | /page/post/@task_wd}" />
			<br/>
			<br/>
			
			<xsl:if test="$standalone = 'yes'">
				<b>A "simple" workflow</b> is a workflow that contains only <emph>one</emph> task, i.e. one script that will be executed.<br/>
				Give here the absolute path (or relative to the <i>processmanager.tasks.directory</i> conf parameter) to your script on the host machine:
				<br/>
				<br/>
			</xsl:if>
			
			<label class="formLabel" for="task_wd">Path to your script:</label>
			<input name="script_path" placeholder="The path to your script" class="filenameInput">
				<xsl:attribute name="value">
					<xsl:choose>
						<xsl:when test="/page/post/@script_path">
							<xsl:value-of select="/page/post/@script_path" />
						</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="/page/tasks/task[task_name = /page/workflow//task/@name]/task_binary" />
							<xsl:for-each select="/page/workflow//task/input">
								<xsl:text> </xsl:text><xsl:value-of select="php:function('addslashes', string(.))" /><xsl:text></xsl:text>
							</xsl:for-each>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:attribute>
			</input>
			
			<xsl:if test="$standalone = 'yes'">
				<br/>
				<br/>
				<input class="button" type="submit" value="Save workflow" />
			</xsl:if>
		</form>
	</xsl:template>
	
</xsl:stylesheet>
