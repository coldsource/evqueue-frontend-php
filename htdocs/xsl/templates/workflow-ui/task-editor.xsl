<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

<xsl:import href="value-selector.xsl" />
	
<xsl:template name="task-editor">
	<div id='task-editor' class="tabs" title="Edit task">
		<ul>
			<li><a href="#tab-inputs">Inputs</a></li>
			<li><a href="#tab-conditionsloops">Conditions &amp; loops</a></li>
			<li><a href="#tab-queueretry">Queue &amp; retry</a></li>
			<li><a href="#tab-stdin">Stdin</a></li>
		</ul>
		<div id="tab-inputs">
			<h2>
				Tasks inputs
				<span class="help faicon fa-question-circle" title="The inputs are passed to the task that will be executed. Depending on your task configuration, inputs will be passed as command line arguments or environment variables. The default is command line arguments.&#10;&#10;Input values can be static (simple text), or dynamic by fetching output of parent tasks in the workflow."></span>
			</h2>
			<div class="inputs"></div>
			<span id="add-input" class="faicon fa-plus" title="Add input"></span>
		</div>
		<div id="tab-conditionsloops">
		</div>
		<div id="tab-queueretry">
		</div>
		<div id="tab-stdin">
		</div>
	</div>
	
	<xsl:call-template name="value-selector" />
</xsl:template>

</xsl:stylesheet>
