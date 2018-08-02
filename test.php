<script type="text/javascript"> function test() {   var t1=3;   t1 = t1+2;  return t1; } </script>
<?php 
$test =  "<script type='text/javascript'>test();</script>"; 
echo $test;
?>