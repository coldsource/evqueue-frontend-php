 /*
  * This file is part of evQueue
  *
  * evQueue is free software: you can redistribute it and/or modify
  * it under the terms of the GNU General Public License as published by
  * the Free Software Foundation, either version 3 of the License, or
  * (at your option) any later version.
  *
  * evQueue is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  * GNU General Public License for more details.
  *
  * You should have received a copy of the GNU General Public License
  * along with evQueue. If not, see <http://www.gnu.org/licenses/>.
  *
  * Author: Thibault Kummer
  */

'use strict';

export class XML extends React.Component {
	constructor(props) {
		super(props);
	}
	
	attributes(node)
	{
		var ret = [];
		for(var i=0;i<node.attributes.length;i++)
		{
			var attr = node.attributes[i];
			ret.push(<span key={i}>&#160;<span className="evq-xml_attributename">{attr.name}</span>=&quot;<span className="evq-xml_attributevalue">{attr.value}&quot;</span></span>);
		}
		return ret;
	}
	
	renderNode(node)
	{
		var ret = [];
		var i=0;
		while(node)
		{
			if(node.nodeType==1)
			{
				ret.push(
					<div key={i} className="evq-xml_tag">
						&lt;
						<span className="evq-xml_tagname">{node.nodeName}</span>
						{this.attributes(node)}
						&gt;
						
						{this.renderNode(node.firstChild)}
						
						&lt;
						<span className="evq-xml_tagname">/{node.nodeName}</span>
						&gt;
					</div>
				);
			}
			else
				ret.push(<span key={i}>{node.textContent}</span>);
			
			i++;
			node = node.nextSibling;
		}
		
		return ret;
	}
	
	render() {
		return (
			<div>{this.renderNode(this.props.xml)}</div>
		);
	}
}
