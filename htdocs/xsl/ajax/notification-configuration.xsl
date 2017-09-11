<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:output method="html"/>

	<xsl:template match="/">
		<div class="formdiv">
			<xsl:if test="/page/@type = 'plugin'">
				<h2>
					Plugin configuration
					<xsl:if test="/page/response/plugin/configuration/plugin/@help">
						<span class="help faicon fa-question-circle" title="{/page/response/plugin/configuration/plugin/@help}"></span>
					</xsl:if>
				</h2>
				
			</xsl:if>
			<xsl:if test="/page/@type = 'notification'">
				<h2>
					Notification configuration
					<xsl:if test="/page/response/plugin/configuration/notification/@help">
						<span class="help faicon fa-question-circle" title="{/page/response/plugin/configuration/notification/@help}"></span>
					</xsl:if>
				</h2>
			</xsl:if>
			<form>
				<xsl:if test="/page/@type = 'plugin'">
					<xsl:apply-templates select="/page/response/plugin/configuration/plugin" />
				</xsl:if>
				<xsl:if test="/page/@type = 'notification'">
					<div>
						<label>Name</label>
						<input type="text" name="name" />
					</div>
					<xsl:apply-templates select="/page/response/plugin/configuration/notification" />
				</xsl:if>
			</form>
			
			<button class="submit">Save configuration</button>
		</div>
	</xsl:template>
	
	<xsl:template match="field">
		<div>
			<label><xsl:value-of select="@label" /></label>
			<xsl:if test="@type = 'text'">
				<input type="text" name="{@name}" placeholder="{@placeholder}" />
			</xsl:if>
			<xsl:if test="@type = 'textarea'">
				<textarea name="{@name}" placeholder="{@placeholder}"><xsl:comment /></textarea>
			</xsl:if>
			<xsl:if test="@type = 'select'">
				<select name="{@name}">
					<xsl:for-each select="option">
						<option value="{@value}"><xsl:value-of select="." /></option>
					</xsl:for-each>
				</select>
			</xsl:if>
		</div>
	</xsl:template>

</xsl:stylesheet>
