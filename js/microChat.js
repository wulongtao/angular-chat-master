var app = angular.module("app", ['ngSanitize', 'contenteditable', 'angularLazyImg', 'luegg.directives', 'chat', 'dataService', 'common', 'maConstants']);

app.controller("CtlChat", ['$scope', '$sce', 'wsService', 'dataService', 'common', 'maConstants', function($scope, $sce, wsService, dataService, common, maConstants) {


    //初始化wsFactory
    wsService.init({type : 1});
    initParams();

    $scope.scrollVisible = 1;

    //登录对话框 与dataService相应变量进行绑定
    $scope.uiVar = dataService.uiVar;
    $scope.users = dataService.users;
    if (!dataService.tousers[$scope.userActive]) dataService.tousers[$scope.userActive]=[];
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
        if (!dataService.tousers[$scope.userActive]) dataService.tousers[$scope.userActive]=[];
        $scope.tousers = dataService.tousers[dataService.uiVar.userActive];

        dataService.uiVar.touserActive.uid = 0;
        dataService.uiVar.touserActive.qid = 0;
        initParams();
    };

    //右侧对方用户列表选择
    $scope.touserClick = function(uid, nick, avatar, content, contentType, address, qid) {
        dataService.uiVar.touserActive.uid = uid;
        dataService.uiVar.touserActive.qid = qid;
        dataService.initTouserInfo({uid:uid, qid:qid, nick:nick, avatar:avatar, content:content, contentType:contentType, address:address});

        //获取聊天记录数据并显示
        dataService.replaceChatlogInfo(dataService.uiVar.userActive, uid, qid);
        $scope.chatlogInfo = dataService.chatlogInfo;

        //TODO 大于3会显示滚动条，这里需要优化
        if ($scope.chatlogInfo.length >= 3) { $scope.scrollVisible = 1; }
        else { $scope.scrollVisible = 0; }
    };
    //删除右侧对方用户列表
    $scope.rmToUser = function (uid, qid, $event) {
        $event.stopPropagation();
        var rs = dataService.chatlog(dataService.uiVar.userActive, uid, qid, null);

        if (rs === false) {
            common.toast('info', '删除失败，请刷新页面后重试');
            return false;
        }

        rs = dataService.removeToUser(dataService.uiVar.userActive, uid);
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
    $scope.page = 1;
    $scope.showQuestion = function() {
        $scope.page = 1;
        if ($scope.uiVar.userActive === 0) {
            common.toast('info', '请选择用户');
            return false;
        }
        dataService.uiVar.isLoading = 0;
        dataService.uiVar.queActive = dataService.uiVar.queActive ? 0 : 1;
        if ($scope.uiVar.queActive === 1) {
            wsService.getUserWaitingQuestions(dataService.uiVar.userActive, $scope.page++);
        }
    };
    //解析html字符串
    $scope.deliberatelyTrustDangerousSnippet = function(content) {
        return $sce.trustAsHtml(content);
    };

    //问题忽略、解答、清除
    $scope.queIgnore = function (qid) {
        dataService.removeQuestion(dataService.uiVar.userActive, qid);
        dataService.removeQuestionInfo(qid);
    };
    $scope.queAnswer = function (qid, askUserId) {
        if ($scope.uiVar.userActive === 0) return false;
        wsService.sendAnswerNotice(qid, askUserId, dataService.uiVar.userActive);
        $scope.chatlogInfo = dataService.chatlogInfo;
    };
    $scope.queClear = function () {
        if ($scope.uiVar.userActive === 0) return false;

        dataService.clearQuestions($scope.uiVar.userActive);
        dataService.clearQuestionsInfo();
    };
    //问题滚动到底部加载更多
    $scope.showMoreQue = function () {
        dataService.uiVar.isLoading = 1;
        if (dataService.hasMoreQue) {
            wsService.getUserWaitingQuestions(dataService.uiVar.userActive, $scope.page++);
        }
    };


    //用户发送文字消息
    $scope.sendMessage = function() {
        wsService.sendChatMsg(dataService.uiVar.userActive, $scope.touser.uid, $scope.userSend.contentType, $scope.userSend.content, $scope.touser.qid);
        $scope.chatlogInfo = dataService.chatlogInfo;
    };
    //发送图片
    $scope.uploadImage = function (file) {
        wsService.sendChatImage(file);
    };


    function doLogin(phone, passwd) {
        wsService.addUser(phone, passwd, $scope)
    }

    function userLogout(uid) {
        wsService.logout(uid);
    }

    function initParams() {
        dataService.initTouserInfo();
        //聊天标题栏
        $scope.touser = dataService.touserInfo;

        //消息发送
        $scope.userSend = dataService.uiVar.userSend;


        //聊天记录
        dataService.clearChatlogInfo();
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

/**
 * 滚动条滚动到底部时间
 */
//app.directive('myDirective', function() {});
app.directive('scrolly', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var raw = element[0];

            element.bind('scroll', function () {
                if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
                    scope.$apply(attrs.scrolly);
                }
            });
        }
    };
});


app.filter("trustUrl", ['$sce', function ($sce) {
    return function (recordingUrl) {
        return $sce.trustAsResourceUrl(recordingUrl);
    };
}]);