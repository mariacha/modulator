<?php
if( empty( $_POST['imgUrl'] ) ){ header("HTTP/1.0 400 Bad Request"); }
$url=getimagesize($_POST['imgUrl']);
if( !is_array($url) ){
	header("HTTP/1.0 404 Not Found");
}else{
	header("HTTP/1.0 200 OK");
}
?>