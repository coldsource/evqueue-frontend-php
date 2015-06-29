<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="../ajax/notification-type.xsl" />
	
	<!-- EDIT -->
	<xsl:template name="parameters-edit">
		<table>
			<tr>
				<td colspan="4">
					<input type="hidden" name="type_notif" value="email"/>
					<label class="formLabel"><i>From:</i> field</label>
					<input type="text" name="email_from" value="{/page/notification-type/email}" placeholder="E-mail From" /> <br/>
					<label class="formLabel">Command to use:</label>
					<input type="text" name="commande_mail" value="{/page/notification-type/mail-command}" placeholder="Sending Control Mail" /><br/>
					<label class="formLabel">SMTP config:</label>
					<input type="text" name="smtp" value="{page/notification-type/smtp}" placeholder="SMTP" />
				</td>
				<td>
					<img class="action" src="{$RELPATH}images/ok.png" onclick="saveNotifType($(this));" title="Save" />
					<img class="action" src="{$RELPATH}images/cancel.png" onclick="window.location.reload();" title="Cancel" />
				</td>
			</tr>
		</table>
	</xsl:template>
	
</xsl:stylesheet>