/**
 * 此函数存放WebSocket的相关操作
 * Created by raid on 2016/11/10.
 */
angular.module('chat', ['urlService', 'common', 'maConstants', 'dataService']).factory('wsService', function(urlService, common, maConstants, dataService, $timeout) {

    var wss = {
        type : 0, //类型1->websocket，2->socket.io
        wss : new Array(),

        host : '113.108.232.194',
        port : '8381',

        addUser : addUser, //添加客服用户
        addToUser : addToUser, //添加回答用户
        getUserWaitingQuestions : getUserWaitingQuestions,

        getInstance : getInstance,
        init : init,
        login : login,
        logout: logout,
        onopen : onopen,
        onmessage : onmessage,
        onclose : onclose,
        // wsClose : wsClose,
        sendMsg : sendMsg, //发送消息
        sendChatMsg : sendChatMsg, //发送聊天消息
        sendAnswerNotice : sendAnswerNotice, //发送解答问题消息
        sendClientNotice : sendClientNotice, //发送type=6

    };

    return wss;

    /**
     * 初始化
     * @param opts
     */
    function init(opts) {
        this.type = opts.type;
        var microchat = dataService.init();


        if (microchat && microchat.users) {
            var users = microchat.users;
            for (var i = 0; i < users.length; i++) {
                this.login(users[i]);
            }
        }

    }


    /**
     * 获取Websocket对象
     */
    function getInstance() {
        if (this.type == 1) {
            return new WebSocket("ws://" + this.host + ":" + this.port);
        }
    }

    /**
     * 网页登录客服账号
     * @param phone
     * @param password
     */
    function addUser(phone, password) {

        //参数校验
        if (!common.isValid([phone, password])) {
            common.toast('info', maConstants.message.empTyLoginParams);
            return false;
        }

        //发送请求
        urlService.user.add(phone, password).then(function (data) {
            if (data.result != 0) {
                common.toast('info', data.message);
                return false;
            }

            wss.login(data.data);

            dataService.addUser(data.data);
            dataService.uiVar.loginDialogActive = !dataService.uiVar.loginDialogActive;
            dataService.uiVar.loginParams.userPhone = "";
            dataService.uiVar.loginParams.userPasswd = "";
        });

    }

    function addToUser(uid, qid, touserId) {
        urlService.user.userQuestionInfo(touserId, qid).then(function (data) {
            if (data.result != 0) {
                common.toast('info', data.message);
            }
            var userInfo = data.data.userInfo;
            var questionInfo = data.data.questionInfo;
            dataService.addToUser(uid, {
                uid : userInfo.uid,
                nick : userInfo.nick,
                avatar : userInfo.avatar,
                qid : questionInfo.qid,
                contentType : questionInfo.contentType,
                content : questionInfo.content,
                address : questionInfo.address
            });
        });
    }

    /**
     * 获取等待回答的问题的信息
     * @param uid
     * @returns {boolean}
     */
    function getUserWaitingQuestions(uid) {
        var qids = dataService.getQuestions(uid);
        if (!qids || qids.length == 0) {
            return false;
        }

        urlService.question.questionsDetail(qids, 1).then(function (data) {
            if (data.result != 0) {
                common.toast('info', data.message);
            }
            dataService.addQuestionsInfo(data.data);
        });

    }

    /**
     * 登录WebSocket
     * @param user json对象
     */
    function login(user) {
        var objThis = this;
        var uid = user['uid'];

        if (this.wss[uid] == null) {
            this.wss[uid] = this.getInstance();
            this.wss[uid].clientId = uid;
        }

        this.wss[uid].onopen = function () {
            objThis.onopen(user);
        };
        this.wss[uid].onmessage = this.onmessage;
        this.wss[uid].onclose = this.onclose;
    }

    /**
     * 退出登录
     * @param uid
     */
    function logout(uid) {
        if (!uid) return ;
        var user = dataService.getUser(uid);
        if (!user) return ;

        var logoutUser = {
            type : maConstants.wsMessageType.TYPE_LOGOUT,
            uid : user.uid,
            sid : user.sid
        };
        this.sendMsg(user.uid, logoutUser);
    }

    /**
     * 打开状态
     */
    function onopen(user) {
        var loginUser = {
            type : maConstants.wsMessageType.TYPE_LOGIN,
            uid : user.uid,
            sid : user.sid
        };
        this.sendMsg(user.uid, loginUser);
    }

    /**
     * 接收消息
     * @param msg
     */
    function onmessage(msg) {
        msg = JSON.parse(msg.data);
        msg.toUserId = this.clientId;
        console.log(msg);
        handleMessage(msg);
    }

    /**
     * 连接断开
     */
    function onclose() {
        console.log("onclose");
        dataService.removeUser(this.clientId);
        if (!this.wss[this.clientId]) this.wss[this.clientId] = null;
        common.toast('info', '帐号已在其他设备登录');
    }

    /**
     * 关闭WebSocket
     * @param uid
     */
    function wsClose(uid) {
        dataService.removeUser(uid);
        wss.wss[uid] = null;
    }

    /**
     * 发送消息
     * @param uid 用户ID
     * @param msg 消息
     * @returns {boolean}
     */
    function sendMsg(uid, msg) {
        var ws = this.wss[uid];
        if (ws.readyState == 1) {
            ws.send(JSON.stringify(msg));
            return true;
        } else {
            common.toast('info', '发送信息太快，请稍后再发送');
            return false;
        }
    }
    
    function sendChatMsg(uid, touserId, contentType, content, qid) {
        qid = typeof qid !== 'undefined' ?  qid : 0;

        var userInfo = dataService.getUser(uid);
        var touserInfo = dataService.getToUser(uid, touserId);
        if (!userInfo || !userInfo['uid'] || !touserInfo || !touserInfo['uid']) {
            common.toast('info', '请选择用户再发送消息');
        }

        content = common.htmlToPlaintext(content);

        var data = {
            type : maConstants.wsMessageType.TYPE_SAY,
            uid : userInfo['uid'],
            targetUserId : touserInfo['uid'],
            sid : userInfo['sid'],
            content : content,
            contentType : contentType,
            messageId : createMessageId(touserInfo['uid']),
        };

        if (qid !== 0) {
            data.qid = qid;
            data.askUserId = touserId;
        }

        dataService.chatlog(userInfo['uid'], touserInfo['uid'], qid, {
            uid:userInfo['uid'],
            nick : userInfo['nick'],
            avatar : userInfo['avatar'],
            toUserId : touserInfo['uid'],
            qid : qid,
            contentType : contentType,
            content : content,
            addTime : common.getCurrentTime(),
        });

        this.sendMsg(uid, data);
    }

    /**
     * 发送type=6的clientNotice给服务器
     * @param uid
     * @param msg
     * @returns {boolean}
     */
    function sendClientNotice(uid, msg) {
        var user = dataService.getUser(uid);
        msg.uid = user.uid;
        msg.sid = user.sid;
        msg.messageType = msg.type;
        msg.type = maConstants.wsMessageType.TYPE_CLIENT_NOTICE;
        this.sendMsg(uid, msg);
    }

    function sendAnswerNotice(qid, askUserId, targetUserId) {
        var user = dataService.getUser(targetUserId);
        var msg = {
            type : maConstants.wsMessageType.TYPE_ANSWER_NOTICE,
            uid : user.uid,
            sid : user.sid,
            qid : qid,
            askUserId : askUserId,
            targetUserId : askUserId,
            messageId : askUserId, //带上messageId，服务器返回的时候顺便返回知道askUserId
        };
        this.sendMsg(user.uid, msg);
    }


    /**
     * 处理onMessage事件函数
     * @param msg
     */
    function handleMessage(msg) {
        var type = parseInt(msg.type);

        switch (type) {
            case maConstants.wsMessageType.TYPE_SERVICE_NOTICE : //type=5服务端消息通知，比如通知客户端已接收到消息
                handleServiceNotice(msg);
                break;

            case maConstants.wsMessageType.TYPE_ANSWER :  //type=8把问题发送给符合条件的用户
                handleQuestionNotice(msg);
                break;

        }


        updateDom();
    }

    /**
     * 处理接受到问题的消息
     * @param msg
     */
    function handleQuestionNotice(msg) {

        //把qid存到每一个客服中
        dataService.addQuestion(msg.toUserId, msg.qid);
        wss.sendClientNotice(msg.toUserId, {type:msg.type,randId:msg.randId,qid:msg.qid});
    }

    /**
     * 服务端消息通知，比如通知客户端已接收到消息 type=5
     * @param msg
     */
    function handleServiceNotice(msg) {
        var result = parseInt(msg.result);
        var messageType = parseInt(msg.messageType);

        switch (result) {
            case 0:
                if (messageType === maConstants.wsMessageType.TYPE_LOGIN) {
                    common.toast('success', maConstants.message.loginSuccess);
                } else if (messageType === maConstants.wsMessageType.TYPE_LOGOUT) {
                    wsClose(msg.toUserId);
                    common.toast('success', msg.message);
                } else if (messageType === maConstants.wsMessageType.TYPE_SAY) {
                    var uid = msg.toUserId;
                    var toUserId = parseMessageId(msg.messageId).id;
                    var qid = msg.qid;

                    console.log(dataService.chatlog(uid, toUserId, qid));

                } else if (messageType === maConstants.wsMessageType.TYPE_ANSWER_NOTICE) {
                    wss.addToUser(msg.toUserId, msg.qid, msg.messageId);

                    //收到解答成功之后删除问题列表中的问题
                    dataService.removeQuestion(msg.toUserId, msg.qid);
                    dataService.removeQuestionInfo(msg.qid);

                    //焦点到toUserId那
                    dataService.uiVar.userActive = msg.toUserId;
                }

                break;

            case 1001:
                wsClose(msg.toUserId); //登录过期
                common.toast('info', msg.message);
                break;

            case 1002:
                common.toast('info', msg.message);
                dataService.removeQuestion(msg.toUserId, msg.qid);
                dataService.removeQuestionInfo(msg.qid);
                break;

            case 1006: //已回答过问题
                common.toast('info', msg.message);
                dataService.removeQuestion(msg.toUserId, msg.qid);
                dataService.removeQuestionInfo(msg.qid);
                break;
        }


    }


    /**
     * 解析messageId
     * @param messageId
     * @returns {{id: *, addTime: *}}
     */
    function parseMessageId(messageId) {
        var messageIdArr = messageId.split('_');
        return {id : messageIdArr[0], addTime : messageIdArr[1]};
    }

    function createMessageId(id) {
        var messageId = id + "_" + common.getCurrentTime();
        return messageId;
    }

    /**
     * 更新dom
     */
    function updateDom() {
        //更新dom,两种方法
        // $rootScope.$apply();
        $timeout(angular.noop);
    }


});

