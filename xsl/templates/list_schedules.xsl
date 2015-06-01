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
				<th class="thActions">Actions</th>
			</tr>
			
			<xsl:for-each select="/page/schedules/schedule">
				<tr>
					<td class="center">
						<xsl:value-of select="@id" />
					</td>
					<td>
						<xsl:value-of select="schedule_name" />
						<xsl:text>&#160;</xsl:text>
						<img src="images/bigger.png" title="View retry schedule XML" class="pointer" onclick="$('#xmlcontent{@id}').dialog({{width:800}});" />
						<div id="xmlcontent{@id}" style="display:none;">
							<xsl:apply-templates select="schedule_xml/schedule" mode="xml_display" />
						</div>
					</td>
					<td class="center">
						<a href="manage-schedule.php?schedule_id={@id}">
							<img src="images/edit.gif" title="Edit retry schedule (GUI mode)" />
						</a>
						<xsl:text>&#160;</xsl:text>
						<a href="manage-schedule-text.php?schedule_id={@id}">
							<img src="images/edition/edit-txt.png" title="Edit retry schedule text mode)" />
						</a>
						<xsl:text>&#160;</xsl:text>
						<img src="images/delete.gif" onclick="deleteSchedule({@id})" class="pointer" />
					</td>
				</tr>
			</xsl:for-each>
		</table>
	</xsl:template>
	
	
	<xsl:template name="schedules-select">
		<select name="retry_schedule">
			<optgroup label="Retry schedule">Retry schedule</optgroup>
			<option value="">-None-</option>
			<xsl:for-each select="/page/schedules/schedule">
				<option value="{schedule_name}" title="{schedule_xml}">
					<xsl:value-of select="schedule_name" />
				</option>
			</xsl:for-each>
		</select>
	</xsl:template>
	
</xsl:stylesheet>
