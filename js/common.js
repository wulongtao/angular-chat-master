/**
 * 此模块存放一些公共的方法
 * Created by raid on 2016/11/17.
 */
angular.module('common', ['toaster', 'ngAnimate']).factory('common', function (toaster) {
    var common = {
        toast : toast,
        isValid : isValid,
        htmlToPlaintext : htmlToPlaintext,
        getCurrentTime : getCurrentTime,
        removeBlank : removeBlank,
        _escapeToUtf32 : _escapeToUtf32,
        _convertStringToUnicodeCodePoints : _convertStringToUnicodeCodePoints,
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
    
    function _escapeToUtf32(str) {
        var escaped = [],
            unicodeCodes = this._convertStringToUnicodeCodePoints(str),
            i = 0,
            l = unicodeCodes.length,
            hex;

        for (; i < l; i++) {
            hex = unicodeCodes[i].toString(16);
            escaped.push('0000'.substr(hex.length) + hex);
        }
        return escaped.join('-');
    }
    
    function _convertStringToUnicodeCodePoints(str) {
        var surrogate1st = 0,
            unicodeCodes = [],
            i = 0,
            l = str.length;

        for (; i < l; i++) {
            var utf16Code = str.charCodeAt(i);
            if (surrogate1st != 0) {
                if (utf16Code >= 0xDC00 && utf16Code <= 0xDFFF) {
                    var surrogate2nd = utf16Code,
                        unicodeCode = (surrogate1st - 0xD800) * (1 << 10) + (1 << 16) + (surrogate2nd - 0xDC00);
                    unicodeCodes.push(unicodeCode);
                }
                surrogate1st = 0;
            } else if (utf16Code >= 0xD800 && utf16Code <= 0xDBFF) {
                surrogate1st = utf16Code;
            } else {
                unicodeCodes.push(utf16Code);
            }
        }
        return unicodeCodes;
    }

    return common;
});
