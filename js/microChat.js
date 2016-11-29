var app = angular.module("app", ['ngSanitize', 'contenteditable', 'angularLazyImg', 'chat', 'dataService', 'common', 'maConstants']);

app.controller("CtlChat", ['$scope', '$sce', 'wsService', 'dataService', 'common', 'maConstants', function($scope, $sce, wsService, dataService, common, maConstants) {


    //初始化wsFactory
    wsService.init({type : 1});
    initParams();

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
    $scope.touserClick = function(uid, nick, avatar, content, contentType, address, qid) {
        dataService.uiVar.touserActive.uid = uid;
        dataService.uiVar.touserActive.qid = qid;
        $scope.touser.uid = uid;
        $scope.touser.qid = qid;
        $scope.touser.nick = nick;
        $scope.touser.avatar = avatar;
        $scope.touser.content = content;
        $scope.touser.contentType = contentType;
        $scope.touser.address = address;

        //获取聊天记录数据并显示
        var chatlog = dataService.chatlog(dataService.uiVar.userActive, uid, qid);
        dataService.chatlogInfo = chatlog;
        $scope.chatlogInfo = dataService.chatlogInfo;
    };
    //删除右侧对方用户列表
    $scope.rmToUser = function (uid, qid) {
        var rs = dataService.removeToUser(dataService.uiVar.userActive, uid);
        if (rs === false) {
            common.toast('info', '删除失败，请刷新页面后重试');
            return false;
        }
        rs = dataService.chatlog(dataService.uiVar.userActive, uid, qid, null);
        if (rs === false) {
            common.toast('info', '删除失败，请刷新页面后重试');
            return false;
        }
        initParams();
    };

    //播放语音相关
    $scope.playQAudio = function () {
        var audio = document.getElementsByClassName("qAudio")[0];
        audio.load();
        audio.play();
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
    //解析html字符串
    $scope.deliberatelyTrustDangerousSnippet = function(content) {
        return $sce.trustAsHtml(content);
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

    //用户发送文字消息
    $scope.sendMessage = function() {
        wsService.sendChatMsg(dataService.uiVar.userActive, $scope.touser.uid, $scope.userSend.contentType, $scope.userSend.content, $scope.touser.qid);
    };

    function doLogin(phone, passwd) {
        wsService.addUser(phone, passwd, $scope)
    }

    function userLogout(uid) {
        wsService.logout(uid);
    }

    function initParams() {
        //聊天标题栏
        $scope.touser = {
            uid : 0,
            qid : 0,
            nick : '猪猪微答',
            avatar : 'http://weida.products-test.zhuzhu.com/static/images/ma-operator/login-logo.png',
            content : '客服聊天系统',
            contentType : maConstants.contentType.TYPE_TEXT,
            address : '',
        };


        //消息发送
        $scope.userSend = {
            content : "",
            contentType : maConstants.contentType.TYPE_TEXT,
        };

        //聊天记录
        $scope.chatlogInfo = dataService.chatlogInfo;
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

app.filter("trustUrl", ['$sce', function ($sce) {
    return function (recordingUrl) {
        return $sce.trustAsResourceUrl(recordingUrl);
    };
}]);