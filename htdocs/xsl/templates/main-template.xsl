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
				<link rel="stylesheet" type="text/css" href="{$SITE_BASE}styles/font-awesome.css"/>
				<link rel="stylesheet" type="text/css" href="{$SITE_BASE}styles/style.css"/>
				<link rel="stylesheet" type="text/css" href="{$SITE_BASE}styles/ui.scss"/>
				
				<!-- Load additional CSS -->
				<xsl:if test="$css != '' and exsl:node-set($css)/src">
					<xsl:for-each select="exsl:node-set($css)/src">
						<link rel="stylesheet" type="text/css" href="{$SITE_BASE}{.}"/>
					</xsl:for-each>
				</xsl:if>

				<title><xsl:value-of select="$title" /></title>
			</head>
			<body>
				<div style="text-align: center; margin: 5rem;" id="pre-content">
					Loading interface...
					<br /><br />
					<img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+PHN2ZyB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjAiIHdpZHRoPSI2NHB4IiBoZWlnaHQ9IjY0cHgiIHZpZXdCb3g9IjAgMCAxMjggMTI4IiB4bWw6c3BhY2U9InByZXNlcnZlIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRkZGRkZGIiAvPjxnPjxjaXJjbGUgY3g9IjE2IiBjeT0iNjQiIHI9IjE2IiBmaWxsPSIjNDk5M2NlIiBmaWxsLW9wYWNpdHk9IjEiLz48Y2lyY2xlIGN4PSIxNiIgY3k9IjY0IiByPSIxNC4zNDQiIGZpbGw9IiM0OTkzY2UiIGZpbGwtb3BhY2l0eT0iMSIgdHJhbnNmb3JtPSJyb3RhdGUoNDUgNjQgNjQpIi8+PGNpcmNsZSBjeD0iMTYiIGN5PSI2NCIgcj0iMTIuNTMxIiBmaWxsPSIjNDk5M2NlIiBmaWxsLW9wYWNpdHk9IjEiIHRyYW5zZm9ybT0icm90YXRlKDkwIDY0IDY0KSIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iNjQiIHI9IjEwLjc1IiBmaWxsPSIjNDk5M2NlIiBmaWxsLW9wYWNpdHk9IjEiIHRyYW5zZm9ybT0icm90YXRlKDEzNSA2NCA2NCkiLz48Y2lyY2xlIGN4PSIxNiIgY3k9IjY0IiByPSIxMC4wNjMiIGZpbGw9IiM0OTkzY2UiIGZpbGwtb3BhY2l0eT0iMSIgdHJhbnNmb3JtPSJyb3RhdGUoMTgwIDY0IDY0KSIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iNjQiIHI9IjguMDYzIiBmaWxsPSIjNDk5M2NlIiBmaWxsLW9wYWNpdHk9IjEiIHRyYW5zZm9ybT0icm90YXRlKDIyNSA2NCA2NCkiLz48Y2lyY2xlIGN4PSIxNiIgY3k9IjY0IiByPSI2LjQzOCIgZmlsbD0iIzQ5OTNjZSIgZmlsbC1vcGFjaXR5PSIxIiB0cmFuc2Zvcm09InJvdGF0ZSgyNzAgNjQgNjQpIi8+PGNpcmNsZSBjeD0iMTYiIGN5PSI2NCIgcj0iNS4zNzUiIGZpbGw9IiM0OTkzY2UiIGZpbGwtb3BhY2l0eT0iMSIgdHJhbnNmb3JtPSJyb3RhdGUoMzE1IDY0IDY0KSIvPjxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSIgdHlwZT0icm90YXRlIiB2YWx1ZXM9IjAgNjQgNjQ7MzE1IDY0IDY0OzI3MCA2NCA2NDsyMjUgNjQgNjQ7MTgwIDY0IDY0OzEzNSA2NCA2NDs5MCA2NCA2NDs0NSA2NCA2NCIgY2FsY01vZGU9ImRpc2NyZXRlIiBkdXI9IjcyMG1zIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSI+PC9hbmltYXRlVHJhbnNmb3JtPjwvZz48L3N2Zz4=" />
				</div>
				
				<div id="content">
					<script type="module" src="/js/react/dist/components/base/app.js"></script>
				</div>
				
				<div id="footer">
					Licensed under GPLv3 (<a target="_blank" href="http://www.evqueue.net">evqueue.net</a>)
				</div>
				
				<script src="https://unpkg.com/react@16/umd/react.development.js" crossorigin="crossorigin"></script>
				<script src="https://unpkg.com/react-dom@16/umd/react-dom.development.js" crossorigin="crossorigin"></script>
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
