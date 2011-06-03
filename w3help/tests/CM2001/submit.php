<?php
	$gp = $_REQUEST;
	foreach ($gp as $k=>$v) {
		echo $k . "/" . $v . "<br />";
	}
	$fp = $_FILES;
	foreach ($fp as $kf=>$kv) {
		echo $kf . "/" . $kv["name"] . "<br />";
	}
?>