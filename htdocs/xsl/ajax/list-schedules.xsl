<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:output method="html"/>

	<xsl:template match="/">
		<div>
			<div class="boxTitle">
				<span class="title">Retry schedules</span>
				<span class="faicon fa-file-o action" title="Add new retry schedule"></span>
			</div>
			<table>
				<tr>
					<th>Name</th>
					<th>Workflows using the retry schedule</th>
					<th class="thActions" style="width:60px;">Actions</th>
				</tr>

				<xsl:for-each select="/page/schedules/schedule">
					<tr data-id="{@id}">
						<td>
							<xsl:value-of select="@name" />
						</td>
						<td>
							<xsl:variable name="scheduleName" select="@name" />
							<xsl:variable name="wfs" select="/page/workflows/workflow[count(.//*[@retry_schedule = current()/@name]) > 0]" />
							
							<xsl:if test="count($wfs) > 0">
								<ul class="linkedObjects" >
									<xsl:for-each select="$wfs">
										<li title="Workflow '{@name}' uses retry schedule '{$scheduleName}'">
											<a href="workflow-ui.php?workflow_id={@id}">
												<xsl:value-of select="@name" />
											</a>
										</li>
									</xsl:for-each>
								</ul>
							</xsl:if>
						</td>
						<td class="tdActions">
							<span class="faicon fa-edit" title="Edit retry schedule"></span>
							<xsl:text>&#160;</xsl:text>
							<span class="faicon fa-remove" title="Delete retry schedule"></span>
						</td>
					</tr>
				</xsl:for-each>
		</table>
		</div>
	</xsl:template>

</xsl:stylesheet>
