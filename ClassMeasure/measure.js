DUtil = {};
DUtil.extend = function (destination, source) {
    destination = destination || {};
    if (source) {
        for (var property in source) {
            var value = source[property];
            if (value !== undefined) {
                destination[property] = value;
            }
        }
        var sourceIsEvt = typeof window.Event == "function" && source instanceof window.Event;
        if (!sourceIsEvt && source.hasOwnProperty && source.hasOwnProperty('toString')) {
            destination.toString = source.toString;
        }
    }
    return destination;
};
DUtil.getDistanceInEarth = function (point1, point2) {
    var d = new Number(0);
    //1度等于0.0174532925199432957692222222222弧度
    //var radPerDegree=0.0174532925199432957692222222222;
    var radPerDegree = Math.PI / 180.0;
    if (DCI.Measure.map.spatialReference.wkid == "4326") {
        //		var dlon = (point2.x - point1.x) * radPerDegree;
        //		var dlat = (point2.y - point1.y) * radPerDegree;
        //		var len_geo = Math.pow(Math.sin(dlat/2),2) + Math.cos(point1.y) * Math.cos(point2.y) * Math.pow(Math.sin(dlon/2),2);
        //		len_geo = Math.abs(Math.min(1,len_geo));
        //		var c = 2 * Math.atan2(Math.sqrt(len_geo),Math.sqrt(1-len_geo));
        //		d = c * 6371008.77141506;
        var latLength1 = Math.abs(this.translateLonLatToDistance({ x: point1.x, y: point2.y }).x - this.translateLonLatToDistance({ x: point2.x, y: point2.y }).x);
        var latLength2 = Math.abs(this.translateLonLatToDistance({ x: point1.x, y: point1.y }).x - this.translateLonLatToDistance({ x: point2.x, y: point1.y }).x);
        var lonLength = Math.abs(this.translateLonLatToDistance({ x: point1.x, y: point2.y }).y - this.translateLonLatToDistance({ x: point1.x, y: point1.y }).y);
        d = Math.sqrt(Math.pow(lonLength, 2) - Math.pow(Math.abs(latLength1 - latLength2) / 2, 2) + Math.pow(Math.abs(latLength1 - latLength2) / 2 + Math.min(latLength1, latLength2), 2));
    }
    else {
        var len_prj = Math.pow((point2.x - point1.x), 2) + Math.pow((point2.y - point1.y), 2);
        d = Math.sqrt(len_prj);
    }
    d = Math.ceil(d);
    return d;
};
DUtil.translateLonLatToDistance = function (point) {
    var d = new Number(0);
    //1度等于0.0174532925199432957692222222222弧度
    //var radPerDegree=0.0174532925199432957692222222222;
    var radPerDegree = Math.PI / 180.0;
    var equatorialCircumference = Math.PI * 2 * 6378137;

    return {
        x: Math.cos(point.y * radPerDegree) * equatorialCircumference * Math.abs(point.x / 360),
        y: equatorialCircumference * Math.abs(point.y / 360)
    };
};
//******求三角形面积****
DUtil.getTriangleArea = function (point1, point2, point3) {
    var area = 0;

    if (!point1 || !point2 || !point3) {
        return 0;
    }

    if (DCI.Measure.map.spatialReference.wkid == "4326") {

        point1 = this.translateLonLatToDistance(point1);
        point2 = this.translateLonLatToDistance(point2);
        point3 = this.translateLonLatToDistance(point3);
        //        var edge1 = Math.sqrt(Math.pow((point2.x - point1.x),2) + Math.pow((point2.y - point1.y),2));
        //        var edge2 = Math.sqrt(Math.pow((point3.x - point2.x),2) + Math.pow((point3.y - point2.y),2));
        //        var edge3 = Math.sqrt(Math.pow((point1.x - point3.x),2) + Math.pow((point1.y - point3.y),2));
    }
    //point1 = pointAreaProj, point2 = pointAreaArrProj[clickAreaNum], point3 = pointAreaArrProj[0]

    //area = (point1.x - point2.x) * (point1.y + point2.y) / 2 + (point3.x - point1.x) * (point3.y + point1.y) / 2;
    area = ((point1.x * point2.y - point2.x * point1.y) + (point2.x * point3.y - point3.x * point2.y) + (point3.x * point1.y - point1.x * point3.y)) / 2;

    return area;
};
DCIMapAction = {
    ZOOMIN: "action_zoomin",
    ZOOMOUT: "action_zoomout",
    PAN: "action_pan",
    DISTANCE: "action_distance",
    AREA: "action_area"
};
DCIMeatureType = {
    DISTANCE: "distance",
    AREA: "area"
};
DCIMeatureUnit = {
    HECTARE: "HECTARE",
    SMETER: "SMETER",
    SKILOMETER: "SKILOMETER",
    ACRES: "ACRES"
};
DObject = function () {
    var Class = function () {
        if (arguments && arguments[0] != null) {
            this.construct.apply(this, arguments);
        }
    };
    var extended = {};
    var parent;
    for (var i = 0, len = arguments.length; i < len; ++i) {
        if (typeof arguments[i] == "function") {
            parent = arguments[i].prototype;
        } else {
            parent = arguments[i];
        }
        DUtil.extend(extended, parent);
    }
    Class.prototype = extended;
    return Class;
};
if (typeof DCI == "undefined") { var DCI = {}; }
DCI.Measure = {
    /**
     * 全局变量
    */
    map: null,//地图对象
    meatureTool: null,
    onDrawEnd: null,
    drawToolbar: null,
    markerSymbol: null,
    lineSymbol: null,
    fillSymbol: null,
    /**
     * 初始化加载部分
    */
    Init: function (map) {
        DCI.Measure.map = map;
        this.markerSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 8, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 69, 0]), 2), new dojo.Color([255, 255, 255, 1]));
        this.lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 160, 122]), 2);
        this.fillSymbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 160, 122]), 2), new dojo.Color([255, 255, 255, 0.5]));
        DCI.Measure._initDrawTool();
        DCI.Measure.meatureTool = new DCIMeature(map);
    },
    _initDrawTool: function () {
        var T = this;
        this.drawToolbar = new esri.toolbars.Draw(DCI.Measure.map, { showTooltips: false });
        this.drawToolbar.markerSymbol = this.markerSymbol;
        this.drawToolbar.lineSymbol = this.lineSymbol;
        this.drawToolbar.fillSymbol = this.fillSymbol;

        dojo.connect(this.drawToolbar, "onDrawEnd", function (geometry) {
            if (T.onDrawEnd) {
                T.onDrawEnd(geometry);
            }
        });
    },
    //动态测距
    measureDistance: function () {
        //this.setMapCursor("url('" + getRootPath() + "Content/images/measure/ruler.cur'),auto");
        this.setMapCursor("url('./Content/images/measure/ruler.cur'),auto");
        this.meatureTool.activate(DCIMeatureType.DISTANCE);
        this.actionMode = DCIMapAction.DISTANCE;
    },
    //动态测面积
    measureArea: function () {
        //this.setMapCursor("url('" + DCIMapAPIPath + "images/cursor/ruler.cur'),auto");
        this.setMapCursor("url('./Content/images/measure/ruler.cur'),auto");
        this.meatureTool.activate(DCIMeatureType.AREA, DCIMeatureUnit.SKILOMETER);
        this.actionMode = DCIMapAction.AREA;
    },
    //设置当鼠标在地图上时的游标样式
    setMapCursor: function (cursor) {
        DCI.Measure.map.setMapCursor(cursor);
    },
    drawPolyline: function (symbol, onDrawEnd) {
        this.onDrawEnd = onDrawEnd;
        if (symbol) {
            this.drawToolbar.lineSymbol = symbol;
        }
        this.drawToolbar.activate(esri.toolbars.Draw.POLYLINE);
        this.disablePan();
    },
    disablePan: function () {
        this.map.disablePan();
    },
    deactivateDraw: function () {
        this.drawToolbar.deactivate();
        this.onDrawEnd = null;
        this.enablePan();
    },
    enablePan: function () {
        this.map.enablePan();
    },


}

DCIMeature = DObject({
    _dciMap: null,
    _meatureType: null,
    _isEnd: true,

    _DPoints: [], //测距坐标点
    _DClickNum: -1,
    _DCount: 0, //总共测距的次数
    _DGraphic: null,
    _DGraphics: [], //二维数组，用来存储每次测距的各图形信息
    _length: 0, //测距单段距离
    _lastLength: 0, //当前点与第一个点的距离
    _lengthZ: 0, //累计长度
    _DDelGraphics: [], //删除按钮

    _APoints: [],
    _AClickNum: -1,
    _ACount: 0, //总共测距的次数
    _AGraphic: null,
    _AGraphicLabel: null,
    _AGraphicLabels: [],
    _AGraphics: [],
    _geoPloygon: null,  //面几何
    _areaZ: 0,
    areaUnit: DCIMeatureUnit.HECTARE, //hectare(公顷),squareMeter(平方米),squareKiloMeters(平方公里),acres(亩)；一亩:666.7平方米，一公顷:10000平方米，一平方公里:1000000平方米
    _ADelGraphics: [],

    _drawToolbar: null,
    _onClickHandler_connect: null,
    _onMouseMoveHandler_connect: null,
    _onGraphicClickHandler_connect: null,
    _graphicsLayer: null,
    construct: function (map) {
        this._dciMap = map;

        this._onClickHandler = dojo.hitch(this, this._onClickHandler);
        this._onMouseMoveHandler = dojo.hitch(this, this._onMouseMoveHandler);
        this._onDrawEndHandler = dojo.hitch(this, this._onDrawEndHandler);
        this._onExtentChangeHandler = dojo.hitch(this, this._onExtentChangeHandler);
        this._onGraphicClearHandler = dojo.hitch(this, this._onGraphicClearHandler);

        this._graphicsLayer = new esri.layers.GraphicsLayer({ id: "DciMeatureGLyr" });
    },
    activate: function (type, unit) {
        if (this._isEnd == true) {
            if (unit) {
                this.areaUnit = unit;
            }
            //var lyr = this._dciMap.esriMap.getLayer(this._graphicsLayer.id);
            var lyr = this._dciMap.getLayer(this._graphicsLayer.id);
            if (!lyr) {
                //this._dciMap.esriMap.addLayer(this._graphicsLayer);
                this._dciMap.addLayer(this._graphicsLayer);
            }
            //var _esriMap = this._dciMap.esriMap;
            var _esriMap = this._dciMap;
            //this._drawToolbar.activate(esri.toolbars.Draw.POLYLINE);
            //this._dciMap.drawPolyline(null, this._onDrawEndHandler);
            //this._dciMap.disablePan();
            DCI.Measure.drawPolyline(null, this._onDrawEndHandler);
            DCI.Measure.disablePan();

            this._onClickHandler_connect = dojo.connect(_esriMap, "onClick", this, "_onClickHandler");
            this._onMouseMoveHandler_connect = dojo.connect(_esriMap, "onMouseMove", this, "_onMouseMoveHandler");
            this._onGraphicClickHandler_connect = dojo.connect(this._graphicsLayer, "onClick", this, "_onGraphicClearHandler");
            this._isEnd = false;
        } else {
            if (this._meatureType != type) {
                this.deactivate();
                this.activate(type, unit);
            }
        }
        this._meatureType = type;
    },
    deactivate: function () {
        this.terminate();
        dojo.disconnect(this._onClickHandler_connect);
        dojo.disconnect(this._onMouseMoveHandler_connect);
        //dojo.disconnect(this._onGraphicClickHandler_connect);
        //this._dciMap.enablePan();
        //this._dciMap.deactivateDraw();
        DCI.Measure.enablePan();
        DCI.Measure.deactivateDraw();
        var div = document.getElementById("pointOutDiv");
        if (div) {
            div.parentNode.removeChild(div);
        }
    },

    _onClickHandler: function (evt) {
        evt = evt ? evt : (window.event ? window.event : null);
        var pt = evt.mapPoint;
        var text = "起点";
        if (this._meatureType == DCIMeatureType.DISTANCE) {
            if (this._DClickNum == -1) {
                this._DCount++;
                this._DGraphics[this._DCount - 1] = [];
            } else {
                this._lengthZ += this._length;
                text = this._lengthZ < 1000 ? parseInt(this._lengthZ) + "米" : ((this._lengthZ) / 1000).toFixed(1) + "公里";
            }
            var textSymbol = new esri.symbol.TextSymbol(text).setColor(new dojo.Color([0, 0, 0])).setAlign(esri.symbol.Font.ALIGN_START).setOffset(6, 6).setFont(new esri.symbol.Font("10pt").setWeight(esri.symbol.Font.WEIGHT_BOLD));
            var graphicsText = new esri.Graphic(pt, textSymbol);
            this._graphicsLayer.add(graphicsText);
            this._DGraphics[this._DCount - 1].push(graphicsText);

            this._DPoints.push(pt); //把一次测距中的点存入点临时数组中
            this._DClickNum++; //一次测距点的个数
        } else if (this._meatureType == DCIMeatureType.AREA) {
            if (this._AClickNum == -1) {
                //创建一个面
                this._geoPloygon = new esri.geometry.Polygon(this._dciMap.spatialReference);
                this._geoPloygon.addRing([[pt.x, pt.y], [pt.x, pt.y]]);
                //this._AGraphic = new esri.Graphic(this._geoPloygon, this._dciMap.fillSymbol);
                this._AGraphic = new esri.Graphic(this._geoPloygon, DCI.Measure.fillSymbol);
                this._graphicsLayer.add(this._AGraphic);

                this._ACount++;
                this._AGraphics.push(this._AGraphic);

                var textSymbol = new esri.symbol.TextSymbol(text).setColor(new dojo.Color([0, 0, 0])).setAlign(esri.symbol.Font.ALIGN_START).setOffset(6, 6).setFont(new esri.symbol.Font("10pt").setWeight(esri.symbol.Font.WEIGHT_BOLD));
                var graphicLabel = new esri.Graphic(pt, textSymbol);
                this._graphicsLayer.add(graphicLabel);
                this._AGraphicLabels.push(graphicLabel);
            } else {
                //面积
                var areaZmove = this._areaZ + DUtil.getTriangleArea(pt, this._APoints[this._AClickNum], this._APoints[0]);
                this._areaZ = areaZmove;
                var areaUnit = this.areaUnit;
                var areaWithUnit = "";
                if (areaUnit == DCIMeatureUnit.HECTARE) {
                    areaWithUnit = "面积:" + ((Math.abs(areaZmove) / 10000) > 1 ? (Math.abs(areaZmove) / 10000).toFixed(2) : (Math.abs(areaZmove) / 10000).toFixed(4)) + "公顷";
                } else if (areaUnit == DCIMeatureUnit.SMETER) {
                    areaWithUnit = "面积:" + parseInt(Math.abs(areaZmove)) + "平方米";
                } else if (areaUnit == DCIMeatureUnit.SKILOMETER) {
                    if (Math.abs(areaZmove) / 1000000 > 1) {
                        areaWithUnit = "面积:" + (Math.abs(areaZmove) / 1000000).toFixed(3) + "平方公里";
                    } else {
                        areaWithUnit = "面积:" + parseInt(Math.abs(areaZmove)) + "平方米";
                    }
                } else if (areaUnit == DCIMeatureUnit.ACRES) {
                    areaWithUnit = "面积:" + ((Math.abs(areaZmove) / 666.7) > 1 ? (Math.abs(areaZmove) / 666.7).toFixed(1) : (Math.abs(areaZmove) / 666.7).toFixed(2)) + "亩";
                }

                text = areaWithUnit;
                var graphicLabel = null;
                if (this._AGraphicLabels.length >= this._ACount) {
                    graphicLabel = this._AGraphicLabels[this._ACount - 1];
                    graphicLabel.setGeometry(pt);
                    var textSymbol2 = new esri.symbol.TextSymbol(text).setColor(new dojo.Color([0, 0, 0])).setAlign(esri.symbol.Font.ALIGN_START).setOffset(6, 6).setFont(new esri.symbol.Font("10pt").setWeight(esri.symbol.Font.WEIGHT_BOLD));
                    graphicLabel.setSymbol(textSymbol2);
                }
                this._geoPloygon.insertPoint(0, this._geoPloygon.rings[0].length - 1, pt);
                this._AGraphic.setGeometry(this._geoPloygon);
            }
            this._AClickNum++;
            this._APoints.push(pt);
        }
    },
    _onMouseMoveHandler: function (evt) {
        evt = evt ? evt : (window.event ? window.event : null);
        if (this._meatureType == DCIMeatureType.DISTANCE) {
            this._pointOutDbClickEnd(evt.clientX + 10, evt.clientY + 10, "单击确定起点");
            var pt = evt.mapPoint;
            if (this._DClickNum != -1) {
                this._length = DUtil.getDistanceInEarth(pt, this._DPoints[this._DClickNum]);
                if ((this._lengthZ + this._length) < 1000) {
                    this._pointOutDbClickEnd(evt.clientX + 10, evt.clientY + 10, (this._lengthZ + this._length).toFixed(0) + "米<br/>单击确定地点，双击结束");
                } else {
                    this._pointOutDbClickEnd(evt.clientX + 10, evt.clientY + 10, ((this._lengthZ + this._length) / 1000).toFixed(1) + "公里<br/>单击确定地点，双击结束");
                }
            }
        } else if (this._meatureType == DCIMeatureType.AREA) {
            var pt = evt.mapPoint;
            if (this._AClickNum != -1) {
                var areaZmove = this._areaZ + DUtil.getTriangleArea(pt, this._APoints[this._AClickNum], this._APoints[0]);
                var areaWithUnit = "";
                var areaUnit = this.areaUnit;
                if (areaUnit == DCIMeatureUnit.HECTARE) {
                    areaWithUnit = "面积:" + ((Math.abs(areaZmove) / 10000) > 1 ? (Math.abs(areaZmove) / 10000).toFixed(2) : (Math.abs(areaZmove) / 10000).toFixed(4)) + "公顷";
                } else if (areaUnit == DCIMeatureUnit.SMETER) {
                    areaWithUnit = "面积:" + parseInt(Math.abs(areaZmove)) + "平方米";
                } else if (areaUnit == DCIMeatureUnit.SKILOMETER) {
                    if (Math.abs(areaZmove) / 1000000 > 1) {
                        areaWithUnit = "面积:" + (Math.abs(areaZmove) / 1000000).toFixed(3) + "平方公里";
                    } else {
                        areaWithUnit = "面积:" + parseInt(Math.abs(areaZmove)) + "平方米";
                    }
                } else if (areaUnit == DCIMeatureUnit.ACRES) {
                    areaWithUnit = "面积:" + ((Math.abs(areaZmove) / 666.7) > 1 ? (Math.abs(areaZmove) / 666.7).toFixed(1) : (Math.abs(areaZmove) / 666.7).toFixed(2)) + "亩";
                }
                this._pointOutDbClickEnd(evt.clientX + 10, evt.clientY + 10, areaWithUnit + "<br/>单击确定地点，双击结束");
            }
        }
    },
    _onDrawEndHandler: function (geometry) {
        switch (this._meatureType) {
            case DCIMeatureType.DISTANCE:
                //var graphic = new esri.Graphic(geometry, this._dciMap.lineSymbol);
                var graphic = new esri.Graphic(geometry, DCI.Measure.lineSymbol);
                this._graphicsLayer.add(graphic);
                this._DGraphics[this._DCount - 1].push(graphic);
                this._checkDistance();
                break;
            case DCIMeatureType.AREA:
                this._checkArea();
                break;
        }
        this._isEnd = true; //正常结束
        this.deactivate();
        //this._dciMap.setMapCursor("auto");
        DCI.Measure.setMapCursor("auto");
    },
    //终止,在测量未完成的情况下，进行其他操作（如拉框放大、缩小）导致测量结束（漫游除外）
    terminate: function () {
        if (this._isEnd == false) {
            if (this._meatureType == DCIMeatureType.DISTANCE) {
                var len = this._DCount;
                if (len > 0) {
                    for (var j = this._DGraphics[len - 1].length - 1; j >= 0; j--) {
                        this._graphicsLayer.remove(this._DGraphics[len - 1][j]);
                    }
                    this._DGraphics.pop();
                    this._DClickNum = -1;
                    this._DPoints = [];
                    this._length = 0;
                    this._lengthZ = 0;
                    this._DCount--;
                }
            } else if (this._meatureType == DCIMeatureType.AREA) {
                var len = this._ACount;
                if (len > 0) {
                    this._graphicsLayer.remove(this._AGraphics[len - 1]);
                    this._graphicsLayer.remove(this._AGraphicLabels[len - 1]);
                    this._AGraphics.pop();
                    this._AGraphicLabels.pop();
                    this._area = 0;
                    this._areaZ = 0;
                    this._APoints = [];
                    this._AClickNum = -1;
                    this._length = 0;
                    this._lengthZ = 0;
                    this._geoPolygon = null;
                    this._ACount--;
                }
            }
            this._isEnd = true;
        }
    },
    //清除所有
    clearAll: function () {
        this.deactivate();
        //清除测距
        for (var i = 0; i < this._DCount; i++) {
            for (var j = this._DGraphics[i].length - 1; j >= 0; j--) {
                this._graphicsLayer.remove(this._DGraphics[i][j]);
            }
            this._graphicsLayer.remove(this._DDelGraphics[i]);
        }
        this._DPoints = [];
        this._DClickNum = -1;
        this._DCount = 0;
        this._DGraphic = null;
        this._DGraphics = [];
        this._length = 0;
        this._lengthZ = 0;
        this._DDelGraphics = [];

        //清除测面积
        for (var i = 0; i < this._ACount; i++) {
            this._graphicsLayer.remove(this._AGraphics[i]);
            this._graphicsLayer.remove(this._AGraphicLabels[i]);
            this._graphicsLayer.remove(this._ADelGraphics[i]);
        }
        this._AGraphics = [];
        this._ADelGraphics = [];
        this._AGraphicLabels = [];
        this._APoints = [];
        this._AClickNum = -1;
        this._ACount = 0;
        this._AGraphic = null;
        this._geoPloygon = null;
        this._areaZ = 0;
        this.areaUnit = "hectare";


        var div = document.getElementById("pointOutDiv");
        if (div) {
            div.parentNode.removeChild(div);
        }
        //this._dciMap.setMapCursor("auto");
        DCI.Measure.setMapCursor("auto");
    },

    //选择清除
    _onGraphicClearHandler: function (evt) {
        dojo.stopEvent(evt);
        //清除选中的测距元素
        if (this._DCount > 0) {
            var grap = evt.graphic;
            for (var i = 0; i < this._DCount; i++) {
                if (grap == this._DDelGraphics[i]) {
                    for (var j = this._DGraphics[i].length - 1; j >= 0; j--) {
                        this._graphicsLayer.remove(this._DGraphics[i][j]);
                    }
                    this._graphicsLayer.remove(this._DDelGraphics[i]);
                    this._DGraphics.splice(i, 1);
                    this._DDelGraphics.splice(i, 1);
                    this._DCount--;
                    return;
                }
            }
        }

        //清除选中的测面积元素
        if (this._ACount > 0) {
            var grap = evt.graphic;
            for (var i = 0; i < this._ACount; i++) {
                if (grap == this._ADelGraphics[i]) {
                    this._graphicsLayer.remove(this._AGraphics[i]);
                    this._graphicsLayer.remove(this._AGraphicLabels[i]);
                    this._graphicsLayer.remove(this._ADelGraphics[i]);
                    this._AGraphicLabels.splice(i, 1);
                    this._AGraphics.splice(i, 1);
                    this._ADelGraphics.splice(i, 1);
                    this._ACount--;
                    break;
                }
            }
        }
    },
    _pointOutDbClickEnd: function (x, y, label) {
        var tipDiv = document.getElementById("pointOutDiv");
        if (!tipDiv) {
            tipDiv = document.createElement("div");
            tipDiv.id = "pointOutDiv";
            tipDiv.style.position = "absolute";
            tipDiv.style.height = "40px";
            tipDiv.style.zIndex = 800;
            tipDiv.style.left = x + "px";
            tipDiv.style.right = "auto";
            tipDiv.style.top = y + "px";
            tipDiv.style.bottom = "auto";
            tipDiv.innerHTML = "<span style='text-decoration:none;font-size:12px;color:#393939;display:inline-block;float;left;border:1px solid #33A1C9;background-color: white;'>" + label + "</span>";
            document.body.appendChild(tipDiv);
        } else {
            tipDiv.innerHTML = "<span style='text-decoration:none;font-size:12px;color:#393939;display:inline-block;float;left;border:1px solid #33A1C9;background-color: white;'>" + label + "</span>";
            tipDiv.style.left = x + "px";
            tipDiv.style.top = y + "px";
            tipDiv.style.display = "block";
        }
    },
    //测量距离
    _calculateLength: function (pInPoints) {
        var pts = pInPoints.length;
        var dLen = new Number(0);
        var pt0 = pInPoints[0];

        for (var i = 1; i < pts; i++) {
            pt1 = pInPoints[i];
            if (pt0.length > 0) {
                pt0 = new esri.geometry.Point(pt0[0], pt0[1], this._dciMap.spatialReference);
            }
            if (pt1.length > 0) {
                pt1 = new esri.geometry.Point(pt1[0], pt1[1], this._dciMap.spatialReference);
            }
            dLen += DUtil.getDistanceInEarth(pt0, pt1);
            pt0 = pt1;
        }
        return Math.abs(Math.ceil(dLen));
    },
    //处理测距结果
    _checkDistance: function () {
        var pt = this._DPoints[this._DPoints.length - 1];
        if (this._DCount > 0) {
            //var url = getRootPath() + "Content/images/measure/shanchu.png";
            var url = "./Content/images/measure/shanchu.png";
            var delGraphic = new esri.Graphic(pt, new esri.symbol.PictureMarkerSymbol(url, 16, 16).setOffset(10, -10));
            this._graphicsLayer.add(delGraphic);
            this._DDelGraphics.push(delGraphic);
        }
        this._DClickNum = -1;
        this._DPoints = [];
        this._length = 0;
        this._lengthZ = 0;
    },
    _checkArea: function () {
        if (this._APoints.length != 1) {
            var pt = this._APoints[this._APoints.length - 1];
            if (this._ACount > 0) {
                //var url = DCIMapAPIPath + "images/shanchu.png";
                //var url = getRootPath() + "Content/images/measure/shanchu.png";
                var url = "./Content/images/measure/shanchu.png";
                var delGraphic = new esri.Graphic(pt, new esri.symbol.PictureMarkerSymbol(url, 16, 16).setOffset(10, -10));
                this._graphicsLayer.add(delGraphic);
                this._ADelGraphics.push(delGraphic);
            }
        } else {
            this._ACount--;;
            textDivArr1.remove(textDivArr1[areaNum]);
        }
        this._area = 0;
        this._areaZ = 0;
        this._APoints = [];
        this._AClickNum = -1;
        this._length = 0;
        this._lengthZ = 0;
        this._geoPolygon = null;
    }
});