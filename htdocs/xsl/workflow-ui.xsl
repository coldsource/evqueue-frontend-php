<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	<xsl:import href="templates/workflow-ui/task-editor.xsl" />
	<xsl:import href="templates/workflow-ui/job-editor.xsl" />
	<xsl:import href="templates/workflow-ui/workflow-editor.xsl" />

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
		<src>js/ui-elements/workflow-editor.js</src>
		<src>js/ui-elements/xpath-helper.js</src>
		<src>js/workflow-ui.js</src>
	</xsl:variable>

	<xsl:template name="content">
		<script type="text/javascript">
			var workflow_id = <xsl:value-of select="/page/@workflow_id" />;
		</script>
	
		<div id='sticky_menu'>
			<span id="save" class="faicon fa-save" title="Save workflow"></span>
			<span id="open-workflow-editor" class="faicon fa-gears" title="Workflow properties"></span>
			<span id="undo" class="faicon fa-rotate-left" title="Undo"></span>
			<span id="redo" class="faicon fa-rotate-right" title="Redo"></span>
			<span id="open-tasks-library" class="faicon fa-tasks" title="Tasks library"></span>
			<span id="export_xml" class="faicon fa-arrow-down" title="Export XML"></span>
			<span id="import_xml" class="faicon fa-arrow-up" title="Import XML"></span>
			<span id="trash" class="faicon fa-trash" title="Drag'n drop elements to the trash to remove them"></span>
			<span id="message"></span>
			<span id="exit" class="faicon fa-remove" title="Exit workflow edition"></span>
		</div>

		<div id="workflow"></div>
		
		<div id="tasks-library" class="dialog" title="Tasks library"></div>
		
		<div id='import_xml_dlg' class="dialog">
			<textarea rows='30' cols='80' name='xml'></textarea>
			<button id='import_xml_action'>Import</button>
		</div>
		
		<div id="taskmenu" class="hidden action">
			<span class="faicon fa-times"></span>Delete task
		</div>
		
		<xsl:call-template name="xpath-selector" />
		<xsl:call-template name='task-editor' />
		<xsl:call-template name='job-editor' />
		<xsl:call-template name='workflow-editor' />

	</xsl:template>

</xsl:stylesheet>
