function RetrySchedule(xml = false)
{
	// Load XML
	if(xml===false)
	{
		this.xmldoc = document.implementation.createDocument(null,null);
		this.xmldoc.appendChild(this.xmldoc.createElement('schedule'));
	}
	else if(xml instanceof XMLDocument)
		this.xmldoc = xml;
	else
		this.xmldoc = jQuery.parseXML(xml);
	
	XMLDocument.prototype.Query = function(xpath, context)
	{
		var results = this.evaluate(xpath,context,null,XPathResult.ANY_TYPE, null);
		var ret = [];
		while (result = results.iterateNext())
			ret.push(result);
		return ret;
	}
	
	this.xmldoc.documentElement.removeAttribute('id');
	this.xmldoc.documentElement.removeAttribute('name');
}

RetrySchedule.prototype.GetXML = function(remove_id = false)
{
	return new XMLSerializer().serializeToString(this.xmldoc);
}

RetrySchedule.prototype.GetLevels = function()
{
	var levels = this.xmldoc.Query('/schedule/level',this.xmldoc);
	var ret = [];
	for(var i=0;i<levels.length;i++)
		ret.push({retry_delay:levels[i].getAttribute('retry_delay'),retry_times:levels[i].getAttribute('retry_times')});
	return ret;
}

RetrySchedule.prototype.AddLevel = function()
{
	this.xmldoc.documentElement.appendChild(this.xmldoc.createElement('level'));
}

RetrySchedule.prototype.DeleteLevel = function(idx,name,value)
{
	var levels = this.xmldoc.Query('/schedule/level',this.xmldoc);
	this.xmldoc.documentElement.removeChild(levels[idx]);
}

RetrySchedule.prototype.SetLevelAttribute = function(idx,name,value)
{
	var levels = this.xmldoc.Query('/schedule/level',this.xmldoc);
	levels[idx].setAttribute(name,value);
}

RetrySchedule.prototype.SetName = function(name)
{
	this.documentElement.setAttribute('name',name);
}

RetrySchedule.prototype.GetName = function()
{
	this.documentElement.getAttribute('name');
}