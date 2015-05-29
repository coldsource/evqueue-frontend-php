<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:output method="xml" indent="no" omit-xml-declaration="yes" encoding="utf-8" doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" />

	<xsl:template match="/">
		<xsl:param name="title" select="'Workflow'" />
		<html>
			<head>
				<meta http-equiv="Content-Type" content="application/xhtml+xml; charset=utf-8" />
				
				<link rel="stylesheet" type="text/css" href="js/jquery-ui-1.11.4.custom/jquery-ui.min.css"/>
				<link rel="stylesheet" type="text/css" href="styles/style.css"/>
				<link rel="stylesheet" type="text/css" href="js/jQuery-Timepicker-Addon/dist/jquery-ui-timepicker-addon.min.css"/>
				
				<script type="text/javascript" src="js/jquery-1.7.1.min.js" />
				<script type="text/javascript" src="js/jquery-ui-1.11.4.custom/jquery-ui.min.js" />
				<script type="text/javascript" src="js/forms.js" />
				<script type="text/javascript" src="js/jQuery-Timepicker-Addon/dist/jquery-ui-timepicker-addon.min.js" />
				<script type="text/javascript" src="js/progressbar.js" />
				
				<xsl:if test="exsl:node-set($javascript)/src">
					<xsl:for-each select="exsl:node-set($javascript)/src">
						<script type="text/javascript" src="{.}"><xsl:text><![CDATA[]]></xsl:text></script>
					</xsl:for-each>
				</xsl:if>
				
				<title><xsl:value-of select="$title" /></title>
			</head>
			<body>
				<table class="skeleton">
					<tr>
						<xsl:if test="count(/page/private/logged-in-user) > 0">
							<td class="menu">
								<div>
									<h1>System state</h1>
									<h2><a href="index.php">Workflows instances</a></h2>
									<h2><a href="list-workflow-schedules.php?display=state">Scheduled workflows</a></h2>
									<h2><a href="system_state.php">Queues</a></h2>
									<h2><a href="system_statistics.php">Statistics</a></h2>
									<h2><a href="system_configuration.php">Configuration</a></h2>
									<xsl:if test="/page/private/logged-in-user/@profile = 'ADMIN'">
										<h1>Settings</h1>
										<h2><a href="list-queues.php">Queues</a></h2>
										<h2><a href="list-tasks.php">Tasks</a></h2>
										<h2><a href="list-workflows.php">Workflows</a></h2>
										<h2><a href="list-workflow-schedules.php?display=settings">Scheduled workflows</a></h2>
										<h2><a href="list-schedules.php">Retry Schedules</a></h2>
										<h2><a href="list-users.php">Users</a></h2>
									</xsl:if>
									<h1>Logging</h1>
									<h2><a href="view-logs.php">Last logs</a></h2>
									<xsl:choose>
										<xsl:when test="/page/session/workflow/@original-id = 'new'">
											<h1>
												<a style="color: #51d551;" href="manage-workflow-gui.php">Creating workflow</a>
											</h1>
										</xsl:when>
										<xsl:when test="count(/page/session/workflow/@original-id) > 0">
											<h1>
												<a style="color: #51d551;" href="manage-workflow-gui.php?workflow_id={/page/session/workflow/@original-id}">Editing workflow <xsl:value-of select="/page/session/workflow/@original-id" /></a>
											</h1>
										</xsl:when>
									</xsl:choose>
								</div>
							</td>
						</xsl:if>
						<td class="content">
							<xsl:call-template name="content" />
						</td>
					</tr>
				</table>
				
				<div id="userInfo">
					<xsl:choose>
						<xsl:when test="count(/page/private/logged-in-user) > 0">
							<span><xsl:value-of select="/page/private/logged-in-user/@login" /></span>
							<xsl:text> </xsl:text>
							<a href="manage-user.php?user_login={/page/private/logged-in-user/@login}" title="Edit">
								<img src="images/edit.png" />
							</a>
							<a href="auth.php?action=logout" title="Log out">
								<img src="images/logout.png" />
							</a>
						</xsl:when>
						<xsl:otherwise>
							Not connected
						</xsl:otherwise>
					</xsl:choose>
				</div>
				
				<div id="footer">
					<a href="http://evqueue.net">evqueue.net</a>
				</div>
			</body>
		</html>
	</xsl:template>
	
	
	<xsl:template name="displayErrors">
		<xsl:if test="count(/page/errors/error) > 0">
			<div id="errors">
				<xsl:for-each select="/page/errors/error">
					<p>
						<xsl:choose>
							<xsl:when test="count(document('../data/errors.xml')/errors/error[@id = current()/@id])">
								<xsl:value-of select="document('../data/errors.xml')/errors/error[@id = current()/@id]" />
							</xsl:when>
							<xsl:when test=". != ''">
								<xsl:value-of select="." />
							</xsl:when>
							<xsl:otherwise>
								Unknown error
							</xsl:otherwise>
						</xsl:choose>
					</p>
				</xsl:for-each>
			</div>
		</xsl:if>
	</xsl:template>

</xsl:stylesheet>
