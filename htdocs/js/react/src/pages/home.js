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

import {ExecutingInstances} from '../components/pannels/executing-instances.js';
import {InstanceFilters} from '../components/pannels/instance-filters.js';
import {TerminatedInstances} from '../components/pannels/terminated-instances.js';

ReactDOM.render(<ExecutingInstances />, document.querySelector('#executing-workflows'));
var terminated_instances = ReactDOM.render(<TerminatedInstances />, document.querySelector('#terminated-workflows'));
ReactDOM.render(<InstanceFilters onChange={terminated_instances.updateFilters}/>, document.querySelector('#searchformcontainer'));
