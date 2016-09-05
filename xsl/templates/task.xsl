<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:import href="../templates/dropdown_utils.xsl" />
	<xsl:template name="taskFormInputs">
		<input type="hidden" name="id" value="{/page/get/@task_id}" />
		<label class="formLabel" for="name" >Task name</label>
		<input type="text" name="name" id="name" value="{/page/post/@name | /page/task/task/@name}" />
		<br />
		<label class="formLabel" for="binary">Task binary</label>
		<input type="text" name="binary" id="binary" value="{/page/post/@binary | /page/task/task/@binary}" placeholder="Absolute path to your script on the host machine" class="filenameInput" />
		<br />
		<label class="formLabel" for="group">Task group</label>
		<input type="text" name="group" id="group" value="{/page/post/@group | /page/task/task/@group}" />
		<br />
		<label class="formLabel" for="wd">Task working directory</label>
		<input type="text" name="wd" id="wd" value="{/page/post/@wd | /page/task/task/@wd}" />
		<br />
		<label class="formLabel" for="parameters_mode">Parameters mode</label>
		<select name="parameters_mode" id="parameters_mode">
			<xsl:call-template name="getSelectedItem">
			<xsl:with-param name="default" select="/page/get/@parameters_mode | /page/post/@parameters_mode | /page/task/task/@parameters_mode" />
			<xsl:with-param name="condition" select="document('../data/task_parameters_mode.xml')/task_parameters_modes/task_parameters_mode" />
			</xsl:call-template>
		</select>				
		<br />
		<label class="formLabel" for="output_method">Output type</label>
		<select name="output_method" id="output_method">
			<xsl:call-template name="getSelectedItem">
			<xsl:with-param name="default" select="/page/post/@output_method | /page/task/task/@output_method" />
			<xsl:with-param name="condition" select="document('../data/task_output_method.xml')/task_output_methods/task_output_method" />
			</xsl:call-template>
		</select>				
		<br />
		
		<label class="formLabel" for="user">Task user</label>
		<input type="text" name="user" id="user" value="{/page/post/@user | /page/task/task/@user}" />
		<br />

		<label class="formLabel" for="host">Task host</label>
		<input type="text" name="host" id="host" value="{/page/post/@host | /page/task/task/@host}" />
		<br />
		
		<label class="formLabel" for="use_agent">Use evqueue agent</label>
		<input type="checkbox" name="use_agent" id="use_agent" value="yes">
			<xsl:if test="/page/post/@use_agent = 'yes' or (/page/task/task/@use_agent = 1 and count(/page/post/@use_agent) = 0)">
				<xsl:attribute name="checked">checked</xsl:attribute>
			</xsl:if>
		</input>
		<br />
		
		<label class="formLabel" for="merge_stderr">Merge stderr with stdout</label>
		<input type="checkbox" name="merge_stderr" id="merge_stderr" value="yes">
			<xsl:if test="/page/post/@merge_stderr = 'yes' or (/page/task/task/@merge_stderr = 1 and count(/page/post/@merge_stderr) = 0)">
				<xsl:attribute name="checked">checked</xsl:attribute>
			</xsl:if>
		</input>
		<br />
	</xsl:template>
	
</xsl:stylesheet>
