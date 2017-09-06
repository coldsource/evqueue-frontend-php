<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	
	<xsl:variable name="topmenu" select="'system-state'" />
	
	<xsl:variable name="javascript">
	</xsl:variable>
	
	<xsl:template name="content">
		<div>
			<div class="boxTitle statistics">
				<span class="title">Configuration</span>
			</div>
			
			<div class="tabs">
				<ul>
					<xsl:for-each select="/page/global/response">
						<li><a href="#{@node}"><xsl:value-of select="@node" /></a></li>
					</xsl:for-each>
				</ul>
				
				<xsl:for-each select="/page/global/response">
					<div id="{@node}" class="sysConfTab">
						<table class="statistics" style="width:100%;">
							<xsl:for-each select="configuration/entry">
								<tr class="evenOdd">
									<td class="txtcenter paramName">
										<xsl:value-of select="@name" />
									</td>
									<td class="txtcenter paramValue">
										<xsl:if test="@name!='mysql.password'"><xsl:value-of select="@value" /></xsl:if>
										<xsl:if test="@name='mysql.password'">****</xsl:if>
									</td>
								</tr>
							</xsl:for-each>	
						</table>
					</div>
				</xsl:for-each>
				
			</div>
		</div>
		
		<!-- Highlight parameters that have different values on multiple nodes. -->
		<script type="text/javascript">
			$('.sysConfTab:eq(0) .paramName').each( function () {
				var paramName = $(this).text();
				var valueName = $(this).next('.paramValue').text();
				
				var params = $('.paramName').filter( function () { return $(this).text() === paramName; } );
				var values = params.next('.paramValue');
				
				if (values.length !== values.filter( function () { return $(this).text() === valueName; } ).length) {
					values.css('font-weight', 'bold');
				}
			});
		</script>
	</xsl:template>
</xsl:stylesheet>
