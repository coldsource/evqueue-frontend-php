<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:output method="xml"/>

	<xsl:template name="git_commit_dialog">
		<xsl:param name="group" select="'workflow'" />
		<div id="dialog-commit" title="Commit" style="display:none;">
			<form method="POST">
				<input type="hidden" name="commit-name" />
				<input type="hidden" name="commit-force" />
				<input type="hidden" name="commit-id" />
				<input type="text" placeholder="Commit log" name="commit-log" class="w100"/><br />
				<xsl:if test="$group = 'workflow'">
					<label><input type="checkbox" name="commit-tasks"/>&#160;Also commit depending tasks</label><br />
				</xsl:if>
				<input type="submit" class="submitFormButton" />
			</form>
		</div>
	</xsl:template>

</xsl:stylesheet>
