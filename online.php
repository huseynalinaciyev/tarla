<?php
// online.php

session_start();

// Fayl adı, online istifadəçiləri saxlamaq üçün
$file = 'online_users.json';

// İstifadəçi IP-sini alırıq
$ip = $_SERVER['REMOTE_ADDR'];

// İndiki vaxt
$now = time();

// Faylı oxuyuruq
if(file_exists($file)){
    $data = json_decode(file_get_contents($file), true);
    if(!is_array($data)) $data = [];
} else {
    $data = [];
}

// IP-ni yeniləyirik
$data[$ip] = $now;

// 5 dəqiqədən köhnə IP-ləri silirik
foreach($data as $user_ip => $timestamp){
    if($now - $timestamp > 300){ // 300 saniyə = 5 dəq
        unset($data[$user_ip]);
    }
}

// Faylı yeniləyirik
file_put_contents($file, json_encode($data));

// Online istifadəçi sayı
echo count($data);
?>

