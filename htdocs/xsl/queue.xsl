<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
	<xsl:import href="templates/main-template.xsl" />
	
	<xsl:variable name="topmenu" select="'settings'" />
	
	<xsl:variable name="javascript">
		<src>js/queue.js</src>
	</xsl:variable>

	<xsl:template name="content">
		<div id="list-queues"></div>
		
		<xsl:call-template name="queue-editor" />
	</xsl:template>
	
	<xsl:template name="queue-editor">
		<div id="queue-editor" class="dialog formdiv" data-width="900" data-height="300">
			<h2>
				Queue properties
				<span class="help faicon fa-question-circle" title="Queues are used to limit tasks parallelism. Queues are global amongst jobs and workflows.&#10;&#10;Concurrency defines the maximum number of tasks in this queue that can be executed simultaneously. Other tasks will be queued and executed when other tasks are terminated.&#10;&#10;Scheduler defines how the queue behaves. Fifo scheduler guarantees that tasks are executed in the same order they are placed in the queue. Prio scheduler will first execute tasks of older workflows, even if they are added later in the queue.&#10;&#10;Dynamic queues are used for remote execution. A dynamic queue will be created for each different host, and then destructed when it is no longer needed. So the concurrency is intended per host."></span>
			</h2>
			<form>
				<div>
					<label>Name</label>
					<input type="text" name="name" />
				</div>
				<div>
					<label>Concurrency</label>
					<input type="text" name="concurrency" />
				</div>
				<div>
					<label>Scheduler</label>
					<select name="scheduler">
						<option value="default">default</option>
						<option value="fifo">fifo</option>
						<option value="prio">prio</option>
					</select>
				</div>
				<div>
					<label>Dynamic queue</label>
					<input type="checkbox" name="dynamic" />
				</div>
			</form>
			<button class="submit">Save</button>
		</div>
	</xsl:template>
	
</xsl:stylesheet>
