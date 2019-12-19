var groupby = 'day';
var statistics_data_dom = false;
var nodes = false;

$(document).ready(function() {
	nodes = {nodes:$("body").data('nodesnames').split(',')};
	refresh_all_graphs();
	
	$('.graph-container').delegate('input','change',function() {
		refresh_graph($(this).parents('.graph-container'));
	});
	
	$('.graph-period input').change(function() {
		groupby = $('.graph-period input:checked').val();
		refresh_all_graphs();
	});
});

function refresh_all_graphs()
{
	Wait();
	evqueueAPI({
		group: 'instances',
		action: 'list',
		attributes: {'groupby': groupby, 'limit':10000}
	}).done(function(xml) {
		statistics_data_dom = xml;
		
		Ready();
		
		$('.graph-container').each(function() {
			refresh_graph($(this));
		});
	});
}

function refresh_graph(graph_container)
{
	var group = graph_container.data('group');
	
	var include = [':all'];
	var filter = [];
	graph_container.find('.graph-workflows input').each(function() {
		filter.push($(this).attr('name'));
		if($(this).prop('checked'))
			include.push($(this).attr('name'));
	});
	
	var counts = {};
	var workflow_nodes = statistics_data_dom.Query('workflow',statistics_data_dom.documentElement);
	for(var i=0;i<workflow_nodes.length;i++)
	{
		var name = workflow_nodes[i].getAttribute('name');
		if(group!=':all' && jQuery.inArray(name, filter)==-1)
			continue;
		
		var x = workflow_nodes[i].getAttribute('year');
		if(workflow_nodes[i].hasAttribute('month'))
			x += workflow_nodes[i].getAttribute('month');
		if(workflow_nodes[i].hasAttribute('day'))
			x += workflow_nodes[i].getAttribute('day');
		if(workflow_nodes[i].hasAttribute('hour'))
			x += workflow_nodes[i].getAttribute('hour');
		
		var node_name = workflow_nodes[i].getAttribute('node_name');
		var count = parseInt(workflow_nodes[i].getAttribute('count'));
		
		if(!counts.hasOwnProperty(x))
			counts[x] = {};
		
		if(!counts[x].hasOwnProperty(':all'))
			counts[x][':all'] = 0;
		
		if(!counts[x].hasOwnProperty(name))
			counts[x][name] = 0;
		
		if(!counts[x].hasOwnProperty('@'+node_name))
		{
			counts[x]['@'+node_name] = {};
			counts[x]['@'+node_name][':all'] = 0;
		}
		
		counts[x]['@'+node_name][name] =count;
		counts[x]['@'+node_name][':all'] +=count;
		counts[x][name] += count;
		counts[x][':all'] += count;
	}
	
	var nit = 10;
	var current_date = new Date();
	
	var graph_data = [];
	var graph_counts = [];
	for(var i=0;i<nit;i++)
	{
		var x = "" + current_date.getFullYear();
		var x_human = "" + current_date.getFullYear();
		if(groupby=='month' || groupby=='day' || groupby=='hour')
		{
			x += (current_date.getMonth()+1);
			x_human += "-"+(current_date.getMonth()+1);
		}
		if(groupby=='day' || groupby=='hour')
		{
			x += current_date.getDate();
			x_human += "-"+current_date.getDate();
		}
		if(groupby=='hour')
		{
			x += current_date.getHours();
			x_human += " "+current_date.getHours()+":00:00";
		}
		
		var point = {_t:x_human};
		for(var j=0;j<include.length;j++)
		{
			point[include[j]] = 0;
			if(counts.hasOwnProperty(x) && counts[x].hasOwnProperty(include[j]))
				point[include[j]] = counts[x][include[j]];
		}

		graph_data.push(point);
		graph_counts.push(counts.hasOwnProperty(x)?counts[x]:false);
		
		if(groupby=='hour')
			current_date.setHours(current_date.getHours()-1);
		else if(groupby=='day')
			current_date.setHours(current_date.getHours()-24);
		else if(groupby=='month')
			current_date.setMonth(current_date.getMonth()-1);
		else if(groupby=='year')
			current_date.setMonth(current_date.getMonth()-12);
		
	}
	
	var graph_id = group!=':all'?'graph-'+group.replace(/ /g,'-'):'graph';
	console.log(graph_id);
	$('#'+graph_id).empty();
	new Morris.Line({
		element: graph_id,
		data: graph_data,
		xkey: '_t',
		ykeys: include,
		labels: include,
		hoverCallback: function(index, options, content) {
			var has_elements = false;
			var counts = graph_counts[graph_data.length-index-1];
			var desc = '<div style="width:200px;">';
			for(var i=0;i<include.length;i++)
			{
				var wf = include[i];
				
				if(counts.hasOwnProperty(wf))
				{
					has_elements = true;
					var name = wf==':all'?'All workflows':wf;
					desc += "<div style='font-weight:bold;color:"+options.lineColors[i]+"'>"+name+" (total : "+((counts!==false && counts.hasOwnProperty(wf))?counts[wf]:0)+")</div>";
					if(counts!==false)
					{
						desc += "<ul>";
						for(var j=0;j<nodes.nodes.length;j++)
						{
							var node = nodes.nodes[j];
							if(counts.hasOwnProperty('@'+node) && counts['@'+node].hasOwnProperty(wf))
								desc += "<li>"+node+" : "+counts['@'+node][wf]+"</li>";;
						}
						desc += "</ul>";
					}
				}
			}
			
			if(!has_elements)
				desc += "No instances launched";
			
			desc += "</div>";
			return desc;
		},
	});
}