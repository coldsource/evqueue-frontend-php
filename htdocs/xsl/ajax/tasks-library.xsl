<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:output method="xml" indent="yes" omit-xml-declaration="yes" encoding="utf-8" doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" />

	<xsl:key name="groups" match="/page/tasks/task/@group" use="." />

	<xsl:template match="/">
		<div>
			<h2>Text task</h2>
			<div class="task" data-type="task" data-path="/bin/ls" data-parametersmode="CMDLINE" data-outputmethod="TEXT">
				<div class="task_icon">
					<img class="cal-item-illust" src="images/icon_sh.png" alt="icon_shell"/>
				</div>
				<p>Command line arguments</p>
			</div>
			<div class="task" data-type="task" data-path="/bin/ls" data-parametersmode="ENV" data-outputmethod="TEXT">
				<div class="task_icon">
					<img class="cal-item-illust" src="images/icon_sh.png" alt="icon_shell"/>
				</div>
				<p>Environement variables arguments</p>
			</div>
			
			<h2>XML task</h2>
			<div class="task" data-type="task" data-path="/bin/ls" data-parametersmode="CMDLINE" data-outputmethod="XML">
				<div class="task_icon">
					<img class="cal-item-illust" src="images/icon_sh.png" alt="icon_shell"/>
				</div>
				<p>Command line arguments</p>
			</div>
			<div class="task" data-type="task" data-path="/bin/ls" data-parametersmode="ENV" data-outputmethod="XML">
				<div class="task_icon">
					<img class="cal-item-illust" src="images/icon_sh.png" alt="icon_shell"/>
				</div>
				<p>Environement variables arguments</p>
			</div>
		</div>
	</xsl:template>

</xsl:stylesheet>
