<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:import href="templates/workflow.xsl" />
	<xsl:import href="templates/main-template.xsl" />

	<xsl:variable name="topmenu" select="'system-state'" />
	<xsl:variable name="title" select="'Board'" />

	<xsl:variable name="css">
		<src>styles/workflow-instance.css</src>
	</xsl:variable>

	<xsl:variable name="javascript">
		<src>js/instance.js</src>
		<src>js/tags.js</src>
		<src>js/custom-filters.js</src>
		<src>js/index.js</src>
	</xsl:variable>

	<xsl:template name="content">
		<div id="workflow-stats-graph">
			<div class="chartwrapper">
				<div class="chart">
					<div class="chartcenter"></div>
				</div>
			</div>
		</div>
		
		<div class="dialog" id="tags-dialog">
			<ul>
				<li><a href="#instance-tags">Instance tags</a></li>
				<li><a href="#tags-management">Tags management</a></li>
			</ul>
			<div id="instance-tags" class="hidden">
				<div>
					<form>
						Add tag&#160;:&#160;<input id="tag_label" type="text" size="16" class="evq-autocomplete" data-type="tags" />&#160;<span class="faicon fa-check"></span>
					</form>
				</div>
				<br />
				<div class="tags-list"></div>
			</div>
			<div id="tags-management" class="hidden">
			</div>
		</div>

		<div id="executing-workflows"></div>
		
		<br />

		<div id="searchformcontainer"></div>

		<br />
		
		<div id="terminated-workflows"></div>
	</xsl:template>
</xsl:stylesheet>
