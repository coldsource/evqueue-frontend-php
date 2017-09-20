<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	<xsl:import href="templates/git.xsl" />

	<xsl:variable name="topmenu" select="'settings'" />

	<xsl:variable name="javascript">
		<src>js/workflow-schedules.js</src>
	</xsl:variable>

   <xsl:template name="content">
		<div id="list-workflow-schedules"></div>
		
		<xsl:call-template name="wfs-editor" />
	</xsl:template>
	
	<xsl:template name="wfs-editor">
		<style type="text/css">
			input[type=radio] {
				margin-top:-2px;
				vertical-align:middle;
			}
		</style>
		
		<div id="wfs-editor" class="tabs dialog" data-width="900" data-height="650">
			<ul>
				<li><a href="#tab-general">General</a></li>
				<li><a href="#tab-remote">Remote</a></li>
				<li><a href="#tab-node">Node</a></li>
			</ul>
			<div id="tab-general">
				<h2>
					General properties
					<span class="help faicon fa-question-circle" title="A scheduled workflow is the equivalent of a cron job. You can launch an existing workflow or a simple command line script (though a workflow will be created).&#10;&#10;The 'Daily' configuration is used to launch the task once a day. the 'Custom' mode is for more complex schedules, like in cron.&#10;&#10;If the workflow fails, you can choose to suspend the planification (On error: suspend), or continue normaly with the next planified date (On error: continue)."></span>
				</h2>
				
				<fieldset>
					<legend><b>What&#160;:&#160;</b>
						<label><input type="radio" name="what" value="workflow" checked="checked" />Workflow</label>
						<xsl:text> </xsl:text>
						<label><input type="radio" name="what" value="script" />Script</label>
					</legend>
					<div class="formdiv" id="what_workflow">
						<form>
							<div>
								<label>Workflow</label>
								<select name="workflow_id" class="evq-autofill select2" data-type="workflows" data-valuetype="id"></select>
							</div>
						</form>
					</div>
					<div class="formdiv hidden" id="what_script">
						<form class="nosubmit">
							<input type="hidden" name="workflow_id" />
							<div>
								<label>Schedule name</label>
								<input type="text" name="workflow_name" />
							</div>
							<div>
								<label>Schedule group</label>
								<input type="text" name="workflow_group" class="evq-autocomplete" data-type="workflowgroup" />
							</div>
							<div>
								<label>Script path</label>
								<input type="text" name="script" class="filenameInput" />
							</div>
						</form>
					</div>
				</fieldset>
				
				<br />
				
				<fieldset>
					<legend><b>When&#160;:&#160;</b>
						<label><input type="radio" name="when" value="Daily" checked="checked" />Daily</label>
						<xsl:text> </xsl:text>
						<label><input type="radio" name="when" value="Custom" />Custom</label>
					</legend>
					<div class="formdiv" id="when_daily">
						<form>
							<input type='hidden' name='schedule' />
							
							<div>
								<label>Every day at</label>
								<input name="time" class="evq-autocomplete nosubmit" data-type="time" />
							</div>
						</form>
					</div>
					<div class="formdiv hidden" id="when_custom">
						<form class="nosubmit">
							<input type='hidden' name='schedule' />
							
							<xsl:for-each select="/page/units/unit">
								<div>
									<label><xsl:value-of select="@label" /></label>
									<select class="custom-schedule-select select2 nosubmit" name="{@input_name}" multiple="multiple">
										<option value="any" selected="selected">any</option>
										<xsl:for-each select="value">
											<option value="{@index}"><xsl:value-of select="@label" /></option>
										</xsl:for-each>
									</select>
								</div>
							</xsl:for-each>
						</form>
					</div>
				</fieldset>
				
				<br />
				
				<fieldset>
					<legend><b>Properties</b></legend>
					<div class="formdiv">
						<form>
							<div>
								<label>On error</label>
								<select name="onfailure">
									<option value="SUSPEND">Suspend</option>
									<option value="CONTINUE">Continue</option>
								</select>
							</div>
							<div>
								<label>Comment</label>
								<input name="comment" />
							</div>
							
							<select name="active" class="hidden"><option value="1">yes</option><option value="0">no</option></select>
						</form>
					</div>
				</fieldset>

				<br /><button class="submit">Save</button>
			</div>
			
			<div id="tab-remote">
				<h2>
					Remote execution
					<span class="help faicon fa-question-circle" title="The workflow or task can be launched through SSH on a distant machine. Enter the user and host used for SSH connection."></span>
				</h2>
				
				<div class="formdiv">
					<form>
						<div>
							<label>User</label>
							<input name="user" />
						</div>
						<div>
							<label>Host</label>
							<input name="host" />
						</div>
					</form>
				</div>
				
				<button class="submit">Save</button>
			</div>
			
			<div id="tab-node">
				<h2>
					Cluster node
					<span class="help faicon fa-question-circle" title="If you are using evQueue in a clustered environement, specify here the node on which the workflow will be launched.&#10;&#10;Two special nodes can be used. 'All' will launch the instance on all clustered nodes. 'Any' will launch the instance on a node elected amongst the online nodes, thus guaranteeing high availability."></span>
				</h2>
				
				<div class="formdiv">
					<form>
						<div>
							<label>Node</label>
							<select name="node" class="evq-autofill" data-type="node" data-special-nodes="on"></select>
						</div>
					</form>
				</div>
				
				<button class="submit">Save</button>
			</div>
		
		</div>
	</xsl:template>

</xsl:stylesheet>
