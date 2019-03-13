<?php
/**
 * This function takes a css-string and compresses it, removing
 * unneccessary whitespace, colons, removing unneccessary px/em
 * declarations etc.
 *
 * @param string $css
 * @return string compressed css content
 * @author Steffen Becker
 */
function minifyCss($css) {
  // some of the following functions to minimize the css-output are directly taken
  // from the awesome CSS JS Booster: https://github.com/Schepp/CSS-JS-Booster
  // all credits to Christian Schaefer: http://twitter.com/derSchepp
  // remove comments
  $css = preg_replace('!/\*[^*]*\*+([^/][^*]*\*+)*/!', '', $css);
  // backup values within single or double quotes
  preg_match_all('/(\'[^\']*?\'|"[^"]*?")/ims', $css, $hit, PREG_PATTERN_ORDER);
  for ($i=0; $i < count($hit[1]); $i++) {
    $css = str_replace($hit[1][$i], '##########' . $i . '##########', $css);
  }
  // remove traling semicolon of selector's last property
  $css = preg_replace('/;[\s\r\n\t]*?}[\s\r\n\t]*/ims', "}\r\n", $css);
  // remove any whitespace between semicolon and property-name
  $css = preg_replace('/;[\s\r\n\t]*?([\r\n]?[^\s\r\n\t])/ims', ';$1', $css);
  // remove any whitespace surrounding property-colon
  $css = preg_replace('/[\s\r\n\t]*:[\s\r\n\t]*?([^\s\r\n\t])/ims', ':$1', $css);
  // remove any whitespace surrounding selector-comma
  $css = preg_replace('/[\s\r\n\t]*,[\s\r\n\t]*?([^\s\r\n\t])/ims', ',$1', $css);
  // remove any whitespace surrounding opening parenthesis
  $css = preg_replace('/[\s\r\n\t]*{[\s\r\n\t]*?([^\s\r\n\t])/ims', '{$1', $css);
  // remove any whitespace between numbers and units
  $css = preg_replace('/([\d\.]+)[\s\r\n\t]+(px|em|pt|%)/ims', '$1$2', $css);
  // shorten zero-values
  $css = preg_replace('/([^\d\.]0)(px|em|pt|%)/ims', '$1', $css);
  // constrain multiple whitespaces
  $css = preg_replace('/\p{Zs}+/ims',' ', $css);
  // remove newlines
  $css = str_replace(array("\r\n", "\r", "\n"), '', $css);
  // Restore backupped values within single or double quotes
  for ($i=0; $i < count($hit[1]); $i++) {
    $css = str_replace('##########' . $i . '##########', $hit[1][$i], $css);
  }
  return $css;
}

function minifyJS($javascript){
  $blocks = array('for', 'while', 'if', 'else');
  $javascript = preg_replace('/([-\+])\s+\+([^\s;]*)/', '$1 (+$2)', $javascript);
  // remove new line in statements
  $javascript = preg_replace('/\s+\|\|\s+/', ' || ', $javascript);
  $javascript = preg_replace('/\s+\&\&\s+/', ' && ', $javascript);
  $javascript = preg_replace('/\s*([=+-\/\*:?])\s*/', '$1 ', $javascript);
  // handle missing brackets {}
  foreach ($blocks as $block){
    $javascript = preg_replace('/(\s*\b' . $block . '\b[^{\n]*)\n([^{\n]+)\n/i', '$1{$2}', $javascript);
  }
  // handle spaces
  $javascript = preg_replace(array("/\s*\n\s*/", "/\h+/"), array("\n", " "), $javascript); // \h+ horizontal white space
  $javascript = preg_replace(array('/([^a-z0-9\_])\h+/i', '/\h+([^a-z0-9\$\_])/i'), '$1', $javascript);
  $javascript = preg_replace('/\n?([[;{(\.+-\/\*:?&|])\n?/', '$1', $javascript);
  $javascript = preg_replace('/\n?([})\]])/', '$1', $javascript);
  $javascript = str_replace("\nelse", "else", $javascript);
  $javascript = preg_replace("/([^}])\n/", "$1;", $javascript);
  $javascript = preg_replace("/;?\n/", ";", $javascript);
  return $javascript;
}
?>