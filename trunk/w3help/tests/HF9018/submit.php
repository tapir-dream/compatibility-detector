<style>
	body { margin:8px; font:14px/1.5 "Trebuchet MS"; background:wheat; }
	span { background:plum; }
	em { font-weight:bold; background:skyblue; padding:2px; }
</style>
<?php
	function get($param) {
		if (isset($_GET[$param])) {
			echo '<span>' . $param . '</span>: <em>&nbsp;"' . $_GET[$param] . '&nbsp;"</em><br />';
		} else {
			echo '<span>' . $param . '</span>: <em>&nbsp;N/A&nbsp;</em><br />';
		}
	}
	get('no_value');
	get('empty_value');
	get('has_value');
?>