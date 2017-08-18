<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	
<xsl:template name="value-selector">
	<div id='value-selector' class="tabs">
		<input type="hidden" id="value_selector_input_name" />
		<ul>
			<li><a href="#tab-text">Simple text</a></li>
			<li><a href="#tab-xpath">XPath value</a></li>
		</ul>
		<div id="tab-text">
			<p>In simple text mode, the entered value is passed as-is to the task. Type below the value of your parameter.</p>
			<input id="input_type_text" />
			<div style="text-align:right;margin-top:10px;">
				<button id="add_text_value">Add this value to input</button>
			</div>
		</div>
		<div id="tab-xpath">
			<p>In XPath-value mode, the value is extracted from the output (or input) of a preceding task or from a workflow parameter. This allows dynamic values to be sent to tasks as parameters.</p>
			<fieldset style="width:320px;display:inline-block;">
			<legend>Choose task</legend>
			<select id="input_type_xpathvalue" style="width:300px;">
			</select>
			</fieldset>

			<fieldset style="width:320px;display:inline-block;">
				<legend>Choose output node</legend>
				<input id="input_type_xpathvalue_nodes" />
			</fieldset>
			
			<div style="text-align:right;margin-top:10px;">
				<button id="add_xpath_value">Add this value to input</button>
			</div>
		</div>
	</div>
</xsl:template>

</xsl:stylesheet>
