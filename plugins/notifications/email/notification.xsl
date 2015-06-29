<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="../ajax/notification.xsl" />
	
	<!-- VIEW -->
	<xsl:template name="parameters-view">
		<div>
			<i>
				<xsl:choose>
					<xsl:when test="/page/notification/parameters/when = 'ON_SUCCESS'">On success, </xsl:when>
					<xsl:when test="/page/notification/parameters/when = 'ON_ERROR'">On error, </xsl:when>
					<xsl:when test="/page/notification/parameters/when = 'ON_BOTH'">When workflow ends, </xsl:when>
				</xsl:choose>
			</i>
			<b>Send email </b>"<xsl:value-of select="/page/notification/parameters/subject" />"
			<b>to </b><xsl:value-of select="/page/notification/parameters/to" />
			<a href="#" onclick="$(this).parent('div').siblings('div').toggle('fast'); return false;">...</a>
		</div>
		<div style="display: none;">
			<b>Send copy to: </b>
			<xsl:value-of select="/page/notification/parameters/cc" />
		</div>
		<div style="display: none; white-space: pre-line;">
			<b>Email body:</b><br/>
			<xsl:value-of select="/page/notification/parameters/body" />
		</div>
	</xsl:template>
	
	<!-- CREATE/EDIT -->
	<xsl:template name="parameters-edit">
		<table class="edit_template_mail">
			<tr>
				<td class="formLabel"> </td>
				<td>
				<p>
					<select name="when">
						<option value="ON_SUCCESS">
							<xsl:if test="/page/notification/parameters/when = 'ON_SUCCESS'"><xsl:attribute name="selected">selected</xsl:attribute></xsl:if>
							Send email on workflow success
						</option>
						<option value="ON_ERROR">
							<xsl:if test="/page/notification/parameters/when = 'ON_ERROR'"><xsl:attribute name="selected">selected</xsl:attribute></xsl:if>
							Send email on workflow error
						</option>
						<option value="ON_BOTH">
							<xsl:if test="/page/notification/parameters/when = 'ON_SUCCESS'"><xsl:attribute name="selected">selected</xsl:attribute></xsl:if>
							Always send an email when workflow is finished
						</option>
					</select>
				</p>
				</td>
			</tr>
			<tr>
				<td class="formLabel">Subject</td>
				<td>
					<p>
						<input type="text" name="subject" placeholder="Subject" value="{/page/notification/parameters/subject}" />
					</p>
				</td>
			</tr>
			<tr>
				<td class="formLabel">To</td>
				<td>
					<p>
						<input type="text" name="to" value="{/page/notification/parameters/to}" placeholder="Recipient (possibly several, comma-separated)" />
					</p>
				</td>
			</tr>
			<tr>
				<td class="formLabel">Copy</td>
				<td>
					<p>
						<input type="text" name="cc" value="{/page/notification/parameters/cc}" placeholder="Copy to (ditto)" />
					</p>
				</td>
			</tr>
			<tr>
				<td class="formLabel">Body</td>
				<td>
					<p>
						<textarea name="body" placeholder="Email body">
							<xsl:value-of select="/page/notification/parameters/body" />
						</textarea>
					</p>
				</td>
			</tr>
		</table>
		
		<style type="text/css">
			table.edit_template_mail tr th,
			table.edit_template_mail tr td {
				border: none;
			}
			
			table.edit_template_mail input{
				width: 393px;
			}
			
			table.edit_template_mail textarea{
				width: 393px;
				height: 150px;
			}
			table.edit_template_mail .formLabel{
				font-size: 12px;
			}
		</style>
		
	</xsl:template>
	
</xsl:stylesheet>