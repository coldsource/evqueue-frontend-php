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

		<xsl:call-template name="filter" />

		<br />
		
		<div id="terminated-workflows"></div>
	</xsl:template>

	<xsl:template name="filter">
		<div id="searchformcontainer">
			<a onclick="$('#searchformcontainer .filter').toggle();" href="javascript:void(0)">Filters</a> : <span id="searchexplain">Showing all terminated workflows</span><span id="clearfilters" class="hidden faicon fa-remove" title="Clear filters"></span>

			<div class="formdiv filter hidden">
				<form id="searchform">
					<div>
						<label>Node</label>
						<select name="node">
							<option value="">All</option>
							<xsl:for-each select="/page/evqueue-nodes/node">
								<option value="{@name}"><xsl:value-of select="@name" /></option>
							</xsl:for-each>
						</select>
					</div>
					<div id="searchworkflow">
						<label>Workflow</label>
						<select name="wf_name" class="evq-autofill select2" data-type="workflows" data-valuetype="id"></select>
					</div>
					<div id="searchtag">
						<label>Tag</label>
						<select name="tagged" class="evq-autofill" data-type="tags"></select>
					</div>
					<div>
						<label>Launched between</label>
						Date&#160;:&#160;<input id="dt_inf" name="dt_inf" class="datepicker" />
						Hour&#160;:&#160;<input id="hr_inf" name="hr_inf" class="timepicker evq-autocomplete" data-type="time" />
						&#160;&#160;<b>and</b>&#160;&#160;
						Date&#160;:&#160;<input id="dt_sup" name="dt_sup" class="datepicker" />
						Hour&#160;:&#160;<input id="hr_sup" name="hr_sup" class="timepicker evq-autocomplete" data-type="time" />
					</div>
					<div>
						<label>Workflows that were running at</label>
						Date&#160;:&#160;<input id="dt_at" name="dt_at" class="datepicker" />
						Hour&#160;:&#160;<input id="hr_at" name="hr_at" class="timepicker evq-autocomplete" data-type="time" />
					</div>
				</form>
			</div>
		</div>
	</xsl:template>

</xsl:stylesheet>
