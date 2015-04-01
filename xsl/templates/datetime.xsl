<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">

	<xsl:template name="displayDateAndTime">
		<xsl:param name="datetime_start" select="''" />
		<xsl:param name="datetime_end" select="''" />
		
		<span class="date">
			<xsl:choose>
				<xsl:when test="$datetime_start != ''">
					<xsl:call-template name="display-date">
						<xsl:with-param name="timestamp" select="$datetime_start" />
					</xsl:call-template>
				</xsl:when>
				<xsl:otherwise>
					<xsl:call-template name="display-date">
						<xsl:with-param name="timestamp" select="$datetime_end" />
					</xsl:call-template>
				</xsl:otherwise>
			</xsl:choose>
		</span>
		<xsl:text>&#160;</xsl:text>
		<span class="time">
			<xsl:choose>
				<xsl:when test="$datetime_start != ''">
					<xsl:call-template name="startTimes">
						<xsl:with-param name="start" select="$datetime_start" />
					</xsl:call-template>
				</xsl:when>
				<xsl:otherwise>
					<xsl:call-template name="endTimes">
						<xsl:with-param name="end" select="$datetime_end" />
					</xsl:call-template>
				</xsl:otherwise>
			</xsl:choose>
		</span>
	</xsl:template>
	
	<xsl:template name="display-date">
		<xsl:param name="timestamp" />
		<xsl:value-of select="substring($timestamp,1,10)" />
	</xsl:template>
	
	<xsl:template name="display-time">
		<xsl:param name="timestamp" />
		<xsl:value-of select="substring($timestamp,12,8)" />
	</xsl:template>
	
	<xsl:template name="startEndTimes">
		<xsl:param name="start" />
		<xsl:param name="end" />
		
		<xsl:variable name="theEnd">
			<xsl:choose>
				<xsl:when test="$end = '0000-00-00 00:00:00'">
					<xsl:text>?</xsl:text>
				</xsl:when>
				<xsl:when test="substring($start,1,10) = substring($end,1,10)">
					<xsl:value-of select="substring($end,12,8)" />
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="substring($end,1,16)" />
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		
		<xsl:call-template name="display-time">
			<xsl:with-param name="timestamp" select="$start" />
		</xsl:call-template>
		<xsl:text> - </xsl:text>
		<xsl:value-of select="$theEnd" />
		
	</xsl:template>
	
	<xsl:template name="startTimes">
		<xsl:param name="start" />
		<xsl:call-template name="display-time">
			<xsl:with-param name="timestamp" select="$start" />
		</xsl:call-template>
	</xsl:template>	
	
	<xsl:template name="endTimes">
		<xsl:param name="end" />
		
		<xsl:variable name="theEnd">
			<xsl:choose>
				<xsl:when test="$end = '0000-00-00 00:00:00'">
					<xsl:text>?</xsl:text>
				</xsl:when>
				<xsl:otherwise>
					<xsl:call-template name="display-time">
						<xsl:with-param name="timestamp" select="$end" />
					</xsl:call-template>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		
		<xsl:value-of select="$theEnd" />
		
	</xsl:template>

</xsl:stylesheet>