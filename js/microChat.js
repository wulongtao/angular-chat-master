var app = angular.module("app", ['contenteditable', 'chat', 'dataService']);

app.controller("CtlChat", ['$scope', 'wsService', 'dataService', function($scope, wsService, dataService) {


    //初始化wsFactory
    wsService.init({type : 1});
    $scope.userActive = 0;



    $scope.userClick = function(uid) {
        $scope.userActive = uid;
        $scope.queActive = 0;
    };
    $scope.testInput = "wegweg";
    $scope.testInputFunc = function() {
        console.log(Common.htmlToPlaintext($scope.testInput));
    };
    $scope.queActive = 0;
    $scope.showQuestion = function() {
        $scope.queActive = $scope.queActive ? 0 : 1;
    };

    //初始化dataService
    // dataService.init();


    //登录对话框 与dataService相应变量进行绑定
    $scope.uiVar = dataService.uiVar;
    $scope.users = dataService.users;
    $scope.showLoginDialog = function() {
        dataService.uiVar.loginDialogActive = !dataService.uiVar.loginDialogActive;
    };

    //登录
    $scope.doLogin = doLogin;
    //退出登录
    $scope.userLogout = userLogout;


    function doLogin(phone, passwd) {
        wsService.addUser(phone, passwd, $scope)
    }

    function userLogout(uid) {
        wsService.logout(uid);
    }


}]);


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