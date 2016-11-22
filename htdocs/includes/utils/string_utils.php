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


setlocale(LC_CTYPE, 'fr_FR');

const MODE_NORMAL = 0;
const MODE_ADDRESS = 1; // also removes punctuation marks and replaces saint/sainte by st/ste
const MODE_KEEP_PUNCTUATION = 2;
const MODE_ADDRESS_SEARCH = 3;

/**
 * Deaccentuate a string for specific diacritics
 * as iconv sometimes return spaces instead of unaccented letters
 * 
 * @param string $string
 * @return string
 */
function deaccentuate($string) {
	mb_regex_encoding("UTF-8");
	$string = mb_strtolower($string, "UTF-8");

	$replacement = array(
		'à'=>'a','á'=>'a','â'=>'a','ä'=>'a',
		'ç'=>'c',
		'é'=>'e','è'=>'e','ê'=>'e','ë'=>'e',
		'ì'=>'i','í'=>'i','î'=>'i','ï'=>'i',
		'ñ'=>'n',
		'ò'=>'o','ó'=>'o','ô'=>'o',
		'ù'=>'u','ú'=>'u','û'=>'u','ü'=>'u',
	);

	foreach($replacement as $before => $after) {
		$string = mb_ereg_replace($before, $after, $string);
	} 
	return $string;
}

function tolowerascii ($str, $mode = MODE_NORMAL) {
	$str = deaccentuate($str);
	$str = iconv('UTF-8', 'ASCII//TRANSLIT', $str);
	
	switch ($mode) {
		case MODE_ADDRESS:
			$str = preg_replace(";(^|\W)saint(e?)($|\W);", "$1st$2$3", $str);
			break;
		case MODE_ADDRESS_SEARCH:
			$str = preg_replace(";(^|\W)saint(e?)($|\W);", "$1s%t$2$3", $str);
			break;
	}
	
	// convert punctuation to spaces and (then) remove duplicate spaces
	if ($mode != MODE_KEEP_PUNCTUATION) {
		$str = preg_replace(";[^\w%];", " ", $str);
		$str = preg_replace(";\s+;", " ", $str);
	}
	return $str;
}

function toupperascii ($str, $mode = MODE_NORMAL) {
	return strtoupper(tolowerascii($str,$mode));
}


function generate_random_string ($length) {
	$chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	$chars_len = strlen($chars);
	
	$ticket = '';
	for($i=0; $i<$length; $i++)
		$ticket .= $chars[mt_rand(0,$chars_len-1)];
	
	return $ticket;
}

/**
  * Trim characters from either (or both) ends of a string in a way that is
  * multibyte-friendly.
  *
  * Mostly, this behaves exactly like trim() would: for example supplying 'abc' as
  * the charlist will trim all 'a', 'b' and 'c' chars from the string, with, of
  * course, the added bonus that you can put unicode characters in the charlist.
  *
  * We are using a PCRE character-class to do the trimming in a unicode-aware
  * way, so we must escape ^, \, - and ] which have special meanings here.
  * As you would expect, a single \ in the charlist is interpretted as
  * "trim backslashes" (and duly escaped into a double-\ ). Under most circumstances
  * you can ignore this detail.
  *
  * As a bonus, however, we also allow PCRE special character-classes (such as '\s')
  * because they can be extremely useful when dealing with UCS. '\pZ', for example,
  * matches every 'separator' character defined in Unicode, including non-breaking
  * and zero-width spaces.
  *
  * It doesn't make sense to have two or more of the same character in a character
  * class, therefore we interpret a double \ in the character list to mean a
  * single \ in the regex, allowing you to safely mix normal characters with PCRE
  * special classes.
  *
  * *Be careful* when using this bonus feature, as PHP also interprets backslashes
  * as escape characters before they are even seen by the regex. Therefore, to
  * specify '\\s' in the regex (which will be converted to the special character
  * class '\s' for trimming), you will usually have to put *4* backslashes in the
  * PHP code - as you can see from the default value of $charlist.
  *
  * @param string
  * @param charlist list of characters to remove from the ends of this string.
  * @param boolean trim the left?
  * @param boolean trim the right?
  * @return String
  * 
  * source: http://php.net/manual/en/ref.mbstring.php
  */
function mb_trim($string, $charlist='\\\\s', $ltrim=true, $rtrim=true)
{
	$both_ends = $ltrim && $rtrim;

	$char_class_inner = preg_replace(
		array( '/[\^\-\]\\\]/S', '/\\\{4}/S' ),
		array( '\\\\\\0', '\\' ),
		$charlist
	);

	$work_horse = '[' . $char_class_inner . ']+';
	$ltrim && $left_pattern = '^' . $work_horse;
	$rtrim && $right_pattern = $work_horse . '$';

	if($both_ends)
	{
		$pattern_middle = $left_pattern . '|' . $right_pattern;
	}
	elseif($ltrim)
	{
		$pattern_middle = $left_pattern;
	}
	else
	{
		$pattern_middle = $right_pattern;
	}

	return preg_replace("/$pattern_middle/usSD", '', $string);
} 

?>