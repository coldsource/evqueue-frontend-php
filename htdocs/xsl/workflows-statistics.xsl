<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:exsl="http://exslt.org/common" xmlns:php="http://php.net/xsl" exclude-result-prefixes="exsl php" >
	<xsl:import href="templates/main-template.xsl" />
	<xsl:import href="templates/workflow.xsl" />
	
	<xsl:variable name="topmenu" select="'statistics'" />
	<xsl:variable name="javascript" />
	
	<xsl:key name="groups" match="/page/workflows/workflow/@group" use="." />
	
	<xsl:template name="content">
		
		<style type="text/css">
			ul {
				list-decoration: none;
				padding: 0;
			}
			li {
				display: inline-block;
				margin: 0 0.5em;
			}
			span.match {
				background-color: #f1c40f;
			}
		</style>
		
		<script type="text/javascript">
			
			$(document).ready( function () {
				$('input[name=search]').focus().trigger('keyup');
			});
			
			// Search within workflow names, tasks, queues and retry schedules
			$(document).delegate( 'input[name=search]', 'keyup', function (event) {
				var search = $(this).val();
				$('.hidden').removeClass('hidden');
				$('.searchable:has(.match)').each( function () { $(this).text($(this).text()); });
				
				if (search.length == 0)
					return;
				
				var re = new RegExp(search);
				$('.searchable').each( function () {
					if (!re.test($(this).text()))
						return;
					
					var text = $(this).text();
					$(this).html( text.replace(search,'<span class="match">'+search+'</span>') );
				});
				
				// show hide workflows depending on whether some object within them matches the user search
				$('tr.evenOdd').each( function () {
					if ($(this).find('.match').length == 0)
						$(this).addClass('hidden');
				});
				
				// show/hide workflow groups
				$('tr.group').each( function () {
					if ($(this).nextUntil('.group,.groupspace','tr.evenOdd:not(.hidden)').length == 0)
						$(this).add($(this).prev('.groupspace')).addClass('hidden');
				});
			});
		</script>
		
		<div>
			<div style="display: flex; justify-content: center; align-items: center; margin-bottom: 2em;">
				<input name="search" value="{/page/get/@search}" style="width: 80%; max-width: 400px; text-align: center;" placeholder="Global Search" autocomplete="off" />
			</div>
			<div class="boxTitle">
				<span class="title">Workflows Statistics</span>
			</div>
			<table>
				<tr>
					<th style="width:200px;">Name</th>
					<th>Tasks</th>
					<th>Queues</th>
					<th>Retry Schedules</th>
				</tr>

				<xsl:for-each select="/page/workflows/workflow/@group[generate-id(.) = generate-id(key('groups', .))]">
					<xsl:sort select="." />
					<xsl:variable name="groupName" select="." />

					<xsl:if test="position() != 1">
						<tr class="groupspace"><td></td></tr>
					</xsl:if>
					<tr class="group">
						<td colspan="5">
							<xsl:choose>
								<xsl:when test="$groupName != ''">
									<xsl:value-of select="$groupName" />
								</xsl:when>
								<xsl:otherwise>
									No group
								</xsl:otherwise>
							</xsl:choose>
						</td>
					</tr>

					<xsl:for-each select="/page/workflows/workflow[@group = $groupName]">
						
						<tr class="evenOdd" data-id="{@id}" data-name="{@name}">
							<td>
								<span>
									<a href="workflow-ui.php?workflow_id={@id}" class="faicon fa-edit" title="Edit workflow"></a>
								</span>
								<xsl:text>&#160;</xsl:text>
								<span class="searchable">
									<xsl:value-of select="@name" />
								</span>
							</td>
							<td>
								<ul>
									<xsl:variable name="tasks">
										<xsl:for-each select=".//task">
											<xsl:sort select="php:function('taskPart',string(@path),'FILENAME')" />
											<filename><xsl:value-of select="php:function('taskPart',string(@path),'FILENAME')" /></filename>
										</xsl:for-each>
									</xsl:variable>
									
									<xsl:for-each select="exsl:node-set($tasks)/filename">
										<xsl:if test="not(. = preceding-sibling::filename)">
											<li class="searchable">
												<xsl:variable name="nbtasks" select="count(following-sibling::filename[.=current()])+1" />
												<xsl:value-of select="." />
												<xsl:if test="$nbtasks > 1">
													(<xsl:value-of select="$nbtasks" />)
												</xsl:if>
											</li>
										</xsl:if>
									</xsl:for-each>
								</ul>
							</td>
							<td>
								<ul>
									<xsl:variable name="queues">
										<xsl:for-each select=".//task[@queue != '']">
											<xsl:sort select="@queue" />
											<queue><xsl:value-of select="@queue" /></queue>
										</xsl:for-each>
									</xsl:variable>
									
									<xsl:for-each select="exsl:node-set($queues)/queue">
										<xsl:if test="not(. = preceding-sibling::queue)">
											<li class="searchable">
												<xsl:variable name="nbqueues" select="count(following-sibling::queue[.=current()])+1" />
												<xsl:value-of select="." />
												<xsl:if test="$nbqueues > 1">
													(<xsl:value-of select="$nbqueues" />)
												</xsl:if>
											</li>
										</xsl:if>
									</xsl:for-each>
								</ul>
							</td>
							<td>
								<ul>
									<xsl:variable name="retryschedules">
										<xsl:for-each select=".//task[@retry_schedule != '']">
											<xsl:sort select="@retry_schedule" />
											<retry_schedule><xsl:value-of select="@retry_schedule" /></retry_schedule>
										</xsl:for-each>
									</xsl:variable>
									
									<xsl:for-each select="exsl:node-set($retryschedules)/retry_schedule">
										<xsl:if test="not(. = preceding-sibling::retry_schedule)">
											<li class="searchable">
												<xsl:variable name="nbretryschedules" select="count(following-sibling::retry_schedule[.=current()])+1" />
												<xsl:value-of select="." />
												<xsl:if test="$nbretryschedules > 1">
													(<xsl:value-of select="$nbretryschedules" />)
												</xsl:if>
											</li>
										</xsl:if>
									</xsl:for-each>
								</ul>
							</td>
						</tr>
					</xsl:for-each>
				</xsl:for-each>
			</table>
		</div>
		
	</xsl:template>

</xsl:stylesheet>
