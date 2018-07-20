<?php
$file = 'pr.txt'; //先读取文件

$cbody = file($file); //file（）函数作用是返回一行数组，txt里有三行数据，因此一行被识别为一个数组，三行被识别为三个数组
$pr = array();
$num = array();
$flag = 0;
$str = "";
for($i=0;$i<count($cbody);$i++){
	if($i%2==0)
	{
		array_push($pr,$cbody[$i]);
	}
	else{
		array_push($num,$cbody[$i]);
	}
	
}
for($i=0;$i<count($pr);$i++){
	$str = $str."{\"pr\":\"".$pr[$i]."\",\"num\":".$num[$i]."},<br/>";
}
//{"lng":"118.8004110 ","lat":"30.0288960 ","count":"20","name":"XX信息站","contact":"张三","tel":"6666666666"},
echo $str;

?>