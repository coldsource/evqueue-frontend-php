<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

<xsl:template name="workflow-editor">
	<div id='workflow-editor' class="tabs dialog" title="Edit workflow">
		<ul>
			<li><a href="#tab-workflowproperties">Properties</a></li>
			<li><a href="#tab-workflowparameters">Parameters</a></li>
		</ul>
		<div id="tab-workflowproperties">
			<h2>
				Workflow properties
				<span class="help faicon fa-question-circle" title="Name is mandatory, this will be used from API to launch a new instance.&#10;&#10;Comment and group are optional, they are only used to classify workflows in interface."></span>
			</h2>
			<div class="formdiv">
				<form>
					<div>
						<label class="formLabel" for="wfname">Name</label>
						<input id="wfname" />
					</div>
					<div>
						<label class="formLabel" for="wfgroup">Group</label>
						<input id="wfgroup" />
					</div>
					<div>
						<label class="formLabel" for="wfcomment">Comment</label>
						<input id="wfcomment" />
					</div>
				</form>
			</div>
		</div>
		<div id="tab-workflowparameters">
			<h2>
				Parameters
				<span class="help faicon fa-question-circle" title="Workflow parameters are provided when a new instance is launched. These parameters can be used in XPath expressions and provided as input to tasks."></span>
			</h2>
			<div class="parameters"></div>
			<span id="add-parameter" class="faicon fa-plus" title="Add parameter"></span>
		</div>
	</div>
</xsl:template>

</xsl:stylesheet>
