/**
 * Created by raid on 2016/11/10.
 */
angular.module('chat', ['httpService'])
    .factory('wsFactory', function(HttpService) {

        return wss;
    });

var wss = {
    type : 0, //类型1->websocket，2->socket.io
    wss : new Array(),
    msgCallback : null,

    host : '113.108.232.194',
    port : '8381',

    getInstance : getInstance,
    init : init,
    login : login,
    onopen : onopen,
    onmessage : onmessage,
    onclose : onclose,
    sendMsg : sendMsg
};

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
 * 登录
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
    // console.log("www");
    console.log(user);
    this.sendMsg(user.uid, user);
}

/**
 * 接收消息
 * @param msg
 */
function onmessage(msg) {
    console.log(msg);
    this.test = "ggeeegg";
    if (this.msgCallback!=null) {
        this.msgCallback(msg.data);
    }
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