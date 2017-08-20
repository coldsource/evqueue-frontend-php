<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	<xsl:import href="templates/workflow-ui/task-editor.xsl" />
	<xsl:import href="templates/workflow-ui/job-editor.xsl" />

	<xsl:variable name="topmenu" select="'settings'" />
	<xsl:variable name="FULLSCREEN" select="'yes'" />
	
	<xsl:variable name="css">
		<src>styles/workflow-ui.css</src>
	</xsl:variable>

	<xsl:variable name="javascript">
		<src>js/objects/workflow.js</src>
		<src>js/objects/job.js</src>
		<src>js/objects/task.js</src>
		<src>js/ui-elements/tasks-library.js</src>
		<src>js/ui-elements/task-editor.js</src>
		<src>js/ui-elements/job-editor.js</src>
		<src>js/ui-elements/xpath-helper.js</src>
		<src>js/workflow-ui.js</src>
	</xsl:variable>

	<xsl:template name="content">
	
		<div id='sticky_menu'>
			<span id="undo" class="fa-rotate-left" title="Undo"></span>
			<span id="redo" class="fa-rotate-right" title="Redo"></span>
			<span id="open-tasks-library" class="fa-tasks" title="Tasks library"></span>
			<span id="export_xml" class="fa-arrow-down" title="Export XML"></span>
			<span id="import_xml" class="fa-arrow-up" title="Import XML"></span>
			<span id="trash" class="fa-trash" title="Drag'n drop elements to the trash to remove them"></span>
		</div>

		<div id="workflow"></div>
		
		<div id="tasks-library" title="Tasks library"></div>
		
		<div id='import_xml_dlg' style='display:none;'>
			<textarea rows='30' cols='80' name='xml'></textarea>
			<button id='import_xml_action'>Import</button>
		</div>
		
		<xsl:call-template name="xpath-selector" />
		<xsl:call-template name='task-editor' />
		<xsl:call-template name='job-editor' />
		
		<script type="text/javascript">
			
		</script>

	</xsl:template>

</xsl:stylesheet>
