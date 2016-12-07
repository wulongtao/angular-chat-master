var app = angular.module("app", ['ngSanitize', 'contenteditable', 'angularLazyImg', 'luegg.directives', 'chat', 'dataService', 'common', 'maConstants', 'emojiFactory', 'mapService']);

app.controller("CtlChat", ['$scope', '$sce', 'wsService', 'dataService', 'common', 'maConstants', 'emojiFactory', 'mapService', function($scope, $sce, wsService, dataService, common, maConstants, emojiFactory, mapService, $interval) {


    //初始化wsFactory
    wsService.init({type : 1});
    $scope.emojis = emojiFactory.emj('html_to_html5');
    initParams();

    $scope.scrollVisible = 1;
    $scope.dialogType = 0;

    mapService.init({containerId:'amap', inputId:'inputAddress'});

    //登录对话框 与dataService相应变量进行绑定
    $scope.uiVar = dataService.uiVar;
    $scope.users = dataService.users;
    if (!dataService.tousers[$scope.userActive]) dataService.tousers[$scope.userActive]=[];
    $scope.tousers = dataService.tousers[$scope.userActive];
    $scope.questionsInfo = dataService.questionsInfo;
    $scope.contentType = maConstants.contentType;
    $scope.showLoginDialog = function() {
        dataService.uiVar.loginDialogActive = !dataService.uiVar.loginDialogActive;
        if (dataService.uiVar.loginDialogActive === true) {
            $scope.dialogType = 1;
        }
    };
    $scope.showAddQueDialog = function() {
        if ($scope.uiVar.userActive === 0) {
            common.toast('info', '请选择用户');
            return false;
        }
        dataService.uiVar.addQueDialogActive = !dataService.uiVar.addQueDialogActive;
        if (dataService.uiVar.addQueDialogActive === true) {
            $scope.dialogType = 2;
        }
    };
    $scope.showDialog = function () {
        if ($scope.dialogType === 1) {
            $scope.showLoginDialog();
        } else if ($scope.dialogType === 2) {
            $scope.showAddQueDialog();
        }
    };

    //发送问题
    $scope.queSend = function () {

        if (!common.isValid(dataService.uiVar.queSend) || !common.isValid(dataService.uiVar.userActive)) {
            common.toast('info', '请选择(输入)地址或内容');
            return ;
        }
        wsService.sendQue(dataService.uiVar.userActive, dataService.uiVar.queSend);
    };


    //左侧客服用户列表选择
    $scope.userClick = function(uid) {
        dataService.uiVar.userActive = uid;
        dataService.uiVar.queActive = 0;
        if (!dataService.tousers[$scope.userActive]) dataService.tousers[$scope.userActive]=[];
        $scope.tousers = dataService.tousers[dataService.uiVar.userActive];

        dataService.uiVar.touserActive.uid = 0;
        dataService.uiVar.touserActive.qid = 0;

        dataService.uiVar.badge(0, uid); //取消badge显示
        initParams();
    };

    //右侧对方用户列表选择
    $scope.touserClick = function(uid, nick, avatar, content, contentType, address, qid, askUserId, initBadge) {
        initBadge = initBadge !== 'undefined' ? initBadge : true;

        dataService['uiVar']['touserActive']['uid'] = uid;
        dataService['uiVar']['touserActive']['qid'] = qid;
        dataService['uiVar']['touserActive']['askUserId'] = askUserId;
        dataService.initTouserInfo({uid:uid, qid:qid, nick:nick, avatar:avatar, content:content, contentType:contentType, address:address, askUserId : askUserId});

        //获取聊天记录数据并显示
        dataService.replaceChatlogInfo(dataService.uiVar.userActive, uid, qid);
        $scope.chatlogInfo = dataService.chatlogInfo;

        //TODO 大于3会显示滚动条，这里需要优化
        if ($scope.chatlogInfo.length >= 3) { $scope.scrollVisible = 1; }
        else { $scope.scrollVisible = 0; }

        if (initBadge) {
            dataService.uiVar.badge(0, dataService.uiVar.userActive, uid, qid); //取消badge显示
        }
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
    //badge显示相关
    $scope.checkShowBadge = function (uid, qid) {
        return dataService.uiVar.userBadge[dataService.uiVar.userActive][uid+'-'+qid];
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
    dataService.uiVar.quePage = 1;
    $scope.showQuestion = function() {
        dataService.uiVar.quePage = 1;
        if ($scope.uiVar.userActive === 0) {
            common.toast('info', '请选择用户');
            return false;
        }
        dataService.uiVar.isLoading = 0;
        dataService.uiVar.queActive = dataService.uiVar.queActive ? 0 : 1;
        if ($scope.uiVar.queActive === 1) {
            wsService.getUserWaitingQuestions(dataService.uiVar.userActive, dataService.uiVar.quePage++);
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
            wsService.getUserWaitingQuestions(dataService.uiVar.userActive, dataService.uiVar.quePage++);
        }
    };


    //用户发送文字消息
    $scope.sendMessage = function() {
        var content = common.removeBlank($scope.userSend.content);
        if (!common.isValid([dataService.uiVar.userActive, $scope.touser.uid, content])) {
            common.toast('info', '发送信息参数错误');
            return ;
        }
        wsService.sendChatMsg(dataService.uiVar.userActive, $scope.touser.uid, $scope.userSend.contentType, content, $scope.touser.qid, $scope.touser.askUserId);
        $scope.chatlogInfo = dataService.chatlogInfo;
    };
    //发送图片
    $scope.uploadImage = function (file) {
        wsService.sendChatImage(file);
    };

    //emoji表情栏显示
    $scope.emojiActive = 0;
    $scope.showEmojiBox = function ($event) {
        $scope.emojiActive = !$scope.emojiActive;
        $event.stopPropagation();
    };
    $scope.initEmojiActive = function () {
        $scope.emojiActive = 0;
    };
    $scope.addEmojiToContent = function (code, html) {
        dataService.uiVar.userSend.content += html + "&nbsp;";
    };
    
    //添加好友
    $scope.addFriend = function () {
        common.swal('confirm', '你确定加他为好友么？', function () {
            wsService.sendFriendApply(dataService.uiVar.userActive, dataService.uiVar.touserActive.uid);
        });
    };


    //如果有用户，则默认第一个用户选中
    if (dataService.users.length >= 1) {
        dataService.uiVar.userActive = dataService.users[0].uid;
        $scope.userClick(dataService.uiVar.userActive);
    }

    /**
     * 监听uiVar.touserActive.uid值的变化，相应调用一下点击事件
     */
    $scope.$watch('uiVar.touserChanges', function () {
        var touserInfo = dataService.getToUser(dataService.uiVar.userActive, dataService.uiVar.touserActive.uid, dataService.uiVar.touserActive.qid);
        if (touserInfo === null) return ;

        $scope.touserClick(touserInfo['uid'], touserInfo['nick'], touserInfo['avatar'], touserInfo['content']
            , touserInfo['contentType'], touserInfo['address'], touserInfo['qid'], touserInfo['askUserId'], false);
    });

    /**
     * 监听左侧列表用户选中情况的变化
     */
    $scope.$watch('uiVar.userActive', function () {
        if (dataService.uiVar.userActive === 0) return ;
        $scope.userClick(dataService.uiVar.userActive);
    });

    /**
     * 判断对应用户问题的聊天是否已被点赞
     */
    $scope.checkAnswerEveluate = function () {
        var touser = dataService.getToUser(dataService.uiVar.userActive
            , dataService.uiVar.touserActive.uid, dataService.uiVar.touserActive.qid);

        if (touser === null) return false;

        return touser['questionStatus'];
    };

    $scope.checkEditable = function () {
        var touser = dataService.getToUser(dataService.uiVar.userActive
            , dataService.uiVar.touserActive.uid, dataService.uiVar.touserActive.qid);

        if (touser === null) return false;

        console.log(touser['questionStatus']);
        return !touser['questionStatus'];
    }

    /**
     * 登录
     * @param phone
     * @param passwd
     */
    function doLogin(phone, passwd) {
        wsService.addUser(phone, passwd, $scope)
    }

    /**
     * 注销
     * @param uid
     */
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

/**
 * 处理资源路径，变成真正的链接地址
 */
app.filter("trustUrl", ['$sce', function ($sce) {
    return function (recordingUrl) {
        return $sce.trustAsResourceUrl(recordingUrl);
    };
}]);