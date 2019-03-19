<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:output method="html" indent="no" omit-xml-declaration="yes" encoding="utf-8" doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" />

	<xsl:param name="css" select="''" />
	<xsl:param name="javascript" select="''" />
	<xsl:param name="SITE_BASE" select="''" />

	<xsl:param name="ISFORM" select="''" />
	<xsl:param name="FORMTITLE" select="''" />

	<xsl:param name="LOGIN" select="''" />
	
	<xsl:param name="FULLSCREEN" select="'no'" />

	<xsl:template match="/">
		<xsl:param name="title" select="'Workflow'" />
		<html>
			<head>
				<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />

				<!-- Load base CSS -->
				<link rel="stylesheet" type="text/css" href="{$SITE_BASE}styles/jquery/jquery-ui.min.css"/>
				<link rel="stylesheet" type="text/css" href="{$SITE_BASE}styles/jquery/select2.min.css"/>
				<link rel="stylesheet" type="text/css" href="{$SITE_BASE}styles/font-awesome.css"/>
				<link rel="stylesheet" type="text/css" href="{$SITE_BASE}styles/style.css"/>
				
				<!-- Load additional CSS -->
				<xsl:if test="$css != '' and exsl:node-set($css)/src">
					<xsl:for-each select="exsl:node-set($css)/src">
						<link rel="stylesheet" type="text/css" href="{$SITE_BASE}{.}"/>
					</xsl:for-each>
				</xsl:if>

				<script type="text/javascript">
					var site_base = '<xsl:value-of select="$SITE_BASE" />';
					var connected_user = '<xsl:value-of select="$LOGIN" />';
				</script>

				<!-- Load base javascript -->
				<script type="text/javascript" src="{$SITE_BASE}js/jquery/jquery-1.12.4.min.js" />
				<script type="text/javascript" src="{$SITE_BASE}js/jquery/jquery-ui.min.js" />
				<script type="text/javascript" src="{$SITE_BASE}js/jquery/select2.full.min.js" />
				
				<script type="text/javascript" src="{$SITE_BASE}js/forms.js" />
				<script type="text/javascript" src="{$SITE_BASE}js/global.js" />
				<script type="text/javascript" src="{$SITE_BASE}js/preferences.js" />

				<!-- Load additional javascript -->
				<xsl:if test="$javascript != '' and exsl:node-set($javascript)/src">
					<xsl:for-each select="exsl:node-set($javascript)/src">
						<script type="text/javascript" src="{$SITE_BASE}{.}"><xsl:text><![CDATA[]]></xsl:text></script>
					</xsl:for-each>
				</xsl:if>

				<title><xsl:value-of select="$title" /></title>
			</head>
			<body>
				<xsl:if test="$FULLSCREEN = 'no'">
					<xsl:if test="$topmenu != ''">
						<xsl:call-template name="topmenu" />
						<xsl:call-template name="user-preferences-editor" />
					</xsl:if>

					<div class="content">
						<xsl:call-template name="content" />
					</div>
				</xsl:if>

				<xsl:if test="$FULLSCREEN = 'yes'">
					<xsl:call-template name="content" />
				</xsl:if>
				
				<div id="footer">
					Licensed under GPLv3 (<a target="_blank" href="http://www.evqueue.net">evqueue.net</a>)
				</div>
			</body>
		</html>
	</xsl:template>


	<xsl:template name="displayErrors">
		<xsl:if test="count(/page/errors/error) > 0">
			<div class="error">
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
		<div class="topmenu"><a href="{$SITE_BASE}index.php"><img src="{$SITE_BASE}images/evQueue-small.svg" title="evQueue" /></a></div>
		<ul class="topmenu">
			<li class="logo"></li>
			<li id="system-state">
				<xsl:if test="$topmenu='system-state'"><xsl:attribute name="class">selected</xsl:attribute></xsl:if>
				<span class="faicon fa-desktop"></span>
				System state
			</li>
			<li id="settings">
				<xsl:if test="$topmenu='settings'"><xsl:attribute name="class">selected</xsl:attribute></xsl:if>
				<span class="faicon fa-cogs"></span>
				Settings
			</li>
			<li id="notifications">
				<xsl:if test="$topmenu='notifications'"><xsl:attribute name="class">selected</xsl:attribute></xsl:if>
				<span class="faicon fa-rss"></span>
				Notifications
			</li>
			<li id="statistics">
				<xsl:if test="$topmenu='statistics'"><xsl:attribute name="class">selected</xsl:attribute></xsl:if>
				<span class="faicon fa-area-chart"></span>
				Statistics
			</li>
			<li id="logging">
				<xsl:if test="$topmenu='logging'"><xsl:attribute name="class">selected</xsl:attribute></xsl:if>
				<span class="faicon fa-file-text-o"></span>
				Logging
			</li>
			<span id="message"></span>
		</ul>
		<ul class="submenu" id="submenu-system-state">
			<xsl:if test="$topmenu!='system-state'"><xsl:attribute name="style">display:none;</xsl:attribute></xsl:if>
			<li><a href="{$SITE_BASE}index.php"><span class="faicon fa-cubes"></span>Workflows instances</a></li>
			<li><a href="{$SITE_BASE}system_state.php"><span class="faicon fa-hand-stop-o"></span>Queues</a></li>
			<li><a href="{$SITE_BASE}system_configuration.php"><span class="faicon fa-terminal"></span>Running configuration</a></li>
		</ul>
		<xsl:if test="$PROFILE = 'ADMIN'">
			<ul class="submenu" id="submenu-settings">
				<xsl:if test="$topmenu!='settings'"><xsl:attribute name="style">display:none;</xsl:attribute></xsl:if>
				<li><a href="{$SITE_BASE}workflow.php"><span class="faicon fa-cubes"></span>Workflows</a></li>
				<li><a href="{$SITE_BASE}workflow-schedules.php"><span class="faicon fa-calendar"></span>Scheduled workflows</a></li>
				<li><a href="{$SITE_BASE}schedule.php"><span class="faicon fa-clock-o"></span>Retry Schedules</a></li>
				<li><a href="{$SITE_BASE}queue.php"><span class="faicon fa-hand-stop-o"></span>Queues</a></li>
				<li><a href="{$SITE_BASE}user.php"><span class="faicon fa-user-o"></span>Users</a></li>
			</ul>
			<ul class="submenu" id="submenu-notifications">
				<xsl:if test="$topmenu!='notifications'"><xsl:attribute name="style">display:none;</xsl:attribute></xsl:if>
				<li><a href="{$SITE_BASE}notification.php"><span class="faicon fa-rss"></span>Configure</a></li>
				<li><a href="{$SITE_BASE}notification-types.php"><span class="faicon fa-plug"></span>Manage plugins</a></li>
			</ul>
			<ul class="submenu" id="submenu-statistics">
				<xsl:if test="$topmenu!='statistics'"><xsl:attribute name="style">display:none;</xsl:attribute></xsl:if>
				<li><a href="{$SITE_BASE}instances-statistics.php"><span class="faicon fa-line-chart"></span>Instances</a></li>
				<li><a href="{$SITE_BASE}system-statistics.php"><span class="faicon fa-percent"></span>Global</a></li>
			</ul>
			<ul class="submenu" id="submenu-logging">
				<xsl:if test="$topmenu!='logging'"><xsl:attribute name="style">display:none;</xsl:attribute></xsl:if>
				<li><a href="{$SITE_BASE}logs.php"><span class="faicon fa-file-text-o"></span>Engine logs</a></li>
			</ul>
		</xsl:if>

		<xsl:choose>
			<xsl:when test="$LOGIN != ''">
				<div id="userInfo">
					<span><xsl:value-of select="$LOGIN" /></span>
					<xsl:text>&#160;</xsl:text>
					<span class="faicon fa-pencil" title="My preferences"></span>
					<xsl:text>&#160;</xsl:text>
					<a href="{$SITE_BASE}auth.php?action=logout" title="Log out">
						<span class="faicon fa-power-off"></span>
					</a>
				</div>
			</xsl:when>
		</xsl:choose>
	</xsl:template>
	
	<xsl:template name="user-preferences-editor">
		<div id="user-preferences-editor" class="dialog formdiv">
			<h2>
				My preferences
				<span class="help faicon fa-question-circle" title="Preferred node is the default node used when launching new workflows"></span>
			</h2>
			<form>
				<div>
					<label>Change password</label>
					<input type="password" name="password" />
				</div>
				<div>
					<label>Confirm password</label>
					<input type="password" name="password2" class="nosubmit" />
				</div>
				<div>
					<label>Preferred node</label>
					<select name="preferred_node" class="evq-autofill" data-type="node"></select>
				</div>
			</form>
			<button class="submit">Save</button>
		</div>
	</xsl:template>

</xsl:stylesheet>
