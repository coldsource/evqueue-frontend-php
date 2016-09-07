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
		<input type="hidden" name="workflow_id" value="{/page/get/@workflow_id}" />
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
</xsl:stylesheet>
