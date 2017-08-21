<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

<xsl:import href="value-selector.xsl" />
	
<xsl:template name="job-editor">
	<div id='job-editor' class="tabs dialog" title="Edit job">
		<ul>
			<li><a href="#tab-jobproperties">Properties</a></li>
			<li><a href="#tab-jobconditionsloops">Conditions &amp; loops</a></li>
		</ul>
		<div id="tab-jobproperties">
			<h2>
				Job properties
				<span class="help faicon fa-question-circle" title="Job title is optional but can be useful to refer to the job or for documentation purpose."></span>
			</h2>
			<div class="formdiv">
				<form>
					<div>
						<label class="formLabel" for="jobname">Name</label>
						<input id="jobname" />
					</div>
				</form>
			</div>
		</div>
		<div id="tab-jobconditionsloops">
			<h2>
				Conditions and  loops
				<span class="help faicon fa-question-circle" title="It is possible to loop on a task output to execute one action several times. Loop context can be used to access the current value of the loop iteration.&#10;&#10;Condition is used to skip one job. This condition is evaluated before the loop. Iteration condition is evaluated after the loop, on each job. It can refer to loop context.&#10;&#10;It is possible to wait for a condition to become true, the condition is then evaluated each time a task stops, until workflow ends."></span>
			</h2>
			<div class="formdiv">
				<form>
					<div>
						<label class="formLabel" for="condition">Condition</label>
						<input id="condition" />
						&#160;<span class="faicon fa-magic"></span>
					</div>
					<div>
						<label class="formLabel" for="waitcondition">Wait for condition to become true</label>
						<input id="waitcondition" type="checkbox" />
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
					<div>
						<label class="formLabel" for="waititerationcondition">Wait for condition to become true</label>
						<input id="waititerationcondition" type="checkbox" />
					</div>
				</form>
			</div>
		</div>
	</div>
</xsl:template>

</xsl:stylesheet>
