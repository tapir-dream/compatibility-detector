<?php
	echo '<style>* { font:12px "Trebuchet MS"; }</style>';
	echo (isset($_SERVER['HTTP_REFERER'])) ? 'Referer: ' . $_SERVER['HTTP_REFERER'] : 'Referer: N/A';
?>