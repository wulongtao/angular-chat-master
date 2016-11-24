var app = angular.module("app", ['contenteditable', 'angularLazyImg', 'chat', 'dataService', 'common']);

app.controller("CtlChat", ['$scope', 'wsService', 'dataService', 'common', function($scope, wsService, dataService, common) {


    //初始化wsFactory
    wsService.init({type : 1});
    //左侧客服用户列表选择
    $scope.userActive = 0;
    $scope.userClick = function(uid) {
        $scope.userActive = uid;
        $scope.queActive = 0;
    };


    //登录对话框 与dataService相应变量进行绑定
    $scope.uiVar = dataService.uiVar;
    $scope.users = dataService.users;
    $scope.questionsInfo = dataService.questionsInfo;
    $scope.showLoginDialog = function() {
        dataService.uiVar.loginDialogActive = !dataService.uiVar.loginDialogActive;
    };

    //登录
    $scope.doLogin = doLogin;
    //退出登录
    $scope.userLogout = userLogout;

    //问题相关，问题弹出框
    $scope.queActive = 0;
    $scope.showQuestion = function() {
        if ($scope.userActive === 0) {
            common.toast('info', '请选择用户');
            return false;
        }
        $scope.queActive = $scope.queActive ? 0 : 1;
        if ($scope.queActive === 1) {
            wsService.getUserWaitingQuestions($scope.userActive);
        }
    };
    //问题忽略、解答
    $scope.queIgnore = function (qid) {
        dataService.removeQuestion($scope.userActive, qid);
        dataService.removeQuestionInfo(qid);
    };


    function doLogin(phone, passwd) {
        wsService.addUser(phone, passwd, $scope)
    }

    function userLogout(uid) {
        wsService.logout(uid);
    }


    $scope.testInput = "wegweg";
    $scope.testInputFunc = function() {
        console.log(Common.htmlToPlaintext($scope.testInput));
    };


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