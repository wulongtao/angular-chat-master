/**
 * 次模块封装了所有的常量信息
 * Created by raid on 2016/11/17.
 */
angular.module('maConstants', []).factory('maConstants', function () {
    var constants = {

        //错误信息
        message : {

            empTyLoginParams : '手机号或密码为空',

        },



    };


    return constants;
});
