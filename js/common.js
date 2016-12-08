/**
 * 此模块存放一些公共的方法
 * Created by raid on 2016/11/17.
 */
angular.module('common', ['toaster', 'angular-web-notification', 'oitozero.ngSweetAlert', 'ngAnimate']).factory('common', function (toaster, webNotification, SweetAlert, $window) {
    var common = {
        toast : toast, //toast消息
        swal : swal, //sweet alert弹出框
        isValid : isValid, //判断参数是否为空
        htmlToPlaintext : htmlToPlaintext, //去掉字符串中的html标签
        getCurrentTime : getCurrentTime, //获取当前时间
        removeBlank : removeBlank, //去除空格
        showNotification : showNotification, //notification
    };

    /**
     * toaster封装
     * @param type success,info,error
     * @param body 内容
     */
    function toast(type, body) {
        toaster.pop({
            type: type, body: body});
    };
    
    function swal(type, text, callback, cancelCallback) {
        callback = callback !== 'undefined' ? callback : undefined;
        cancelCallback = cancelCallback !== 'undefined' ? cancelCallback : undefined;
        switch (type) {
            case 'confirm' :
                SweetAlert.swal({
                        title: "",
                        text: text,
                        showCancelButton: true,
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                        closeOnConfirm: true},
                    function(isConfirm){
                        if (isConfirm) callback && callback();
                        else if (!isConfirm && cancelCallback!==undefined) {
                            cancelCallback && cancelCallback();
                        }
                    });
                break;

            case 'image':
                SweetAlert.swal({
                    title: "<div style='overflow: scroll;max-height: 500px;'><img src='"+text+"'></div>",
                    // text: 'A custom <span style="color:#F8BB86">html<span> message.',
                    html: true});
                break;
        }

    }

    /**
     * 判断字段是否为 ''、null、undefined
     * @param param 某个值或者数组
     * @returns {boolean}
     */
    function isValid(param) {
        var value = true;
        if (Array.isArray(param)) {
            for (var i = 0; i < param.length; i++) {
                value = value && param[i];
            }
        } else if (/^[\],:{}\s]*$/.test(JSON.stringify(param).replace(/\\["\\\/bfnrtu]/g, '@').
            replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
            replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) { //判断是否是json数组
            for (var k in param) {
                value = value && param[k];
            }
        } else {
            value = value && param;
        }

        return value;
    };

    /**
     * 去掉内容中的tags
     */
    function htmlToPlaintext(text) {
        var dom = document.createElement("span");
        dom.innerHTML = text;
        return dom.innerText;
    };

    function escapeHtml(string) {
        var entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;',
            "'": '&#39;',
            "/": '&#x2F;'
        };
        return String(string).replace(/[&<>"'\/]/g, function (s) {
            return entityMap[s];
        });
    }

    function getCurrentTime() {
        return parseInt(new Date().getTime() / 1000);
    }
    
    function removeBlank(str) {
        return str.replace(/&nbsp;/g, "");
    }

    function showNotification(text, callback) {
        callback = callback !== 'undefined' ? callback : undefined;
        webNotification.showNotification('您有新的消息', {
            body: text,
            icon: 'http://weida.products-test.zhuzhu.com/static/images/ma-operator/login-logo.png',
            onClick: function onNotificationClicked() {
                $window.focus();
                webNotification.hideNotification();
                if (callback !== undefined) callback&&callback();
            },
            autoClose: 4000 //auto close the notification after 4 seconds (you can manually close it via hide function)
        }, function onShow(error, hide) {
            if (error) {
                common.toast('info', 'Unable to show notification: ' + error.message);
            } else {
                setTimeout(function hideNotification() {
                    hide(); //manually close the notification (you can skip this if you use the autoClose option)
                }, 5000);
            }
        });
    }

    return common;
});
