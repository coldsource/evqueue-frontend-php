<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

<xsl:template name="node-helper">
	<fieldset style="width:320px;display:inline-block;">
		<legend>Choose task</legend>
		
		<select class="input_type_xpath" style="width:300px;">
		</select>
	</fieldset>

	<fieldset style="width:320px;display:inline-block;">
		<legend>Choose output node</legend>
		
		<input class="input_type_xpath_nodes" />
	</fieldset>
</xsl:template>

<xsl:template name="value-selector">
	<div id='value-selector' class="tabs" title="Value selector">
		<ul>
			<li><a href="#tab-text">Simple text</a></li>
			<li><a href="#tab-value">XPath value</a></li>
			<li><a href="#tab-copy">XPath copy</a></li>
			<li><a href="#tab-advanced">Advanced</a></li>
		</ul>
		<div id="tab-text">
			<p>In simple text mode, the entered value is passed as-is to the task. Type below the value of your parameter.</p>
			<input class="input_type_text" />
			<div style="text-align:right;margin-top:10px;">
				<button class="add_value" data-type="text">Add this value to input</button>
			</div>
		</div>
		<div id="tab-value">
			<p>In XPath-value mode, the value is extracted from the output (or input) of a preceding task or from a workflow parameter. This allows dynamic values to be sent to tasks as parameters.</p>
			
			<xsl:call-template name="node-helper" />
			
			<div style="text-align:right;margin-top:10px;">
				<button class="add_value" data-type="xpathvalue">Add this value to input</button>
			</div>
		</div>
		<div id="tab-copy">
			<p>In XPath-copy mode, the xml subtree is extracted from the output (or input) of a preceding task or from a workflow parameter. The resulting value is an XML subtree.</p>
			
			<xsl:call-template name="node-helper" />
			
			<div style="text-align:right;margin-top:10px;">
				<button class="add_value" data-type="xpathcopy">Add this value to input</button>
			</div>
		</div>
		<div id="tab-advanced">
			<p>Enter here your XPath expression.</p>
			
			<div>
				XPath mode&#160;:&#160;
				<select id="advanced_mode">
					<option value="xpathvalue">Value</option>
					<option value="xpathcopy">Copy</option>
				</select>
			</div>
			<br />
			<div>
				<input class="input_type_advanced" />
			</div>
			
			<div style="text-align:right;margin-top:10px;">
				<button class="add_value" data-type="advanced">Add this value to input</button>
			</div>
		</div>
	</div>
</xsl:template>

<xsl:template name="xpath-selector">
	<div id='xpath-selector' title="XPath Helper">
		<div>
			<p>This helper allows you to write XPath expression to match a specific node in the workflow document.</p>
			
			<xsl:call-template name="node-helper" />
			
			<div style="text-align:right;margin-top:10px;">
				<button id="add_xpath_node">Select this node</button>
			</div>
		</div>
	</div>
</xsl:template>

</xsl:stylesheet>
