<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	
	<xsl:variable name="topmenu" select="'settings'" />
	
	<xsl:param name="ISFORM">1</xsl:param>
	<xsl:param name="FORMTITLE">
		<xsl:if test="not(/page/response-queue/queue/@id)">Create a new queue</xsl:if>
		<xsl:if test="/page/response-queue/queue/@id">Edit queue</xsl:if>
	</xsl:param>
	
	
	<xsl:variable name="javascript">
	</xsl:variable>

	<xsl:template name="content">
		<xsl:call-template name="displayErrors" />
		
		<form name="formQueue" id="formQueue" action="manage-queue.php" method="post">
			<input type="hidden" name="queue_id" value="{/page/response-queue/queue/@id}" />
			<label for="queue_name">Queue name:</label>
			<input type="text" name="queue_name" id="queue_name" value="{/page/post/@queue_name|/page/response-queue/queue/@name}" />
			<br />
			<label class="formLabel" for="queue_concurrency">Queue concurrency:</label>
			<input type="text" name="queue_concurrency" id="queue_concurrency" value="{/page/post/@queue_concurrency|/page/response-queue/queue/@concurrency}" />
			<br />
			<label class="formLabel" for="queue_scheduler">Queue scheduler:</label>
			<select name="queue_scheduler">
				<option value="default"><xsl:if test="/page/post/@queue_scheduler|/page/response-queue/queue/@scheduler = 'default'"><xsl:attribute name="selected">selected</xsl:attribute></xsl:if>default</option>
				<option value="fifo"><xsl:if test="(/page/post/@queue_scheduler|/page/response-queue/queue/@scheduler) = 'fifo'"><xsl:attribute name="selected">selected</xsl:attribute></xsl:if>fifo</option>
				<option value="prio"><xsl:if test="/page/post/@queue_scheduler|/page/response-queue/queue/@scheduler = 'prio'"><xsl:attribute name="selected">selected</xsl:attribute></xsl:if>prio</option>
			</select>
			<br />
			<input type="submit" name="submitFormQueue" id="submitFormQueue" class="submitFormButton submitFormButtonSmall" value="Submit" />
		</form>
    </xsl:template>
	
</xsl:stylesheet>
