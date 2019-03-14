<?php

$hostPrefix = "http://";
$host = checkData('host', "localhost:8080");
$Jsforce = checkData('jsForce', false);
$jsConsole = checkData('jsConsole', false);
$hostPath = $hostPrefix . $host;
$fileOutput = checkData('fileOutput', "compile");

$bundleCSSPath = $hostPath . '/bundle.css';
$bundleJSPath = $hostPath . '/bundle.js';

if ($fileOutput == "compile") {
	$minCSSFilePath = "compile/";
	$CSSFilePath = "compile/";
	$minJSFilePath = "compile/";
	$JSFilePath = "compile/";
} else if ($fileOutput == "components") {
	$minCSSFilePath = "../front/css/";
	$CSSFilePath = "../front/css/";
	$minJSFilePath = "../front/js/";
	$JSFilePath = "../front/js/";
} else {
	pr("");
	pr("> Bad output directory : '" . $fileOutput . "' please choose between 'compile' or 'components'");
	pr("> Abording");
	exit;
}

$minCSSFilePath .= "components.min.css";
$CSSFilePath .= "components.css";

$minJSFilePath .= "components.min.js";
$JSFilePath .= "components.js";

$regexJSExtraction = '%\.call\(this, \\\"\?http:\/\/' . $host . '\\\"\)%m';


pr("exec compilation from " . $hostPath . " to " . $fileOutput);
pr("Css : " . $bundleCSSPath . "<br/>Js : " . $bundleJSPath);

/* Get content page */
$hostData = getDistantPage($hostPath);
$bundleCSS = getDistantPage($bundleCSSPath);
$bundleJS = getDistantPage($bundleJSPath);

include 'minifier.php';

/* CSS */
pr("");
pr("CSS part");
if (isset($_POST['css'])) {
	
	pr("> Compile CSS into<br/>> " . $CSSFilePath . "<br/>> " . $minCSSFilePath);
	file_put_contents($CSSFilePath, $bundleCSS);
	file_put_contents($minCSSFilePath, minifyCss($bundleCSS));
	pr("> Compile CSS finished");
} else {
	pr("> Do not extract CSS");
}



/* JS */
pr("");
pr("JS Part");
if (isset($_POST['js'])) {
	pr("> Compile JS into<br/>> " . $JSFilePath . "<br/>> " . $minJSFilePath);
	pr("> Extract JS with regex " . $regexJSExtraction);

	$matches = array();
	preg_match($regexJSExtraction, $bundleJS, $matches);

	if (sizeof($matches) == 1) {
		pr("> Webpack caller found, deleted");
		
		compileJS($regexJSExtraction, $bundleJS, $minJSFilePath, $JSFilePath, $jsConsole);

	} else if (sizeof($matches > 1)) {
		pr("> Anomaly in JS file, " . sizeof($matches) . ' caller found');

		if ($jsForce) {
			pr("> Error, but force JS compilation");
			compileJS($regexJSExtraction, $bundleJS, $minJSFilePath, $JSFilePath, $jsConsole);
		} else {pr("> Abording");}
		
	} else {
		pr("> No webpack caller found");

		if ($jsForce) {
			pr("> Error, but force JS compilation");
			compileJS($regexJSExtraction, $bundleJS, $minJSFilePath, $JSFilePath, $jsConsole);
		} else {pr("> Abording");}
	}

} else {
	pr("> Do not extract JS");
}

function compileJS($regex, $bundle, $minFile, $file, $jsConsole) {
	if ($jsConsole) {
		pr("> Hide console");
		$bundle = "/* Compiler */var tempConsole=[console.log,console.error,console.info];console.log=function(){};console.error=function(){};console.info=function(){};"
		 . $bundle;
		$bundle .= "/* Compiler */console.log=tempConsole[0];console.error=tempConsole[1];console.info=tempConsole[2];";
	}

	preg_replace($regex, $bundle, "");
	file_put_contents($file, $bundle);
	file_put_contents($minFile, minifyJS($bundle));
	pr("> Compile JS finished");
}

/* ------------------- */

function checkData($index, $default) {
	if (!isset($_POST[$index]) || empty($_POST[$index])) {
		return($default);
	} else {
		return($_POST[$index]);
	}
}

function getDistantPage($url) {
	$ch = curl_init();
	$timeout = 5;
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
	$data = curl_exec($ch);
	curl_close($ch);

	if (!$data) {
		pr("");
		pr("> Cannot load distant page (" . $url . ")");
		pr("> Please check host is running, abording");
		exit;
	}

	return $data;
}

function pr($text) {
	echo($text . '<br/>');
}


function prv($text, $var) {
	echo($text . '<br/>');
	var_dump($var);
}

?>