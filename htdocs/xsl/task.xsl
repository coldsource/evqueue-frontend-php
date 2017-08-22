<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	<xsl:import href="templates/git.xsl" />

	<xsl:variable name="topmenu" select="'settings'" />

	<xsl:variable name="javascript">
		<src>js/task.js</src>
	</xsl:variable>

   <xsl:template name="content">
		<div id="list-tasks"></div>
		
		<xsl:call-template name="tpltask-editor" />
	</xsl:template>
	
	<xsl:template name="tpltask-editor">
		<div id="tpltask-editor" class="tabs dialog">
			<ul>
				<li><a href="#tab-general">General</a></li>
				<li><a href="#tab-io">Input / Output</a></li>
				<li><a href="#tab-remote">Remote execution</a></li>
			</ul>
			<div id="tab-general" class="formdiv">
				<h2>
					Task description
					<span class="help faicon fa-question-circle" title="Here you can find the basic description of the task. Only the name and binary path are required but you are strongly encouraged to use group and description for better comprehension in interface.&#10;&#10;Binary path can be absolute or relative, in which case it is resolved from the evQueue envine tasks directory."></span>
				</h2>
				<form>
					<div>
						<label>Task name</label>
						<input type="text" name="name" />
					</div>
					<div>
						<label>Task binary</label>
						<input type="text" name="binary" class="filenameInput" />
					</div>
					<div>
						<label>Working directory</label>
						<input type="text" name="wd" />
					</div>
					<div>
						<label>Task group</label>
						<input type="text" name="group" class="evq-autocomplete" data-type="taskgroup" />
					</div>
					<div>
						<label>Task comment</label>
						<input type="text" name="comment" />
					</div>
				</form>
				<button class="submit">Save</button>
			</div>
			<div id="tab-io" class="formdiv">
				<h2>
					Input and Output
					<span class="help faicon fa-question-circle" title="There are 2 possibilities to send parameters to an evQueue task. The default (as in a shell) is command line arguments. This is the most common behavior for system binaries. Environment variables have the advantage to be named, so it is often more practical if you have many parameters.&#10;&#10;Output type text is the default. You have to use XML output type if you intend to use the ask output as input for a child task. You can then use XPath to extract values from the task output. This is very useful in loops and conditions.&#10;&#10;If you do not want to use stdout stream, you can redirect it to stdin. This is the equivalent of 2>&amp;1 in a shell."></span>
				</h2>
				<form>
					<div>
						<label>Parameters mode</label>
						<select name="parameters_mode">
							<option value="CMDLINE">Command line</option>
							<option value="ENV">Environment variable</option>
						</select>
					</div>
					<div>
						<label>Output type</label>
						<select name="output_method">
							<option value="TEXT">Text</option>
							<option value="XML">XML</option>
						</select>
					</div>
					<div>
						<label>Merge stderr with stdout</label>
						<input type="checkbox" name="merge_stderr" />
					</div>
				</form>
				<button class="submit">Save</button>
			</div>
			<div id="tab-remote" class="formdiv">
				<h2>
					Remote execution
					<span class="help faicon fa-question-circle" title="evQueue can execute tasks on a remote machine using SSH. You can provide the host and user for remote execution.&#10;&#10;evQueue agent can be used to enable advanced functionalities such as dedicated log and real time task progression. If you intend to use the agent, you must first deploy it on all needed machines."></span>
				</h2>
				<form>
					<div>
						<label>Remote user</label>
						<input type="text" name="user" />
					</div>
					<div>
						<label>Remote host</label>
						<input type="text" name="host" />
					</div>
					<div>
						<label>Use evqueue agent</label>
						<input type="checkbox" name="use_agent" />
					</div>
				</form>
				<button class="submit">Save</button>
			</div>
		</div>
	</xsl:template>

</xsl:stylesheet>
