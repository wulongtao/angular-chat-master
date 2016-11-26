var app = angular.module("app", ['contenteditable', 'angularLazyImg', 'chat', 'dataService', 'common', 'maConstants', 'ngAudio']);

app.controller("CtlChat", ['$scope', 'wsService', 'dataService', 'common', 'maConstants', function($scope, wsService, dataService, common, maConstants, ngAudio) {


    //初始化wsFactory
    wsService.init({type : 1});

    //登录对话框 与dataService相应变量进行绑定
    $scope.uiVar = dataService.uiVar;
    $scope.users = dataService.users;
    $scope.tousers = dataService.tousers[$scope.userActive];
    $scope.questionsInfo = dataService.questionsInfo;
    $scope.contentType = maConstants.contentType;
    $scope.showLoginDialog = function() {
        dataService.uiVar.loginDialogActive = !dataService.uiVar.loginDialogActive;
    };

    //左侧客服用户列表选择
    $scope.userClick = function(uid) {
        dataService.uiVar.userActive = uid;
        dataService.uiVar.queActive = 0;
        $scope.tousers = dataService.tousers[dataService.uiVar.userActive];
    };
    //右侧对方用户列表选择
    $scope.touser = {
        nick : '猪猪微答',
        avatar : 'http://weida.products-test.zhuzhu.com/static/images/ma-operator/login-logo.png',
        content : '客服聊天系统',
    };
    $scope.touserClick = function(uid, nick, avatar, content, contentType, address, qid) {
        dataService.uiVar.touserActive.uid = uid;
        dataService.uiVar.touserActive.qid = qid;
        $scope.touser.nick = nick;
        $scope.touser.avatar = avatar;
        $scope.touser.content = content;
        $scope.touser.contentType = contentType;
        $scope.touser.address = address;
    };

    //登录
    $scope.doLogin = doLogin;
    //退出登录
    $scope.userLogout = userLogout;

    //问题相关，问题弹出框
    $scope.showQuestion = function() {
        if ($scope.uiVar.userActive === 0) {
            common.toast('info', '请选择用户');
            return false;
        }
        dataService.uiVar.queActive = dataService.uiVar.queActive ? 0 : 1;
        if ($scope.uiVar.queActive === 1) {
            wsService.getUserWaitingQuestions(dataService.uiVar.userActive);
        }


    };
    //问题忽略、解答
    $scope.queIgnore = function (qid) {
        dataService.removeQuestion(dataService.uiVar.userActive, qid);
        dataService.removeQuestionInfo(qid);
    };
    $scope.queAnswer = function (qid, askUserId) {
        if ($scope.uiVar.userActive === 0) return false;
        wsService.sendAnswerNotice(qid, askUserId, dataService.uiVar.userActive);
    };

    $scope.testInput = "wegweg";
    $scope.testInputFunc = function() {
        console.log(Common.htmlToPlaintext($scope.testInput));
    };

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