<?php
/**
 * Created by PhpStorm.
 * User: AxelPAL
 * Date: 06.10.2014
 * Time: 13:52
 */
function file_send($url, $file) {
    $ch = curl_init($url);

    $path = $_SERVER['DOCUMENT_ROOT'] . (dirname($_SERVER['REQUEST_URI'])=='/' ? dirname($_SERVER['REQUEST_URI']) : dirname($_SERVER['REQUEST_URI']).'/');

    if(isset($_FILES['audioFile']) and !in_array(pathinfo($_FILES['audioFile']['tmp_name'], PATHINFO_EXTENSION), array('mp3'))) {
        $file = 'files/' . substr(uniqid(), 0, 6) . '.' . pathinfo(basename($_FILES['audioFile']['name']), PATHINFO_EXTENSION);
        move_uploaded_file($_FILES['audioFile']['tmp_name'], $file);
    }

    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, array('file' =>"@" . $path . $file));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

    $data = json_decode(curl_exec($ch));

    curl_close($ch);
    @unlink($file);

    return $data;
}
$serverUrl = $_POST['serverUrl'];
$audioFile = $_FILES['audioFile'];
if($audioFile && $serverUrl){
    $return = file_send($serverUrl,$audioFile);
    echo json_encode($return);
}