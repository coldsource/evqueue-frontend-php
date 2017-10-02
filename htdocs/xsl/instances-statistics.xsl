<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	<xsl:import href="templates/git.xsl" />

	<xsl:variable name="topmenu" select="'statistics'" />
	
	<xsl:variable name="javascript">
		<src>js/morris/morris.min.js</src>
		<src>js/morris/raphael.min.js</src>
		<src>js/instances-statistics.js</src>
	</xsl:variable>
	
	<xsl:variable name="css">
		<src>styles/morris/morris.css</src>
	</xsl:variable>
	
	<xsl:key name="groups" match="/page/workflows/workflow/@group" use="." />

	<xsl:template name="content">
		<div class="graph-period">
			Please choose graph period
			<form>
				<input type="radio" name="groupby" value="hour" />&#160;Hourly
				<xsl:text> - </xsl:text>
				<input type="radio" name="groupby" value="day" checked="checked" />&#160;Daily
				<xsl:text> - </xsl:text>
				<input type="radio" name="groupby" value="month" />&#160;Daily
				<xsl:text> - </xsl:text>
				<input type="radio" name="groupby" value="year" />&#160;Yearly
				<xsl:text> - </xsl:text>
			</form>
		</div>
		
		<h2>General summary</h2>
		<div class="graph-container" data-group=":all">
			<div class="graph" id="graph"></div>
		</div>
		
		<xsl:for-each select="/page/workflows/workflow/@group[generate-id(.) = generate-id(key('groups', .))]">
			<xsl:sort select="." />
			<xsl:variable name="groupName" select="." />
			
			<br /><br />
			<xsl:choose>
				<xsl:when test="$groupName != ''">
					<h2><xsl:value-of select="$groupName" /></h2>
				</xsl:when>
				<xsl:otherwise>
					<h2>No group</h2>
				</xsl:otherwise>
			</xsl:choose>
			
			<div class="graph-container" data-group="{$groupName}">
				<div class="graph" id="graph-{translate($groupName,' ','-')}"></div>
				<div class="graph-workflows">
					<xsl:for-each select="/page/workflows/workflow[@group = $groupName]">
						<div class="graph-workflow">
							<input type="checkbox" name="{@name}" />
							<label for="{@name}"><xsl:value-of select="@name" /></label>
						</div>
					</xsl:for-each>
				</div>
			</div>
		</xsl:for-each>
	</xsl:template>

</xsl:stylesheet>
