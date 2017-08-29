<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

<xsl:import href="value-selector.xsl" />
	
<xsl:template name="task-editor">
	<div id='task-editor' class="tabs dialog" title="Edit task">
		<ul>
			<li><a href="#tab-inputs">Inputs</a></li>
			<li><a href="#tab-conditionsloops">Conditions &amp; loops</a></li>
			<li><a href="#tab-queueretry">Queue &amp; retry</a></li>
			<li><a href="#tab-remote">Remote execution</a></li>
			<li><a href="#tab-stdin">Stdin</a></li>
		</ul>
		<div id="tab-inputs">
			<h2>
				Task inputs
				<span class="help faicon fa-question-circle" title="The inputs are passed to the task that will be executed. Depending on your task configuration, inputs will be passed as command line arguments or environment variables. The default is command line arguments.&#10;&#10;Input values can be static (simple text), or dynamic by fetching output of parent tasks in the workflow."></span>
			</h2>
			<div class="inputs"></div>
			<span id="add-input" class="faicon fa-plus" title="Add input"></span>
		</div>
		<div id="tab-conditionsloops">
			<h2>
				Conditions and loops
				<span class="help faicon fa-question-circle" title="It is possible to loop on a task output to execute one action several times. Loop context can be used to access the current value of the loop iteration.&#10;&#10;Condition is used to skip one task. This condition is evaluated before the loop. Iteration condition is evaluated after the loop, on each task. It can refer to loop context."></span>
			</h2>
			<div class="formdiv">
				<form>
					<div>
						<label class="formLabel" for="condition">Condition</label>
						<input id="condition" />
						&#160;<span class="faicon fa-magic"></span>
					</div>
					<div>
						<label class="formLabel" for="loop">Loop</label>
						<input id="loop" />
						&#160;<span class="faicon fa-magic"></span>
					</div>
					<div>
						<label class="formLabel" for="iteration-condition">Iteration condition</label>
						<input id="iteration-condition" />
						&#160;<span class="faicon fa-magic"></span>
					</div>
				</form>
			</div>
		</div>
		<div id="tab-queueretry">
			<h2>
				Queue and retry
				<span class="help faicon fa-question-circle" title="Queues are used to limit tasks parallelisation depending on the queue concurrency. A conncurrency of 1 will limit execution to one task at a time.&#10;&#10;Retry schedules are used to retry failed tasks. The task will not be considered faild as long as retries are still scheduled."></span>
			</h2>
			<div class="formdiv">
				<form>
					<div>
						<label class="formLabel" for="queue">Queue</label>
						<select id="queue" />
					</div>
					<div>
						<label class="formLabel" for="retryschedule">Retry schedule</label>
						<select id="retryschedule" />
					</div>
					<div>
						<label class="formLabel" for="retryretval">Retry on</label>
						<select id="retryretval" />
					</div>
				</form>
			</div>
		</div>
		<div id="tab-remote">
			<h2>
				Remote execution
				<span class="help faicon fa-question-circle" title="If the task should not be executed locally, enter the user and host used for remote SSH connection.&#10;&#10;If you are using dynamic a dynamic queue, the used will be used by default to create the dynamic queue name.&#10;&#10;It is possible to use dynamic queues with local execution with the queue host attribute. This can be useful for tasks operating on distant machines without SSH (SQL connections, rsync...) on which you want to limit concurrency for performance reasons.&#10;&#10;All these values can incorporate dynamic XPath parts surrounded with braces."></span>
			</h2>
			<div class="formdiv">
				<form>
					<div>
						<label class="formLabel" for="user">User</label>
						<input id="user" />
					</div>
					<div>
						<label class="formLabel" for="host">Host</label>
						<input id="host" />
					</div>
					<div>
						<label class="formLabel" for="queue_host">Queue host</label>
						<input id="queue_host" />
					</div>
				</form>
			</div>
		</div>
		<div id="tab-stdin">
			<h2>
				Stdin stream
				<span class="help faicon fa-question-circle" title="Task stdin is used to pipe data to the task. It has the same utility as the 'pipe' character in a shell.&#10;&#10;Data can be piped to XML or text format. If the text format is chosen, XML markup tags will be stripped to keep only text values."></span>
			</h2>
			<div>
				stdin mode&#160;:&#160;
				<select id="stdinmode">
					<option value="xml">XML</option>
					<option value="text">Text</option>
				</select>
			</div>
			<div class="input_line" data-inputtype="stdin">
				<div class="input">stdin</div>
				<div class="value"></div>
			</div>
		</div>
	</div>
	
	<xsl:call-template name="value-selector" />
</xsl:template>

</xsl:stylesheet>
