function onLoad() {
    map = new T.Map('mapDiv',{minZoom:4,maxZoom:10}); 
    map.centerAndZoom(new T.LngLat(80.40769, 36.89945), zoom);
    geocode = new T.Geocoder();
    map.disableDoubleClickZoom();
    getMapBounds();
    var imageURL = "./css/bg.jpg";

    lay = new T.TileLayer(imageURL, {minZoom: 4, maxZoom: 4,opacity:1,bounds:map.getBounds(),width:'1000px'});

    //console.log(lay);
    map.addLayer(lay);
    
    changeClass(2);

    createTable(ytw_data.prlist);
    map.addEventListener("zoomstart",function(e){
        
        
    });
    map.addEventListener("zoomend",function(e){
        if(this.getZoom()==4){
            map.removeLayer(lay);
            //console.log("ssss");
            //changeClass(4);
        }

        if(this.getZoom()<=6 && overlay_exist==0){
            hide_polygon(false);
            show_polygon(1);
            overlay_exist=1;
            map.removeEventListener("click",MapClick);

            
        }
        if(this.getZoom()==7 && overlay_exist==1){
            hide_polygon(true);
            overlay_exist=0;
            map.addEventListener("click",MapClick);
        }
        
    });


    for (var i = 0,aLen = areaArr.length; i < aLen; i++) {
        polygon(areaArr[i].area.points,areaArr[i].area.name,1);
    }
    
}

function createTable(data){
    console.log("func1");
    var tableData ="";
    var total = 1;
    var compare = function (obj1, obj2) {
        var val1 = obj1.num;
        var val2 = obj2.num;
        if (val1 > val2) {
            return -1;
        } else if (val1 < val2) {
            return 1;
        } else {
            return 0;
        }            
    };
    data.sort(compare);

    for(var i=0;i<data.length;i++){
        total += data[i].num;
    }
    
    for(var i=0;i<data.length;i++){
        tableData+="<tr class=\"tr"+i+"\">";
        tableData+="<td class=\"index\"><span>"+(i+1)+"</span></td>";
        tableData+="<td class=\"province\">"+data[i].pr+"</td>";
        tableData+="<td class=\"station-num\">"+data[i].num+"</td>";
        var temp = (data[i].num/total)*100;
        tableData+="<td class=\"proportion\"><span class=\"txt\" style=\"bottom: 14.2px;\">"+temp.toFixed(2)+"%</span>";
        tableData+="<span class=\"box\" style=\"height: "+temp+"%;\"></span></td>"
        tableData+="</tr>";
    }

    
    $("#tbody1").html(tableData);
}




function changeClass(num){//根据观察html获得以下隐藏的技巧
    var target = getByClass(document,"tdt-tile-container tdt-zoom-animated");
    
    target[2].lastChild.setAttribute("style", "width: 1366px; height: 768px; transform: translate3d(0px, 0px, 0px); opacity: 1;"); 
    console.log(target[num].lastChild);
    if(num==2){
        var target1 = getByClass(document,"tdt-control-copyright tdt-control");
        //console.log(target1);
        target1[0].setAttribute("style", "display:none");
    }
    
}

function getByClass(oParent, sClass){
    var aResult=[];
    var aEle=oParent.getElementsByTagName('*');
    
    for(var i=0;i<aEle.length;i++){
        if(aEle[i].className==sClass)
        {
            aResult.push(aEle[i]);
        }
    }
    //console.log(aResult[2].lastChild);
    
    return aResult;
}

function getMapBounds() {
    var bs = map.getBounds();       //获取可视区域
    var bssw = bs.getSouthWest();   //可视区域左下角
    var bsne = bs.getNorthEast();   //可视区域右上角
    //alert("当前地图可视范围是：" + bssw.getLng() + "," + bssw.getLat() + "到" + bsne.getLng() + "," + bsne.getLat());
    console.log(bs);
    //alert("当前地图可视范围是：" + bs);
}

function MapClick(e){
    if(timeoutID) {//取消上次延时未执行的方法
        timeoutID = clearTimeout(timeoutID);
    }
    timeoutID= window.setTimeout(function(){//消除双击=2*单击
        hide_polygon(false);
        map.centerAndZoom(new T.LngLat(e.lnglat.getLng(), e.lnglat.getLat()), 7);
        overlay_exist=0;

        geocode.getLocation(e.lnglat,searchResult1);
    }, 300);
    
}

 
function searchResult1(result)
{
    //console.log(result);
    var address = result.getAddress();
    var name = address.substr(0,2);
    //console.log(name);
    for(var key of province){
        //console.log(key[0].substr(0,2)+"   "+name);
        if(key[0].substr(0,2) == name)
        {
            addchild(key[0]);
        }
        
    }
}

function polygon(points,name,level){
    var pointsArr = [];
    var color = "white";
    var num=0;
    
    for (var i = 0; i < ytw_data.prlist.length; i++) {
        if(ytw_data.prlist[i].pr == name){
            var gap = (ytw_data.max - ytw_data.min) / 6;
            num = ytw_data.prlist[i].num;
            color = colors[Math.round((ytw_data.prlist[i].num - ytw_data.min)/gap)];
        }
    }
    if(level>1){
        //console.log("color");
        color = colors[parseInt(Math.random()*(7),10)];
    }
   
    
    for (var i = 0; i < points.length; i++) {
        var regionLngLats = [];
        var regionArr = points[i].region.split(",");
        for (var m = 0; m < regionArr.length; m++) {
            var lnglatArr = regionArr[m].split(" ");
            var lnglat = new T.LngLat(lnglatArr[0], lnglatArr[1]);
            regionLngLats.push(lnglat);
            pointsArr.push(lnglat);
        }
        //创建面对象
        
        var polygon = new T.Polygon(regionLngLats,{color: "white", weight: 1, opacity: 0.5, fillColor: color, fillOpacity: 0.7});
        
        polygon.addEventListener("mouseover",function(e){
            this.setColor("#0000ff");
            this.setWeight(5);
            
            var content = name + '<br> <hr />' + "信息站数："+num;
            openInfo(content,e);

        });
        polygon.addEventListener("mouseout",function(e){
            this.setColor("white");
            this.setWeight(1);
            
        });
        polygon.addEventListener("dblclick",function(e){
            if(timeoutID) {//取消上次延时未执行的方法
                timeoutID = clearTimeout(timeoutID);
            }
            
            if(map.getZoom()<7 &&!dblclick_flag){
                dblclick_flag=1;
                hide_polygon(true);
                map.centerAndZoom(new T.LngLat(e.lnglat.getLng(), e.lnglat.getLat()), 7);
                map.addEventListener("click",MapClick);
                addchild(name);
                //geocode.getLocation(e.lnglat,searchResult1);
                //
            }
            
        });
        polygon.addEventListener("click",function(e){

            if(map.getZoom()==7 ){
                //console.log("11111111");
                //hide_polygon();
                map.centerAndZoom(new T.LngLat(e.lnglat.getLng(), e.lnglat.getLat()), 7);
                overlay_exist=0;
            }
            
        });
        
        if(level==1){
            arr.push(polygon);
        }else if(level==2){
            //console.log(name);
            arr1.push(polygon);
        }
        map.addOverLay(polygon);
        //console.log(name);
    }
    
}
function addchild(name){
    var temp = province.get(name);
    console.log(name);
    //console.log(temp);
    for (var i = 0,aLen = temp.length; i < aLen; i++) {
        polygon(temp[i].area.points,temp[i].area.name,2);
    }
}

function hide_polygon(flag){
    var arr_overlay = Array();
    if(flag){
       // console.log(flag);
        arr_overlay = arr;
    }else{
        arr_overlay = map.getOverlays();
    }
    //console.log(arr_overlay.length);
    
    for(var i =0,lens = arr_overlay.length;i<lens;i++){//把所有的覆盖物隐藏，这样可以加速
        var polygon = arr_overlay.pop();
        try{
            polygon.hide();      
        }catch(e){
            polygon.closeInfoWindow();
        }
        
    }
    
}


function show_polygon(level,name){
    if(level==1){
        for (var i = 0,aLen = areaArr.length; i < aLen; i++) {
            //console.log(areaArr[i]);
            polygon(areaArr[i].area.points,areaArr[i].area.name,1);
            dblclick_flag=0;
        }
    }else if(level==2){
        //根据name的省市
        console.log(name);
    }
    
    
}

function openInfo(content,e){
    var point = e.lnglat;
    marker = new T.Marker(point);// 创建标注
    var markerInfoWin = new T.InfoWindow(content,{offset:new T.Point(0,-30)}); // 创建信息窗口对象
    map.openInfoWindow(markerInfoWin,point); //开启信息窗口
    //console.log(marker);
}