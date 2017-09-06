<?php
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
  * Authors: Nicolas Jean, Christophe Marti 
  */
  
require_once __DIR__ . '/logger.php';
require_once __DIR__ . '/../lib/XSLEngine.php';

session_start();
require_once __DIR__ . '/evqueue.php';

if (!isset($_SESSION['user_login'])) {
  header('Location: '.(defined('SITE_BASE')?constant('SITE_BASE'):'').'auth.php');
  die();
}
?>