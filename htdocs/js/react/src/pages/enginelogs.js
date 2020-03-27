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

import {HeaderMenu} from '../components/menus/header.js';
import {ExecutingInstances} from '../components/panels/instances/executing.js';
import {LogsFilters} from '../components/panels/logs/filters.js';
import {EngineLogs} from '../components/panels/logs/engine.js';

export class PageEngineLogs extends React.Component {
	constructor(props) {
		super(props);
		
		this.terminated_instances = React.createRef();
	}
	
	render() {
		return (
			<div>
				<HeaderMenu current="Logging" />
				<LogsFilters />
				<br />
				<EngineLogs />
			</div>
		);
	}
}
