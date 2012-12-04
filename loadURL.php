<?php
if( empty( $_GET['addURL'] ) ){ 
	header("HTTP/1.0 400 Bad Request"); 
}
$text=file_get_contents($_GET['addURL']);

if($text){
print $text;
} 
?>