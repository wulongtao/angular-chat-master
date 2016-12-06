/**
 * 次模块封装了所有的常量信息
 * Created by raid on 2016/11/17.
 */
angular.module('maConstants', []).factory('maConstants', function () {
    var constants = {
        //发送心跳包的时间间隔,客户端每隔5分钟发送一个包给服务端
        PING_TIMES : 270000,

        //还原默认文字
        CHAT_HELLO_TEXT : '很幸运收到您的提问，我们可以开始聊天了~',

        //错误信息
        message : {
            empTyLoginParams : '手机号或密码为空',
            loginSuccess : '登录成功',
        },

        //WebSocket Type
        wsMessageType : {
            TYPE_LOGIN : 1, //登入
            TYPE_LOGOUT : 2, //登出
            TYPE_SAY : 3, //说话
            TYPE_PING : 4, //心跳包
            TYPE_SERVICE_NOTICE : 5, //服务端消息通知，比如通知客户端已接收到消息
            TYPE_CLIENT_NOTICE : 6, //客户端消息通知，比如通知服务端已接收到消息
            TYPE_QUESTION : 7, //提问问题
            TYPE_ANSWER : 8, //把问题发送给符合条件的用户
            TYPE_ANSWER_NOTICE : 9, //解答问题，并通知提问者
            TYPE_EVALUATE_NOTICE : 10, //问题采纳（点赞/评价）
            TYPE_RECEIVE_USER_NUM : 11, //提问问题的过程中，如果有用户接收到问题，则返回接收到的用户
            TYPE_FRIEND_APPLY : 12, //申请好友
            TYPE_FRIEND_AGREE : 13, //同意好友申请
        },


        contentType : { //内容类型
            TYPE_TEXT : 1, //文字
            TYPE_IMAGE : 2, //图片
            TYPE_AUDIO : 3, //语音
        },



    };


    return constants;
});
