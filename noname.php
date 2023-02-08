<?php
$page_name = "https://noliforas.github.io/articles/article-zero.html"; 

//统计第一个附属网页page-1
$file = "counts/".$page_name.".txt"; 

if (!file_exists($file)) 
{ 
    $f = fopen($file, "w"); 
    fwrite($f,"0"); 
    fclose($f); 
} 

$f = fopen($file,"r"); 
$count = (int) fread($f,20); 
fclose($f); 

$count++; 

$f = fopen($file, "w"); 
fwrite($f, $count); 
fclose($f); 

//统计第二个附属网页page-2
$page_name = "https://noliforas.github.io/articles/usedplatforms.html"; 
$file = "counts/".$page_name.".txt"; 

if (!file_exists($file)) 
{ 
    $f = fopen($file, "w"); 
    fwrite($f,"0"); 
    fclose($f); 
} 

$f = fopen($file,"r"); 
$count = (int) fread($f,20); 
fclose($f); 

$count++; 

$f = fopen($file, "w"); 
fwrite($f, $count); 
fclose($f); 

?>

