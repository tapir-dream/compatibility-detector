<style>
	* { margin:0; padding:0; font:16px Consolas; }
	body { background:lightgreen; }
</style>
<pre id="p">
<?php
	if (isset($_POST['ta'])) {
		echo $_POST['ta'];
	} else if (isset($_POST['ta1'])) {
		echo $_POST['ta1'];
	} else if (isset($_POST['ta2'])) {
		echo $_POST['ta2'];
	}
?>
</pre>