<?php
	$contentTypeList = array(
		'0'=>'Content-Type: text/plain',
		'1'=>'Content-Type: application/octet-stream',
		'2'=>'Content-Type: application/x-rar-compressed',
		'3'=>'Content-Type: application/zip',
		'4'=>'Content-Type: application/x-shockwave-flash',
		'5'=>'Content-Type: video/quicktime',
		'6'=>'Content-Type: video/mp4',
		'7'=>'Content-Type: audio/mpeg',
		'8'=>'Content-Type: image/jpeg',
		'9'=>'Content-Type: image/gif',
		'10'=>'Content-Type: image/png',
		'11'=>'Content-Type: application',
		'12'=>'Content-Type: audio',
		'13'=>'Content-Type: video',
		'14'=>'Content-Type: image',
		'15'=>'Content-Type: helloworld'
		);
	header($contentTypeList[$_GET["type"]]."; charset=utf-8");
?>
<html>
GET parameter type value of the corresponding type of list Content-Type:<br />
	'0'=>'Content-Type: text/plain'<br />
	'1'=>'Content-Type: application/octet-stream' <br />
	'2'=>'Content-Type: application/x-rar-compressed' <br />
	'3'=>'Content-Type: application/zip',
	'4'=>'Content-Type: application/x-shockwave-flash' <br />
	'5'=>'Content-Type: video/quicktime' <br />
	'6'=>'Content-Type: video/mp4' <br />
	'7'=>'Content-Type: audio/mpeg'<br />
	'8'=>'Content-Type: image/jpeg'<br />
	'9'=>'Content-Type: image/gif'<br />
	'10'=>'Content-Type: image/png'<br />
	'11'=>'Content-Type: application'<br />
	'12'=>'Content-Type: audio'<br />
	'13'=>'Content-Type: video'<br />
	'14'=>'Content-Type: image'<br />
	'15'=>'Content-Type: helloworld'
