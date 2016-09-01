<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:output method="xml" indent="no" omit-xml-declaration="yes" encoding="utf-8" doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" />
	
	<xsl:param name="CSS" select="''" />
	<xsl:param name="javascript" select="''" />
	<xsl:param name="SITE_BASE" select="''" />
	
	<xsl:param name="ISFORM" select="''" />
	<xsl:param name="FORMTITLE" select="''" />
	
	<xsl:template match="/">
		<xsl:param name="title" select="'Workflow'" />
		<html>
			<head>
				<meta http-equiv="Content-Type" content="application/xhtml+xml; charset=utf-8" />
				
				<link rel="stylesheet" type="text/css" href="{$SITE_BASE}js/jquery-ui-1.11.4.custom/jquery-ui.min.css"/>
				
				<xsl:choose>
					<xsl:when test="$CSS = 'GUI'">
						<link rel="stylesheet" type="text/css" href="{$SITE_BASE}styles/gui.css"/>
					</xsl:when>
					<xsl:otherwise>
						<link rel="stylesheet" type="text/css" href="{$SITE_BASE}styles/style.css"/>
					</xsl:otherwise>
				</xsl:choose>
				
				<link rel="stylesheet" type="text/css" href="{$SITE_BASE}js/jQuery-Timepicker-Addon/dist/jquery-ui-timepicker-addon.min.css"/>
				
				<script type="text/javascript">
					var site_base = '<xsl:value-of select="$SITE_BASE" />';
				</script>
				
				<script type="text/javascript" src="{$SITE_BASE}js/jquery-1.7.1.min.js" />
				<script type="text/javascript" src="{$SITE_BASE}js/jquery-ui-1.11.4.custom/jquery-ui.min.js" />
				<script type="text/javascript" src="{$SITE_BASE}js/forms.js" />
				<script type="text/javascript" src="{$SITE_BASE}js/jQuery-Timepicker-Addon/dist/jquery-ui-timepicker-addon.min.js" />
				<script type="text/javascript" src="{$SITE_BASE}js/progressbar.js" />
				<script type="text/javascript" src="{$SITE_BASE}js/global.js" />
				
				<xsl:if test="$javascript != '' and exsl:node-set($javascript)/src">
					<xsl:for-each select="exsl:node-set($javascript)/src">
						<script type="text/javascript" src="{$SITE_BASE}{.}"><xsl:text><![CDATA[]]></xsl:text></script>
					</xsl:for-each>
				</xsl:if>
				
				<title><xsl:value-of select="$title" /></title>
			</head>
			<body>
				<xsl:if test="$topmenu != ''">
					<xsl:call-template name="topmenu" />
				</xsl:if>
				
				<!-- Form page -->
				<xsl:if test="$ISFORM = '1'">
					<div class="contentManage">
						<div class="boxTitle"><xsl:value-of select="$FORMTITLE" /></div>
						<div class="formdiv">
							<xsl:call-template name="content" />
						</div>
					</div>
				</xsl:if>
				
				<!-- Display page -->
				<xsl:if test="$ISFORM != '1'">
					<div class="content">
						<xsl:call-template name="content" />
					</div>
				</xsl:if>
				
				<div id="footer">
					Licensed under GPLv3 (<a href="http://evqueue.net">evqueue.net</a>)
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
	
	<xsl:template name="displayNotices">
		<xsl:if test="count(/page/notices/notice) > 0">
			<div id="notices">
				<xsl:for-each select="/page/notices/notice">
					<p>
						<xsl:value-of select="." />
					</p>
				</xsl:for-each>
			</div>
		</xsl:if>
	</xsl:template>
	
	<xsl:template name="topmenu">
		<ul class="topmenu">
			<li class="logo"><a href="{$SITE_BASE}index.php">evQueue</a></li>
			<li id="system-state">
				<xsl:if test="$topmenu='system-state'"><xsl:attribute name="class">selected</xsl:attribute></xsl:if>
				System state
			</li>
			<li id="settings">
				<xsl:if test="$topmenu='settings'"><xsl:attribute name="class">selected</xsl:attribute></xsl:if>
				Settings
			</li>
			<li id="notifications">
				<xsl:if test="$topmenu='notifications'"><xsl:attribute name="class">selected</xsl:attribute></xsl:if>
				Notifications
			</li>
			<li id="logging">
				<xsl:if test="$topmenu='logging'"><xsl:attribute name="class">selected</xsl:attribute></xsl:if>
				Logging
			</li>
			<xsl:choose>
				<xsl:when test="/page/session/workflow/@original-id = 'new'">
					<li><a style="color: #51d551;" href="{$SITE_BASE}manage-workflow-gui.php">Creating workflow</a></li>
				</xsl:when>
				<xsl:when test="count(/page/session/workflow/@original-id) > 0">
					<li><a style="color: #51d551;" href="{$SITE_BASE}manage-workflow-gui.php?workflow_id={/page/session/workflow/@original-id}">Editing workflow <xsl:value-of select="/page/session/workflow/@original-id" /></a></li>
				</xsl:when>
			</xsl:choose>
		</ul>
		<ul class="submenu" id="submenu-system-state">
			<xsl:if test="$topmenu!='system-state'"><xsl:attribute name="style">display:none;</xsl:attribute></xsl:if>
			<li><a href="{$SITE_BASE}index.php">Workflows instances</a></li>
			<li><a href="{$SITE_BASE}list-workflow-schedules.php?display=state">Scheduled workflows</a></li>
			<li><a href="{$SITE_BASE}system_state.php">Queues</a></li>
			<li><a href="{$SITE_BASE}system_statistics.php">Statistics</a></li>
		</ul>
		<xsl:if test="$PROFILE = 'ADMIN'">
			<ul class="submenu" id="submenu-settings">
				<xsl:if test="$topmenu!='settings'"><xsl:attribute name="style">display:none;</xsl:attribute></xsl:if>
				<li><a href="{$SITE_BASE}list-tasks.php">Tasks</a></li>
				<li><a href="{$SITE_BASE}list-workflows.php">Workflows</a></li>
				<li><a href="{$SITE_BASE}list-workflow-schedules.php?display=settings">Scheduled workflows</a></li>
				<li><a href="{$SITE_BASE}list-schedules.php">Retry Schedules</a></li>
				<li><a href="{$SITE_BASE}list-queues.php">Queues</a></li>
				<li><a href="{$SITE_BASE}list-users.php">Users</a></li>
				<li><a href="{$SITE_BASE}system_configuration.php">Running configuration</a></li>
			</ul>
			<ul class="submenu" id="submenu-notifications">
				<xsl:if test="$topmenu!='notifications'"><xsl:attribute name="style">display:none;</xsl:attribute></xsl:if>
				<li><a href="{$SITE_BASE}plugins/notifications/">Configure</a></li>
				<li><a href="{$SITE_BASE}plugins/notifications/plugins.php">Manage plugins</a></li>
			</ul>
			<ul class="submenu" id="submenu-logging">
				<xsl:if test="$topmenu!='logging'"><xsl:attribute name="style">display:none;</xsl:attribute></xsl:if>
				<li><a href="{$SITE_BASE}view-logs.php">Engine logs</a></li>
				<li><a href="{$SITE_BASE}logs/log.html">Interface logs</a></li>
			</ul>
		</xsl:if>
		
		<xsl:choose>
			<xsl:when test="count(/page/private/logged-in-user) > 0">
				<div id="userInfo">
					<span><xsl:value-of select="/page/private/logged-in-user/@login" /></span>
					<xsl:text>&#160;</xsl:text>
					<a href="{$SITE_BASE}manage-user.php?user_login={/page/private/logged-in-user/@login}" title="Edit">
						<img src="{$SITE_BASE}images/edit.png" />
					</a>
					<xsl:text>&#160;</xsl:text>
					<a href="{$SITE_BASE}auth.php?action=logout" title="Log out">
						<img src="{$SITE_BASE}images/logout.png" />
					</a>
				</div>
			</xsl:when>
		</xsl:choose>
	</xsl:template>

</xsl:stylesheet>