<?php
$file = 'data.txt'; //先读取文件

$cbody = file($file); //file（）函数作用是返回一行数组，txt里有三行数据，因此一行被识别为一个数组，三行被识别为三个数组
$lng = array();
$lat = array();
$flag = 0;
$str = "";
for($i=1;$i<count($cbody);$i++){
	if(strcmp($cbody[$i], "lat:")!=-1)
	{
		$flag = 1;
		continue;
	}
		
	if($flag == 0 && $cbody[$i])
	{
		array_push($lng,$cbody[$i]);
	}
	elseif($flag == 1 && $cbody[$i]){
		array_push($lat,$cbody[$i]);
	}
	
}
for($i=0;$i<count($lng);$i++){
	$str = $str."{\"lng\":\"".$lng[$i]."\",\"lat\":\"".$lat[$i]."\",\"count\":\"20\"},"."<br/>";
}

echo $str;

?>