<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:output method="xml" indent="yes" omit-xml-declaration="yes" encoding="utf-8" doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" />

	<xsl:key name="groups" match="/page/tasks/task/@group" use="." />

	<xsl:template match="/">
		<div>
			<h1>Shell task</h1>
			<div class="task" data-type="task" data-name="!/bin/ls">
				<div class="task_icon">
					<img class="cal-item-illust" src="images/icon_sh.png" alt="icon_shell"/>
				</div>
				<p>Dynamic shell task</p>
			</div>
			
			
			<xsl:for-each select="/page/tasks/task/@group[generate-id(.) = generate-id(key('groups', .))]">
				<xsl:sort select="." />

				<xsl:variable name="groupName" select="." />
				<h1>
					<xsl:choose>
						<xsl:when test="$groupName != ''">
							1<xsl:value-of select="$groupName" />
						</xsl:when>
						<xsl:otherwise>
							No group
						</xsl:otherwise>
					</xsl:choose>
				</h1>

				<xsl:for-each select="/page/tasks/task[@group = $groupName]">
					<div class="task" data-type="task" data-name="{@name}">
						<div class="task_icon">
							<xsl:choose>
								<xsl:when test="@output_method = 'XML'">
									<img class="cal-item-illust" src="images/icon_xml.png" alt="icon_xml"/>
								</xsl:when>
								<xsl:otherwise>
										<img class="cal-item-illust" src="images/icon_text.png" alt="icon_xml"/>
								</xsl:otherwise>
							</xsl:choose>
						</div>
						<p><xsl:value-of select="@name" /></p>
					</div>
				</xsl:for-each>
				
			</xsl:for-each>
		</div>
	</xsl:template>

</xsl:stylesheet>
