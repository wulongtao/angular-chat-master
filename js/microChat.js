var app = angular.module("app", ['contenteditable', 'chat', 'toaster', 'ngAnimate']);

app.controller("CtlChat", ['$scope', 'Common', 'wsFactory', function($scope, common, wsFactory) {


    //初始化wsFactory
    wsFactory.init({type : 1});




    $scope.userClick = function(uid) {
        $scope.userActive = uid;
    };
    $scope.testInput = "wegweg";
    $scope.testInputFunc = function() {
        console.log(Common.htmlToPlaintext($scope.testInput));
    };
    $scope.queActive = 0;
    $scope.showQuestion = function() {
        console.log($scope.queActive);
        console.log($scope.queActive);
        $scope.queActive = $scope.queActive ? 0 : 1;
    };

    //登录对话框
    $scope.loginDialogActive = false;
    $scope.showLoginDialog = function() {
        $scope.loginDialogActive = !$scope.loginDialogActive;
    };

    //登录
    $scope.doLogin = doLogin;



    function doLogin(phone, passwd) {
        // toastr.success(phone + " .. " + passwd);
        // Common.toast('info', 'eee');
        if (!Common.isValid()) {

        }

        $scope.loginDialogActive = !$scope.loginDialogActive;
    }




}]);

//全局函数工厂
app.factory('Common', function(toaster) {
    var service = {};
    /**
     * 去掉内容中的tags
     */
    service.htmlToPlaintext = function(text) {
        return text ? String(text).replace(/<[^>]+>/gm, '') : '';
    };

    /**
     * toaster封装
     * @param type success,info,error
     * @param body 内容
     */
    service.toast = function (type, body) {

        toaster.pop({
            type: type, body: body});
    };

    /**
     * 判断字段是否为 ''、null、undefined
     * @param param 某个值或者数组
     * @returns {boolean}
     */
    service.isValid = function (param) {
        var value = true;
        if (Array.isArray(param)) {
            for (var i = 0; i < param.length; i++) {
                value = value && param[i];
            }
        } else {
            value = value && param;
        }
        return !value;
    };

    return service;
});


/**
 * 回车事件
 */
app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});