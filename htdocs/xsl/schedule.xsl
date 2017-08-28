<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	
	<xsl:variable name="topmenu" select="'settings'" />
	
	<xsl:variable name="javascript">
		<src>js/schedule.js</src>
	</xsl:variable>

	<xsl:template name="content">
		<div id="list-schedules"></div>
		
		<xsl:call-template name="schedule-editor" />
	</xsl:template>
	
	<xsl:template name="schedule-editor">
		<div id="schedule-editor" class="dialog formdiv" data-width="900" data-height="300">
			<h2>
				Retry schedule description
				<span class="help faicon fa-question-circle" title="Retry schedules are used to relaunch a task when it fails. The task will not be considered failed as long as all retries have not been executed. This is especially useful for tasks that are accessing remote serices like FTP or Webservices.&#10;&#10;For this to work you have to set the retry schedule in the task properties of the workflow editor."></span>
			</h2>
			<form>
				<input type="hidden" name="content" />
				<div>
					<label>Name</label>
					<input type="text" name="name" />
				</div>
				<div>
					<label><span class="faicon fa-plus"></span></label>
				</div>
			</form>
			<button class="submit">Save</button>
		</div>
	</xsl:template>
	
</xsl:stylesheet>
