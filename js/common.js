/**
 * 此模块存放一些公共的方法
 * Created by raid on 2016/11/17.
 */
angular.module('common', ['toaster', 'ngAnimate']).factory('common', function (toaster) {
    var common = {
        toast : toast,
        isValid : isValid,
        htmlToPlaintext : htmlToPlaintext,
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
        } else {
            value = value && param;
        }

        return value;
    };

    /**
     * 去掉内容中的tags
     */
    function htmlToPlaintext(text) {
        return text ? String(text).replace(/<[^>]+>/gm, '') : '';
    };


    return common;
});
