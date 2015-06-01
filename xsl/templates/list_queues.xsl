<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:output method="xml"/>
	
	<xsl:template name="list_queues">
		
		<div class="boxTitle">
			<span class="title">Queues list (<xsl:value-of select="count(/page/queues/queue)" /> active queues, total concurrency is <xsl:value-of select="sum(/page/queues/queue/queue_concurrency)" />)</span>
			<a href="manage-queue.php"><img class="action" src="images/plus3.png" title="Add new queue" /></a>
		</div>
		<table>
			<tr>
				<th style="width:40px;">Id</th>
				<th>Name</th>
				<th style="width:50px;">Concurrency</th>
				<th class="thActions">Actions</th>
			</tr>
			
			<xsl:for-each select="/page/queues/queue">
				<tr class="evenOdd">
					<td class="center">
						<xsl:value-of select="@id" />
					</td>
					<td>
						<xsl:value-of select="queue_name" />
					</td>
					<td class="center">
						<xsl:value-of select="queue_concurrency" />
					</td>
					<td class="tdActions">
						<a href="manage-queue.php?queue_id={@id}">
							<img src="images/edit.gif"  />
						</a>
						<xsl:text>&#160;</xsl:text>
						<img src="images/delete.gif" onclick="deleteQueue({@id})" class="pointer" />
					</td>
				</tr>
			</xsl:for-each>
		</table>
	</xsl:template>
	
	
	<xsl:template name="queues-select">
		<xsl:param name="selected" select="''" />
		
		<select name="queue_name">
			<optgroup label="Queue name">Queue name</optgroup>
			<xsl:for-each select="/page/queues/queue">
				<option value="{queue_name}">
					<xsl:if test="queue_name = 'default'">
						<xsl:attribute name="selected">selected</xsl:attribute>
					</xsl:if>
					<xsl:value-of select="queue_name" /> (<xsl:value-of select="queue_concurrency" />)
				</option>
			</xsl:for-each>
		</select>
	</xsl:template>
	
</xsl:stylesheet>