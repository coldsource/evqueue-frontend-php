<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	
	<xsl:variable name="topmenu" select="'system-state'" />
	
	<xsl:variable name="javascript">
	</xsl:variable>
	
	<xsl:template name="content">
		<div class="contentManage">
			<div class="boxTitle">
				<span class="title">Queues States (node <xsl:value-of select="@node_name" />)</span>
			</div>
		
			<div class="makeMeTabz">
				<ul>
					<xsl:for-each select="/page/stats">
						<li><a href="#{@node_name}"><xsl:value-of select="@node_name" /></a></li>
					</xsl:for-each>
				</ul>
			
				<xsl:for-each select="/page/stats">
					<div id="{@node_name}">
						<table>
							<tr>
								<th>Name</th>
								<th>Concurrency</th>
								<th>Running tasks</th>
								<th>Queued tasks</th>
							</tr>

							<xsl:for-each select="statistics/queue">
								<tr class="evenOdd">
									<td>
										<xsl:value-of select="@name" />
									</td>
									<td class="txtcenter">
										<xsl:value-of select="@concurrency" />
									</td>
									<td class="txtcenter">
										<div class="progressBar default" actualVal="{@running_tasks}" maxVal="{@concurrency}">
											<div></div>
										</div>
										<xsl:value-of select="@running_tasks" /> task<xsl:if test="@running_tasks > 1">s </xsl:if>
										<xsl:text> running.</xsl:text>
									</td>
									<td class="txtcenter">

										<div class="progressBar2 default" actualVal="{@size}" maxVal="{@concurrency}">
											<div></div>
										</div>
										<xsl:value-of select="@size" /> awaiting task<xsl:if test="@running_tasks > 1">s </xsl:if>
										<xsl:text> in queue.</xsl:text>

									</td>
								</tr>
							</xsl:for-each>
						</table>
					</div>
				</xsl:for-each>
			</div>
		</div>
	<script type="text/javascript">$('div.makeMeTabz:visible').tabs().removeClass('makeMeTabz');</script>
	</xsl:template>

</xsl:stylesheet>
