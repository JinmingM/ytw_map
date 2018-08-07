function onLoad() {
    map = new T.Map('mapDiv',{minZoom:4,maxZoom:10}); 
    map.centerAndZoom(new T.LngLat(start_LngLat.lng, start_LngLat.lat), zoom);
    mapbounds = map.getBounds();
    
    x_scale = (window.innerWidth)/(mapbounds.getNorthEast().lng-mapbounds.getSouthWest().lng);
    y_scale = (window.innerHeight)/(mapbounds.getNorthEast().lat-mapbounds.getSouthWest().lat);
    console.log(x_scale);
    //console.log(y_scale);
    geocode = new T.Geocoder();
    map.disableDoubleClickZoom();
    //map.disableContinuousZoom();
    

    add_x = 0;
    add_y = 0;
    //getMapBounds();
    lay_flag = 2;
    imageURL = "./css/bg.jpg";

    var lay = new T.TileLayer(imageURL, {minZoom: 4, maxZoom: 4,opacity:1,bounds:mapbounds});

    //console.log(lay);
    map.addLayer(lay);
    
    changeClass(lay_flag);
    //var list = new Array();
    //list = ytw_data.prlist;
    creatChart(ytw_data.prlist,"type1");

    //creatChart(ytw_data.prlist,1);

    //creatChart(ytw_data.prlist,2);

    createTable(ytw_data.prlist);

    

    map.addEventListener("load",function(e){
        console.log(lay_flag);
        clearOther(lay_flag);
    });
    map.addEventListener("movestart",function(e){
        if(this.getZoom()==4){
            clearOther(lay_flag);
        }
        
    });

    map.addEventListener("zoomend",function(e){
        if(this.getZoom()==4){     
            map.centerAndZoom(new T.LngLat(start_LngLat.lng, start_LngLat.lat),4);  
            //console.log(map.getCenter().lng);
            lay = new T.TileLayer(imageURL, {minZoom: 4, maxZoom: 4,opacity:1,bounds:mapbounds});
            
            showTable();
            //console.log(start_LngLat);
            map.addLayer(lay);
            
            lay_flag = 4;
            changeClass(lay_flag); 
        }

        if(this.getZoom()<=6 && this.getZoom()>4 && overlay_exist==0){

            map.removeLayer(lay);
            hideTable();
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
        //console.log(areaArr[i].area.name);
        polygon(areaArr[i].area.points,areaArr[i].area.name,1);
    }
    
}

function createTable(data){
    
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
    var winWidth = window.innerWidth*1.5;
    var winHeight = window.innerHeight*1.5;

    var target = getByClass(document,"tdt-tile-container tdt-zoom-animated");

    try{
        var target_children = target[num].children;
    
        //add_x = (now_LngLat.lng-start_LngLat.lng)*x_scale;
        //add_y = (now_LngLat.lat-start_LngLat.lat)*y_scale;//通过观察，每次的lay切换都会叠加的偏移，所以要+=
        add_x = -(window.innerWidth*0.3);
        add_y = -(window.innerHeight*0.3);
        var str = 0+"px,"+add_y+"px,0";
        console.log(str);
        for(var i=0;i< target_children.length;i++){
            if(i==0){
                console.log("change");
                target_children[i].setAttribute("style", "width: "+winWidth+"px; height: "+winHeight+"px; transform: translate3d("+str+"); opacity: 1;"); //"+str+"
            }else{
                try{
                    target_children[i].parentNode.removeChild(target_children[i]);
                    i=0;
                }catch(e){
                    console.log(e);
                }
            }
        }
        
        var target1 = getByClass(document,"tdt-control-copyright tdt-control");
        target1[0].setAttribute("style", "display:none");
    }catch(e){

    }  
}

function clearOther(num){//清除每次页面变动时多余的layer
    var target = getByClass(document,"tdt-tile-container tdt-zoom-animated");
    try{
        //console.log("clearOther");
        var target_children = target[num].children;
        
        for(var i=0;i< target_children.length;i++){
            //console.log(target_children[i]);
            if(i==0){

            }else{
                try{
                    target_children[i].parentNode.removeChild(target_children[i]);
                    i=0;
                }catch(e){
                    console.log(e);
                }  
            }
        }      
    }catch(e){

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
    
    return aResult;
}

function getMapBounds() {
    var bs = map.getBounds();       //获取可视区域
    var bssw = bs.getSouthWest();   //可视区域左下角
    var bsne = bs.getNorthEast();   //可视区域右上角
    
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
            map.closeInfoWindow();    
        });
        polygon.addEventListener("dblclick",function(e){
            if(timeoutID) {//取消上次延时未执行的方法
                timeoutID = clearTimeout(timeoutID);
            }
            
            if(map.getZoom()<7 &&!dblclick_flag){
                dblclick_flag=1;
                hide_polygon(true);
                map.centerAndZoom(new T.LngLat(e.lnglat.getLng(), e.lnglat.getLat()), 7);
                now_LngLat = e.lnglat;
                map.addEventListener("click",MapClick);
                addchild(name);
                hideTable();
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
    var markerInfoWin = new T.InfoWindow(content,{offset:new T.Point(0,-30)}); // 创建信息窗口对象
    map.openInfoWindow(markerInfoWin,point); //开启信息窗口

    //console.log(marker);
}

function Converter(e){
    var id=e.getAttribute("id");
    creatChart(ytw_data.prlist,id);
    //alert("Id: "+id);
}

function showTable(){
    $("#list").show();
    $("#table").show();
    $("#list-chart").show();
    $("#list-chart1").show();
    $("#list-chart2").show();
}

function hideTable(){
    $("#list").hide();
    $("#table").hide();
    $("#list-chart").hide();
    $("#list-chart1").hide();
    $("#list-chart2").hide();
}

function creatChart(list,type){
    //
    var myChart = echarts.init(document.getElementById('chart'));
    var myChart1 = echarts.init(document.getElementById('chart1'));
    var myChart2 = echarts.init(document.getElementById('chart2'));
    myChart.clear();
    //var dataAxis = ['点', '击', '柱', '子', '或', '者', '两', '指', '在', '触', '屏', '上', '滑', '动', '能', '够', '自', '动', '缩', '放'];
    //var data = [220, 182, 191, 234, 290, 330, 310, 123, 442, 321, 90, 149, 210, 122, 133, 334, 198, 123, 125, 220];
    var dataAxis = Array();
    var data = Array();
    var seriesData = Array();

    for(var i=0;i<list.length;i++){
        dataAxis.push(list[i].pr);
        data.push(list[i].num);
        seriesData.push({
            name: list[i].pr,
            value: list[i].num
        });
    }

    var yMax = 30;
    var dataShadow = [];

    for (var i = 0; i < data.length; i++) {
        dataShadow.push(yMax);
    }

    option = {

        xAxis: {
            data: dataAxis,
            axisLabel: {
                interval: 5,
                rotate: -60,
                textStyle: {
                    color: '#fff'
                }
            },
            axisTick: {
                show: false
            },
            axisLine: {
                show: false
            },
            z: 10
        },
        yAxis: {
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                textStyle: {
                    color: '#fff'
                }
            }
        },
        tooltip: {},
        dataZoom: [
            {
                type: 'inside'
            }
        ],
        series: [
            { // For shadow
                type: 'bar',
                itemStyle: {
                    normal: {color: 'rgba(0,0,0,0.05)'}
                },
                barGap:'-100%',
                barCategoryGap:'40%',
                data: dataShadow,
                animation: false
            },
            {
                type: 'bar',
                itemStyle: {
                    normal: {
                        color: new echarts.graphic.LinearGradient(
                            0, 0, 0, 1,
                            [
                                {offset: 0, color: '#83bff6'},
                                {offset: 0.5, color: '#188df0'},
                                {offset: 1, color: '#188df0'}
                            ]
                        )
                    },
                    emphasis: {
                        color: new echarts.graphic.LinearGradient(
                            0, 0, 0, 1,
                            [
                                {offset: 0, color: '#2378f7'},
                                {offset: 0.7, color: '#2378f7'},
                                {offset: 1, color: '#83bff6'}
                            ]
                        )
                    }
                },
                data: data
            }
        ]
    };

    option1 = {
        xAxis: {
            data: dataAxis,
            axisLabel: {
                interval: 5,
                rotate: -60,
                textStyle: {
                    color: '#fff'
                }
            },
            axisTick: {
                show: false
            },
            axisLine: {
                show: false
            },
            z: 10
        },
        yAxis: {
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                textStyle: {
                    color: '#fff'
                }
            }
        },
        tooltip: {},
        series: [{
            data: data,
            type: 'line'
        }]
    };
    option2 = {
        // polar: {},
        // angleAxis: {
        //     axisLabel: {
        //         interval: 5,
        //         rotate: -60,
        //         textStyle: {
        //             color: '#fff'
        //         }
        //     },
        // },
        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        series : [
            {
                name: '',
                type: 'pie',
                radius : '70%',
                center: ['50%', '60%'],
                data: seriesData,
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                label: {
                    //interval: 60,
                    show:false
                }
            }
        ]
    };
    //console.log(option2);
    // if(type=="type1"){
    //     myChart.setOption(option);
        
    // }else if(type=="type2"){
    //     myChart1.setOption(option1);
    // }else if(type=="type3"){
    //     myChart2.setOption(option2);
    // }
    myChart.setOption(option);
    myChart1.setOption(option1);
    myChart2.setOption(option2);
    // Enable data zoom when user click bar.
    var zoomSize = 6;
    myChart.on('click', function (params) {
        console.log(dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)]);
        myChart.dispatchAction({
            type: 'dataZoom',
            startValue: dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)],
            endValue: dataAxis[Math.min(params.dataIndex + zoomSize / 2, data.length - 1)]
        });
    });


}