<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">
	<xsl:import href="templates/workflow.xsl" />
	<xsl:import href="templates/main-template.xsl" />

	<xsl:variable name="topmenu" select="'system-state'" />
	<xsl:variable name="title" select="'Board'" />

	<xsl:variable name="css">
		<src>styles/workflow-instance.css</src>
	</xsl:variable>

	<xsl:variable name="javascript">
		<src>js/instance.js</src>
		<src>js/tags.js</src>
		<src>js/index.js</src>
	</xsl:variable>

	<xsl:template name="content">
		<div class="dialog" id="workflow-dialog">
			<ul>
			</ul>
			<div id="workflow-debug" class="hidden">
				Debug mode is used to clone an existing instance and restart it. Successful tasks will not be executed and their output will be kept.
				<br /><br />Loops and conditions that have already been evaluated will not be evaluated again.
				<br /><br />Error tasks will be restarted and their attributes will be reset.
				<br /><br />Modifications on the original workflow will not be taken into account as what is run is a clone of the previous instance.
				<br /><br />This mode is used for debugging tasks and workflows without launching each time your full treatment chain.
				<br /><br /><span class="faicon fa-step-forward">&#160;Relaunch this instance in debug mode</span>
			</div>
		</div>

		<div class="dialog" id="task-dialog">
			<ul>
			</ul>
		</div>

		<div id="workflow-dialogs"></div>

		<div id="workflow-stats-graph">
			<div class="chartwrapper">
				<div class="chart">
					<div class="chartcenter"></div>
				</div>
			</div>
		</div>
		
		<div class="dialog" id="tags-dialog">
			<ul>
				<li><a href="#instance-tags">Instance tags</a></li>
				<li><a href="#tags-management">Tags management</a></li>
			</ul>
			<div id="instance-tags" class="hidden">
				<div>
					<form>
						Add tag&#160;:&#160;<input id="tag_label" type="text" size="16" class="evq-autocomplete" data-type="tags" />&#160;<span class="faicon fa-check"></span>
					</form>
				</div>
				<br />
				<div class="tags-list"></div>
			</div>
			<div id="tags-management" class="hidden">
			</div>
		</div>

		<xsl:call-template name="workflow-launch" />


		<div id="executing-workflows">
			<div class="center">Loading executing workflows...</div>
		</div>
		
		<script src="https://unpkg.com/react@16/umd/react.development.js" crossorigin="crossorigin"></script>
		<script src="https://unpkg.com/react-dom@16/umd/react-dom.development.js" crossorigin="crossorigin"></script>
		<script src="js/react/app.js"></script>

		<br />

		<xsl:call-template name="filter" />

		<br />

		<div id="terminated-workflows-pannel" class="evq-autorefresh-filter" data-url="ajax/list-instances.php?status=terminated" data-interval="2">
			<div class="boxTitle">
				<span class="faicon fa-exclamation filter" title="Display only failed workflows"></span>
				<span class="title">Terminated workflows</span>
				<xsl:text>&#160;</xsl:text>
				<div id="TERMINATED-workflows-pages" class="evq-autorefresh-pannel pages"></div>
				<span class="faicon fa-refresh action evq-autorefresh-toggle"></span>
			</div>

			<div id="TERMINATED-workflows" class="workflow-list evq-autorefresh-pannel">
				<br /><div class="center">Loading...</div>
			</div>
		</div>
	</xsl:template>

	<xsl:template name="workflow-launch">
		<div id="workflow-launch" class="dialog tabs">
			<ul>
				<li><a href="#workflow-launch-tab-workflow">Workflow</a></li>
				<li><a href="#workflow-launch-tab-remote">Remote</a></li>
				<li><a href="#workflow-launch-tab-node">Node</a></li>
			</ul>
			<div id="workflow-launch-tab-workflow">
				<h2>
					Select workflow
					<span class="help faicon fa-question-circle" title="Select the workflow to launch.&#10;&#10;If the workflow needs parameters, you will be prompted for them.&#10;&#10;If needed, you can add an optional comment that will not be used by the engine."></span>
				</h2>
				<div class="formdiv" id="which_workflow">
					<form>
						<div>
							<label>Workflow</label>
							<select name="workflow_id" class="evq-autofill select2" data-type="workflows" data-valuetype="id"></select>
						</div>
						<div>
							<label>Comment</label>
							<input type="text" name="comment" />
						</div>
					</form>
				</div>
				<br /><button class="submit">Launch new instance</button>
			</div>
			<div id="workflow-launch-tab-remote">
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
				<br /><button class="submit">Launch new instance</button>
			</div>
			<div id="workflow-launch-tab-node">
				<h2>
					Cluster node
					<span class="help faicon fa-question-circle" title="If you are using evQueue in a clustered environement, specify here the node on which the workflow will be launched."></span>
				</h2>

				<div class="formdiv">
					<form>
						<div>
							<label>Node</label>
							<select name="node" class="evq-autofill" data-type="node"></select>
						</div>
					</form>
					<br /><button class="submit">Launch new instance</button>
				</div>
			</div>
		</div>
	</xsl:template>

	<xsl:template name="filter">
		<div id="searchformcontainer">
			<a onclick="$('#searchformcontainer .filter').toggle();" href="javascript:void(0)">Filters</a> : <span id="searchexplain">Showing all terminated workflows</span><span id="clearfilters" class="hidden faicon fa-remove" title="Clear filters"></span>

			<div class="formdiv filter hidden">
				<form id="searchform">
					<div>
						<label>Node</label>
						<select name="node">
							<option value="">All</option>
							<xsl:for-each select="/page/evqueue-nodes/node">
								<option value="{@name}"><xsl:value-of select="@name" /></option>
							</xsl:for-each>
						</select>
					</div>
					<div id="searchworkflow">
						<label>Workflow</label>
						<select name="wf_name" class="evq-autofill select2" data-type="workflows" data-valuetype="id"></select>
					</div>
					<div id="searchtag">
						<label>Tag</label>
						<select name="tagged" class="evq-autofill" data-type="tags"></select>
					</div>
					<div>
						<label>Launched between</label>
						Date&#160;:&#160;<input id="dt_inf" name="dt_inf" class="datepicker" />
						Hour&#160;:&#160;<input id="hr_inf" name="hr_inf" class="timepicker evq-autocomplete" data-type="time" />
						&#160;&#160;<b>and</b>&#160;&#160;
						Date&#160;:&#160;<input id="dt_sup" name="dt_sup" class="datepicker" />
						Hour&#160;:&#160;<input id="hr_sup" name="hr_sup" class="timepicker evq-autocomplete" data-type="time" />
					</div>
					<div>
						<label>Workflows that were running at</label>
						Date&#160;:&#160;<input id="dt_at" name="dt_at" class="datepicker" />
						Hour&#160;:&#160;<input id="hr_at" name="hr_at" class="timepicker evq-autocomplete" data-type="time" />
					</div>
				</form>
			</div>
		</div>
	</xsl:template>

</xsl:stylesheet>
