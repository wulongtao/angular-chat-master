/**
 * Created by raid on 2016/12/5.
 */
angular.module('mapService', ['dataService']).factory('mapService', function (dataService) {

    var amap = {
        map : null,
        geolocation : null,
        geocoder : null,
        inputId : null,
        autocomplete : null,
        inputAddress : null,


        init : init, //初始化地图
        m : m,
        bindSearchInput : bindSearchInput,
        locate : locate,
        _bindLngLat : _bindLngLat,
        markPoint : markPoint,
        bindClickEvent : bindClickEvent,
        locate : locate,
        address : address,
    };

    return amap;

    function init(opts) {
        if(!opts) return ;
        this.inputId = opts.inputId;
        this.containerId = opts.containerId;
        this.m(this.containerId);
        this.bindSearchInput(this.inputId);
        this.locate();
        this.bindClickEvent();

    }


    /**
     * 创建或者获取
     */
    function m(containerId) {
        if (this.map == null) {
            this.map = new AMap.Map(containerId, {
                resizeEnable: true,
                zoom: 17,//地图显示的缩放级别
                keyboardEnable: false
            });
        }
        return this.map;
    }

    /**
     * 绑定输入提示的input标签
     */
    function bindSearchInput(inputId) {
        var objThis = this;
        if (this.map == null) {
            return false;
        }
        //this.inputId = inputId;
        AMap.plugin(['AMap.Autocomplete','AMap.PlaceSearch'],function() {
            var autoOptions = {
                input: inputId//使用联想输入的input的id
            };
            objThis.autocomplete= new AMap.Autocomplete(autoOptions);
            AMap.event.addListener(objThis.autocomplete, "select", function(e) {
                //TODO 针对选中的poi实现自己的功能
                var lat = e.poi.location.lat;
                var lng = e.poi.location.lng;
                objThis.markPoint(lng, lat);
                objThis._bindLngLat(lat, lng);
                objThis.inputAddress = e.poi.district + e.poi.name;
                dataService.uiVar.queSend.address = objThis.inputAddress;
            });
        });
    }

    function _bindLngLat(lat, lng) {
        if (this.inputAddress != null) {
            this.inputAddress = null;
        }
        dataService.uiVar.queSend.lat = lat;
        dataService.uiVar.queSend.lng = lng;
        /*var inputId = this.inputId;
        if (inputId != null) {
            var elem = document.getElementById(inputId);
            elem.setAttribute('data-lat', lat);
            elem.setAttribute('data-lng', lng);
        }*/
    }

    /**
     * 设置地图标记,并重新指定地图中心
     */
    function markPoint(lat, lng, isCenter) {
        if (this.inputAddress != null) {
            this.inputAddress = null;
        }
        if (this.map == null) {
            return false;
        }
        //清除之前的Marker
        this.map.clearMap();
        // 设置缩放级别和中心点
        if (isCenter || isCenter === undefined) {
            this.map.setCenter([lat, lng]);
        }
        this._bindLngLat(lng, lat);
        var marker = new AMap.Marker({
            map: this.map,
            position: [lat, lng],
        });
    }

    /**
     * 绑定鼠标点击事件，获取点击的经纬度并且Mark
     */
    function bindClickEvent() {
        var objThis = this;
        if (objThis.inputAddress != null) {
            objThis.inputAddress = null;
        }

        if (this.map == null) {
            return false;
        }
        return this.map.on('click', function(e) {
            var lat = e.lnglat.getLat();
            var lng = e.lnglat.getLng();
            objThis.markPoint(lng, lat/*, false*/);
            return objThis.address(e.lnglat);
        })
    }

    /**
     * 定位到当前所在位置,浏览器定位会出现定位不准确问题
     */
    function locate() {
        if (this.inputAddress != null) {
            this.inputAddress = null;
        }
        var objThis = this;
        if (this.map == null) {
            return false;
        }
        return this.map.plugin('AMap.Geolocation', function() {
            if (objThis.geolocation == null) {
                objThis.geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true,//是否使用高精度定位，默认:true
                    timeout: 10000,          //超过10秒后停止定位，默认：无穷大
                    maximumAge: 0,           //定位结果缓存0毫秒，默认：0
                    convert: true,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
                    showButton: true,        //显示定位按钮，默认：true
                    buttonPosition: 'LB',    //定位按钮停靠位置，默认：'LB'，左下角
                    buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
                    showMarker: true,        //定位成功后在定位到的位置显示点标记，默认：true
                    showCircle: true,        //定位成功后用圆圈表示定位精度范围，默认：true
                    panToLocation: true,     //定位成功后将定位到的位置作为地图中心点，默认：true
                    zoomToAccuracy:true      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
                });
            }

            objThis.map.addControl(objThis.geolocation);
            //this.geolocation.getCurrentPosition();
            //返回定位信息
            AMap.event.addListener(objThis.geolocation, 'complete', function(data) {
                objThis.markPoint(data.position.getLng(), data.position.getLat());
                return objThis.address(data.position);
            });
            //返回定位出错信息
            AMap.event.addListener(objThis.geolocation, 'error', function(data) {
                console.log("定位失败");
                return false;
            });

        });
    }

    /**
     * 根据经纬度获取地址
     */
    function address(lnglat) {
        if (this.inputAddress != null) {
            this.inputAddress = null;
        }
        var objThis = this;
        if (!lnglat) {
            return false;
        }
        if (this.geocoder == null) {
            AMap.plugin('AMap.Geocoder',function() {
                objThis.geocoder = new AMap.Geocoder({});
            });
        }

        return this.geocoder.getAddress(lnglat, function(status, result) {
            if (status == 'complete') {
                //如果有绑定input标签，那么设置input标签的内容
                var address = result.regeocode.formattedAddress;
                if (objThis.inputId != null) {
                    document.getElementById(objThis.inputId).value = address;
                }
                dataService.uiVar.queSend.address = address;
                return address;
            } else {
                return false;
            }
        })

    }

});