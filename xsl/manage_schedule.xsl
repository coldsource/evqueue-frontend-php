<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	
	<xsl:variable name="javascript">
		<src>js/manage-schedule.js</src>
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
				
				<form name="formSchedule" id="formSchedule" action="manage-schedule.php" method="post">
					<input type="hidden" name="schedule_id" value="{/page/schedule/@id}" />
					<label class="formLabel" for="schedule_name">Schedule name:</label>
					<input type="text" name="schedule_name" id="schedule_name" value="{/page/schedule/schedule/@name}" />
					<br />
					<table style="width: auto; margin-top: 15px;">
						<tbody>
							<tr>
								<td>Retry every X seconds</td>
								<td>for Y times</td>
							</tr>
							<xsl:for-each select="/page/schedule/schedule/level">
								<tr>
									<td>
										<input type="text" name="retry_delay[]" value="{@retry_delay}" />
									</td>
									<td>
										<input type="text" name="retry_times[]" value="{@retry_times}" />
									</td>
									<td>
										<img src="images/edition/delete.png" title="Delete" class="deleteLevel" />
									</td>
								</tr>
							</xsl:for-each>
							<tr>
								<td colspan="3">
									<img src="images/edition/addTask.png" title="Add" class="addLevel" />
								</td>
							</tr>
						</tbody>
					</table>
					<br />
					<input type="submit" name="submitFormSchedule" class="submitFormButton submitFormButtonMedium" value="Submit" />
				</form>
				
			</div>
		</div>
	</xsl:template>
	
</xsl:stylesheet>
