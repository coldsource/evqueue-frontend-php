<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	
	<xsl:variable name="javascript">
	</xsl:variable>
	
	<xsl:template name="content">
		<div  class="contentManage">
			<div class="boxTitle">
				<span class="title">
				<xsl:choose>
					<xsl:when test="/page/schedule/@id">
					Update Schedule
					</xsl:when>
					<xsl:otherwise>
					Create Schedule
					</xsl:otherwise>
				</xsl:choose>
				</span>
			</div>
			<div id="Schedule" class="formdiv">
				<xsl:call-template name="displayErrors" />
				<form name="formSchedule" id="formSchedule" action="manage-schedule-text.php?schedule_id={/page/@schedule_id}" method="post">
					<input type="hidden" name="schedule_id" value="{/page/schedule/@id}" />
					<label class="formLabel" for="schedule_name">Schedule name:</label>
					<input type="text" name="schedule_name" id="schedule_name" value="{/page/schedule/schedule/@name}" />
					<br />
					<label class="formLabel forTextarea" for="schedule_xml">Schedule xml:</label>
					<textarea name="schedule_xml" id="schedule_xml" class="small">
						<xsl:copy-of select="/page/schedule/schedule" />
					</textarea>
					<br />
					<input type="submit" name="submitFormSchedule" class="submitFormButton submitFormButtonMedium" value="Submit" />
				</form>	
			</div>
		</div>
	</xsl:template>
	
</xsl:stylesheet>
