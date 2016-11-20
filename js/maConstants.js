/**
 * 次模块封装了所有的常量信息
 * Created by raid on 2016/11/17.
 */
angular.module('maConstants', []).factory('maConstants', function () {
    var constants = {

        //错误信息
        message : {

            empTyLoginParams : '手机号或密码为空',
            loginSuccess : '登录成功',

        },


        //WebSocket Type
        wsMessageType : {
            TYPE_LOGIN : 1,
            TYPE_SERVICE_NOTICE : 5, //服务端消息通知，比如通知客户端已接收到消息

        }



    };


    return constants;
});
