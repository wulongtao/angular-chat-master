/**
 * 此函数存放WebSocket的相关操作
 * Created by raid on 2016/11/10.
 */
angular.module('chat', ['urlService', 'common', 'maConstants', 'dataService', 'emojiFactory']).factory('wsService', function(urlService, common, maConstants, dataService, emojiFactory, $timeout, $interval) {

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
        sendQue : sendQue, //发送（提问）问题
        sendChatImage : sendChatImage, //聊天发送图片
        sendAnswerNotice : sendAnswerNotice, //发送解答问题消息
        sendClientNotice : sendClientNotice, //发送type=6

    };

    /**
     * 用户保持连接每隔3分钟发送心跳包
     * @type {{usersIntv: {}, startPings: *, cancelPings: *}}
     */
    var pings = {
        usersIntv : {},
        startPings : startPings,
        cancelPings : cancelPings,
        startQueTimer : startQueTimer,
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

    /**
     * 获取对方用户信息并添加到列表中
     * @param uid userId
     * @param qid 问题ID
     * @param touserId toUserId
     * @param needInit 是否需要调用initTouserId方法
     * @param callback 是否回调函数。
     */
    function addToUser(uid, qid, touserId, notInit, callback) {
        notInit = typeof notInit !== 'undefined' ?  notInit : undefined;
        callback = typeof callback !== 'undefined' ?  callback : undefined;
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
                address : questionInfo.address,
                askUserId : questionInfo.fromUserId,
            });

            if (notInit !== true) {
                dataService.initTouserInfo({uid:userInfo.uid, qid:questionInfo.qid, nick:userInfo.nick,
                    avatar:userInfo.avatar, content:questionInfo.content, contentType:questionInfo.contentType, address:questionInfo.address, askUserId:questionInfo.fromUserId});
            }

            if (callback !== undefined) {
                callback && callback();
            }

        });
    }

    /**
     * 获取等待回答的问题的信息
     * @param uid
     * @returns {boolean}
     */
    function getUserWaitingQuestions(uid, page) {
        var qids = dataService.getQuestions(uid);
        if (!qids || qids.length == 0) {
            return false;
        }
        dataService.uiVar.isLoading = 1;

        urlService.question.questionsDetail(qids, page).then(function (data) {
            if (data.result != 0) {
                common.toast('info', data.message);
            }
            var needClear = page == 1 ? 1 : 0;
            dataService.addQuestionsInfo(data.data.questions, needClear);
            dataService.uiVar.isLoading = 0;
            dataService.hasMoreQue = data.data.hasMore;
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
        pings.cancelPings(this.clientId); //结束发送心跳包
        // if (!this.wss || !this.wss[this.clientId]) this.wss[this.clientId] = null;
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
    
    function sendChatMsg(uid, touserId, contentType, content, qid, askUserId) {
        qid = typeof qid !== 'undefined' ?  qid : 0;

        var userInfo = dataService.getUser(uid);
        var touserInfo = dataService.getToUser(uid, touserId);
        if (!userInfo || !userInfo['uid'] || !touserInfo || !touserInfo['uid']) {
            common.toast('info', '请选择用户再发送消息');
        }

        var sendContent = common.htmlToPlaintext(content);

        var data = {
            type : maConstants.wsMessageType.TYPE_SAY,
            uid : userInfo['uid'],
            targetUserId : touserInfo['uid'],
            sid : userInfo['sid'],
            content : sendContent,
            contentType : contentType,
            messageId : createMessageId(touserInfo['uid']),
        };

        if (qid !== 0) {
            data.qid = qid;
            data.askUserId = askUserId;
        }

        dataService.chatlog(userInfo['uid'], touserInfo['uid'], qid, {
            uid:userInfo['uid'],
            nick : userInfo['nick'],
            avatar : userInfo['avatar'],
            toUserId : touserInfo['uid'],
            qid : qid,
            contentType : contentType,
            content : content,
            addTime : common.getCurrentTime()*1000,
        });

        this.sendMsg(uid, data);
    }

    function sendQue(uid, data) {
        var userInfo = dataService.getUser(uid);
        data['type'] = maConstants.wsMessageType.TYPE_QUESTION;
        data['uid'] = userInfo['uid'];
        data['sid'] = userInfo['sid'];

        this.sendMsg(uid, data);
    }

    function sendChatImage(file) {
        urlService.upload.uploadImg(file, function (resp) {
            console.log(resp);
        });
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
            case maConstants.wsMessageType.TYPE_SAY : //type=3，说话
                handleChatNotice(msg);
                break;

            case maConstants.wsMessageType.TYPE_SERVICE_NOTICE : //type=5服务端消息通知，比如通知客户端已接收到消息
                handleServiceNotice(msg);
                break;

            case maConstants.wsMessageType.TYPE_ANSWER :  //type=8把问题发送给符合条件的用户
                handleQuestionNotice(msg);
                break;
            case maConstants.wsMessageType.TYPE_ANSWER_NOTICE: //type=9,解答问题，并通知提问者
                handleAnswerNotice(msg);
                break;
        }


        updateDom();
    }

    function handleChatNotice(msg) {

        var touserInfo = dataService.getToUser(msg.toUserId, msg.targetUserId);
        if (!touserInfo || !touserInfo['uid']) {
            wss.addToUser(msg.toUserId, msg.qid, msg.targetUserId, true, function () {
                doHandleChatNoticeStep1(msg);
            });
        } else {
            doHandleChatNoticeStep1(msg);
        }


    }

    function doHandleChatNoticeStep1(msg) {
        if (msg.contentType !== 1) {
            doHandleChatNotice(msg)
        } else {
            urlService.question.getEmojiH5(msg.content).then(function (data) {
                if (data.result !== 0) {
                    common.toast('info', data.message);
                }

                msg.content = data.data.content1;
                doHandleChatNotice(msg);
            });
        }
    }

    function doHandleChatNotice(msg) {
        if (!msg.content) {
            msg.content = "&nbsp;";
        }
        var uid = msg.toUserId;
        var touserInfo = dataService.getToUser(uid, msg.targetUserId);
        var qid = msg.qid;
        if (!touserInfo || !touserInfo['uid']) return false;

        dataService.uiVar.badge(1, uid);
        dataService.uiVar.badge(1, uid, touserInfo['uid'], qid);

        dataService.chatlog(uid, touserInfo['uid'], qid, {
            uid:touserInfo['uid'],
            nick : touserInfo['nick'],
            avatar : touserInfo['avatar'],
            toUserId : touserInfo['uid'],
            qid : qid,
            contentType : msg.contentType,
            content : msg.content,
            addTime : common.getCurrentTime()*1000,
        });

        if (dataService.uiVar.userActive === uid && dataService.uiVar.touserActive.uid === touserInfo['uid']
            && dataService.uiVar.touserActive.qid === qid) {
            dataService.replaceChatlogInfo(uid, touserInfo['uid'], qid);
        }

        wss.sendClientNotice(uid, {
            type : msg.type,
            qid : qid,
            chatId : msg.chatId,
        });
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

    function handleAnswerNotice(msg) {

        //对方用户列表中添加用户
        var rs = dataService.addToUser(msg.toUserId, {
            uid : msg.targetUserId,
            nick : msg.targetNick,
            avatar : msg.targetAvatar,
            qid : msg.qid,
            contentType : msg.contentType,
            content : msg.content,
            address : msg.address,
            askUserId : msg.askUserId,
        });

        if (rs === false) {
            return ;
        }

        //添加第一句欢迎的话
        dataService.chatlog(msg.toUserId, msg.targetUserId, msg.qid, {
            uid : msg.targetUserId,
            nick : msg.targetNick,
            avatar : msg.targetAvatar,
            toUserId : msg.toUserId,
            qid : msg.qid,
            contentType : maConstants.contentType.TYPE_TEXT,
            content : maConstants.CHAT_HELLO_TEXT,
            addTime : common.getCurrentTime()*1000,
        });

        //发送type=6
        wss.sendClientNotice(msg.toUserId, {
            type : msg.type,
            qid : msg.qid,
            randId : msg.randId,
        });

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
                    pings.startPings(msg.toUserId);
                } else if (messageType === maConstants.wsMessageType.TYPE_LOGOUT) {
                    wsClose(msg.toUserId);
                    common.toast('success', msg.message);
                } else if (messageType === maConstants.wsMessageType.TYPE_SAY) {
                    var uid = msg.toUserId;
                    var toUserId = parseMessageId(msg.messageId).id;
                    var qid = msg.qid;

                    dataService.replaceChatlogInfo(uid, toUserId, qid);
                    dataService.initUserSend();
                } else if (messageType === maConstants.wsMessageType.TYPE_ANSWER_NOTICE) {
                    wss.addToUser(msg.toUserId, msg.qid, msg.messageId);

                    //收到解答成功之后删除问题列表中的问题
                    dataService.removeQuestion(msg.toUserId, msg.qid);
                    dataService.removeQuestionInfo(msg.qid);

                    //焦点到toUserId那
                    dataService.uiVar.touserActive.uid = msg.messageId;
                    dataService.uiVar.touserActive.qid = msg.qid;
                    dataService.uiVar.userActive = msg.toUserId;
                } else if (messageType === maConstants.wsMessageType.TYPE_QUESTION) {
                    common.toast('info', '发送问题成功，请等待回答……');

                    //关闭发送问题弹出框
                    dataService.uiVar.addQueDialogActive = false;

                    startQueTimer(msg.toUserId);
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

            case 1014: //提问过于频繁，请稍后
                common.toast('info', msg.message);
                break;

            case -2 : //内部程序出错
                common.toast('info', msg.message);
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

    function startPings(uid) {
        this.cancelPings(uid);
        this.usersIntv[uid] = $interval(function () {
            var userInfo = dataService.getUser(uid);
            wss.sendMsg(uid, {type:maConstants.wsMessageType.TYPE_PING, uid:userInfo['uid'], sid:userInfo['sid']});
        }, maConstants.PING_TIMES);
    }

    function cancelPings(uid) {
        if (!this.usersIntv[uid]) return ;

        $interval.cancel(this.usersIntv[uid]);
        this.usersIntv = undefined;
    }

    function startQueTimer(uid) {
        dataService.uiVar.userSendTimer[uid] = 0;
        $interval(function () {
            dataService.uiVar.userSendTimer[uid]++;
            if (dataService.uiVar.userSendTimer[uid]>=60) {
                dataService.uiVar.userSendTimer[uid] = 0;
            }
        }, 1000, 60);
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

