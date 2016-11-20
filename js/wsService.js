/**
 * 此函数存放WebSocket的相关操作
 * Created by raid on 2016/11/10.
 */
angular.module('chat', ['urlService', 'common', 'maConstants', 'dataService']).factory('wsService', function(urlService, common, maConstants, dataService) {

    var wss = {
        type : 0, //类型1->websocket，2->socket.io
        wss : new Array(),

        host : '113.108.232.194',
        port : '8381',

        HttpService : null,

        addUser : addUser,

        getInstance : getInstance,
        init : init,
        login : login,
        onopen : onopen,
        onmessage : onmessage,
        onclose : onclose,
        sendMsg : sendMsg,

    };

    var MessageHandler = {
        handleMessage : handleMessage,
        handleServiceNotice : handleServiceNotice,
    };

    return wss;

    /**
     * 初始化
     * @param opts
     */
    function init(opts) {
        this.type = opts.type;
        // console.log(HttpService.test);
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
            console.log(data);
            if (data.result != 0) {
                common.toast('info', data.message);
                return false;
            }

            wss.login(data.data);


            dataService.users.push(data.data);
            dataService.uiVar.loginDialogActive = !dataService.uiVar.loginDialogActive;
            dataService.uiVar.loginParams.userPhone = "";
            dataService.uiVar.loginParams.userPasswd = "";
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
        }

        this.wss[uid].onopen = function () {
            objThis.onopen(user);
        };
        this.wss[uid].onmessage = this.onmessage;
        this.wss[uid].onclose = this.onclose;
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
        console.log(user);
        this.sendMsg(user.uid, loginUser);
    }

    /**
     * 接收消息
     * @param msg
     */
    function onmessage(msg) {
        msg = JSON.parse(msg.data);
        console.log(msg);

        MessageHandler.handleMessage(msg);
    }

    /**
     * 连接断开
     */
    function onclose() {
        console.log("onclose");
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
            return false;
        }
    }


    /**
     * 处理onMessage事件函数
     * @param msg
     */
    function handleMessage(msg) {
        var type = parseInt(msg.type);

        switch (type) {

            //type=5服务端消息通知，比如通知客户端已接收到消息
            case maConstants.wsMessageType.TYPE_SERVICE_NOTICE :
                this.handleServiceNotice(msg);
                break;
        }

    }

    /**
     * 服务端消息通知，比如通知客户端已接收到消息
     * @param msg
     */
    function handleServiceNotice(msg) {
        var result = parseInt(msg.result);
        var messageType = parseInt(msg.messageType);

        switch (result) {
            case 0:
                common.toast('success', maConstants.message.loginSuccess);
                break;
        }
    }
});

