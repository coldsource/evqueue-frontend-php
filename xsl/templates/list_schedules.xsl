<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:import href="dropdown_utils.xsl" />
	<xsl:import href="xmlhighlight.xsl" />
	
	<xsl:template name="list_schedules">
		
		<div class="boxTitle">
			<span class="title">Schedules List</span>
			<a href="manage-schedule.php"><img class="action" src="images/plus3.png" title="Add new retry schedule" /></a>
		</div>
		<table>
			<tr>
				<th style="width:40px;">Id</th>
				<th>Name</th>
				<th class="thActions" style="width:60px;">Actions</th>
			</tr>
			
			<xsl:for-each select="/page/response-schedules/schedule">
				<tr>
					<td class="center">
						<xsl:value-of select="@id" />
					</td>
					<td>
						<xsl:value-of select="@name" />
					</td>
					<td class="center">
						<a href="manage-schedule.php?schedule_id={@id}">
							<img src="images/edit.gif" title="Edit retry schedule" />
						</a>
						<xsl:text>&#160;</xsl:text>
						<img data-confirm="You are about to delete schedule '{@name}'" onclick="evqueueAPI(this, 'retry_schedule', 'delete', {{ 'id':'{@id}' }});location.reload();" src="images/delete.gif"  />
						</td>
				</tr>
			</xsl:for-each>
		</table>
	</xsl:template>
	
	
	<xsl:template name="schedules-select">
		<xsl:param name="selected" select="''" />
		
		<select name="retry_schedule">
			<optgroup label="Retry schedule">Retry schedule</optgroup>
			<option value="">-None-</option>
			<xsl:for-each select="/page/schedules/schedule">
				<option value="{@name}" title="{@xml}">
					<xsl:if test="$selected = @name" >
						<xsl:attribute name="selected" >selected</xsl:attribute>
					</xsl:if>
					<xsl:value-of select="@name" />
				</option>
			</xsl:for-each>
		</select>
	</xsl:template>
	
</xsl:stylesheet>
