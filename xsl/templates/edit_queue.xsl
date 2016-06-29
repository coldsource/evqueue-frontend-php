<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:output method="xml"/>
	
	<xsl:template name="form_queue">
	
		<form name="formQueue" id="formQueue" action="manage-queue.php" method="post">
			<input type="hidden" name="queue_id" value="{/page/queue/@id}" />
			<label class="formLabel" for="queue_name">Queue name:</label>
			<input type="text" name="queue_name" id="queue_name" value="{/page/queue/queue_name}" />
			<br />
			<label class="formLabel" for="queue_concurrency">Queue concurrency:</label>
			<input type="text" name="queue_concurrency" id="queue_concurrency" value="{/page/queue/queue_concurrency}" />
			<br />
			<label class="formLabel" for="queue_scheduler">Queue scheduler:</label>
			<select name="queue_scheduler">
				<option value="default"><xsl:if test="/page/queue/queue_scheduler = 'default'"><xsl:attribute name="selected">selected</xsl:attribute></xsl:if>default</option>
				<option value="fifo"><xsl:if test="/page/queue/queue_scheduler = 'fifo'"><xsl:attribute name="selected">selected</xsl:attribute></xsl:if>fifo</option>
				<option value="prio"><xsl:if test="/page/queue/queue_scheduler = 'prio'"><xsl:attribute name="selected">selected</xsl:attribute></xsl:if>prio</option>
			</select>
			<br />
			<input type="submit" name="submitFormQueue" id="submitFormQueue" class="submitFormButton submitFormButtonSmall" value="Submit" />
		</form>	
	</xsl:template>
	
	
</xsl:stylesheet>
