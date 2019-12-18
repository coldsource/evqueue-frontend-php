<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="../templates/workflow.xsl" />
	<xsl:import href="../templates/xmlhighlight.xsl" />
	
	<xsl:template match="/">
		<div>
			<!-- Display workflow -->
			<xsl:apply-templates select="/page/instance/workflow" mode="tree" />
			
			<!-- Display workflow XML -->
			<div id="workflow-{/page/instance/workflow/@id}-xml">
				
				<a href="#add-custom-filter" onclick="$(this).next().toggle('fast');" style="color: #27ae60; font-weight: bold;">+ Add Custom Filter</a>
				
				<form class="add-custom-filter" style="margin: 0.5em; display: none;">
					<input type="hidden" name="instance_id" value="{/page/instance/workflow/@id}" />
					<input name="custom_filter_name" required="required" placeholder="Custom Filter Name" />
					<label>
						<input type="checkbox" name="filter_on_taskpath" />
						Filter on tasks' paths
					</label>
					<label>
						<input type="checkbox" name="filter_on_inputname" checked="checked" />
						Filter on inputs' names
					</label>
					<label>
						<input type="checkbox" name="filter_on_paramname" checked="checked" />
						Filter on parameters' names
					</label>
					<input style="width: 80%; display: block; flex-grow: 4;" name="xpath_expr" placeholder="Click in the XML to autogenerate an XPath expression" />
					<input style="width: 80%; display: block;" name="custom_filter_desc" placeholder="Description" />
					<input type="submit" value="Save Custom Filter" />
				</form>
				
				<div class="instance-xml-output">
					<xsl:apply-templates select="/page/instance/workflow" mode="xml_display" />
				</div>
			</div>
			
			<!-- Display tasks details -->
			<div id="workflow-{/page/instance/workflow/@id}-parameters">
				<div class="tabbed">
					<xsl:for-each select="/page/instance/workflow/parameters/parameter">
						<div>
							<div><xsl:value-of select="@name" /></div>
							<div><xsl:value-of select="." /></div>
						</div>
					</xsl:for-each>
				</div>
			</div>
			<xsl:apply-templates select="/page/instance/workflow/subjobs" mode="details" />
		</div>
	</xsl:template>

</xsl:stylesheet>
