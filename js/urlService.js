/**
 * 此函数存放所有的http请求
 * Created by raid on 2016/11/16.
 */
angular.module('urlService', ['httpService']).factory('urlService', function (httpService) {
    var service = {
        user : { //用户相关
            add : addUser, //客服帐号登录
        }
    };

    return service;

    function addUser(phone, passwd) {
        return httpService.get("http://weida.products-test.zhuzhu.com/?_c=microAnswerOperator&_a=addUser&phone="+phone+"&password="+passwd
            ).then(function (data) {
                return data;
            });
    }
});




