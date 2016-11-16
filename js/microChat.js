var app = angular.module("app", ['contenteditable','chat']);

app.controller("CtlChat", ['$scope', 'common', 'wsFactory',function($scope, common, wsFactory) {






    wsFactory.init({type : 1});
    wsFactory.login({uid:1});








    $scope.userClick = function(uid) {
        $scope.userActive = uid;
    };
    $scope.testInput = "wegweg";
    $scope.testInputFunc = function() {
        console.log(common.htmlToPlaintext($scope.testInput));
    };
    $scope.queActive = 0;
    $scope.showQuestion = function() {
        console.log($scope.queActive);
        console.log($scope.queActive);
        $scope.queActive = $scope.queActive ? 0 : 1;
    }

    $scope.dialogActive = false;
    $scope.showDialog = function() {
        $scope.dialogActive = !$scope.dialogActive;
        console.log($scope.dialogActive);
    };
}]);

//全局函数工厂
app.factory('common', function() {
    var service = {};
    /**
     * 去掉内容中的tags
     */
    service.htmlToPlaintext = function(text) {
        return text ? String(text).replace(/<[^>]+>/gm, '') : '';
    }
    return service;
});