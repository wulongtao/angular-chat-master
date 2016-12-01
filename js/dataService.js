/**
 * Created by raid on 2016/11/18.
 */
angular.module('dataService', ['maConstants']).factory('dataService', function (maConstants) {
    const CONST_CHAT_INDEX = 'microchat';
    const CONST_QUE_INDEX = 'question';

    var data = {
        users : [], //客服用户
        tousers : {}, //聊天的另外一个用户
        questions : {}, //每个用户分别的问题列表
        chatlogs : {},

        //界面中用到的变量
        uiVar : {
            loginParams : {
                userPhone : "",
                userPasswd : ""
            },
            userSend : {
                content : "",
                contentType : maConstants.contentType.TYPE_TEXT,
            },
            loginDialogActive : false,

            userActive : 0,
            touserActive : {},
            queActive : 0,

            isLoading : 0,
            hasMoreQue : 1,
        },


        //展示在聊天界面中的问题数据
        questionsInfo : [],
        //展示在聊天页面中的聊天记录
        chatlogInfo : [],
        //展示在页面中的聊天标题
        touserInfo : {},

        init : init, //初始化dataService，读取localStorage中的数据
        initUserSend : initUserSend, //初始化聊天发送框的值

        /**
         * 用户相关操作
         */
        addUser : addUser, //添加用户
        removeUser : removeUser, //删除用户
        getUser : getUser, //获取用户
        addToUser : addToUser, //添加聊天的另外一个用户
        removeToUser : removeToUser, //删除
        getToUser : getToUser, //获取
        getToUsers : getToUsers, //获取


        /**
         * 问题相关操作
         */
        getQuestions : getQuestions, //获取指定用户的问题列表
        addQuestion : addQuestion, //添加问题
        removeQuestion : removeQuestion, //删除问题
        clearQuestions : clearQuestions, //删除某个用户收到的所有问题

        /**
         *  展示问题相关操作
         */
        addQuestionsInfo : addQuestionsInfo,
        removeQuestionInfo : removeQuestionInfo,
        clearQuestionsInfo : clearQuestionsInfo,


        /**
         * 聊天记录相关操作
         */
        chatlog : chatlog, //添加或者获取聊天记录

        clearChatlogInfo : clearChatlogInfo,
        replaceChatlogInfo : replaceChatlogInfo,

        /**
         * 聊天对方用户展示相关操作
         */
        initTouserInfo : initTouserInfo,

    };

    function init() {
        var microchat = JSON.parse(localStorage.getItem(CONST_CHAT_INDEX));

        if (!microchat) {
            return ;
        }
        if (microchat.users) {
            this.users = microchat.users;
        }
        if (microchat.tousers) {
            this.tousers = microchat.tousers;
        }
        if (microchat.questions) {
            this.questions = microchat.questions;
        }
        if (microchat.chatlogs) {
            this.chatlogs = microchat.chatlogs;
        }

        return microchat;
    }

    function initUserSend() {
        this.uiVar.userSend.content = "";
        this.uiVar.userSend.contentType = maConstants.contentType.TYPE_TEXT;
    }

    function addUser(user) {

        this.users.push({
            uid : user.uid,
            sid : user.sid,
            nick : user.nick,
            avatar : user.avatar
        });
        save();
    }

    function removeUser(uid) {
        for (var i = 0; i < this.users.length; i++) {
            if (this.users[i]['uid'] == uid) {
                this.users.splice(i, 1);
                save();
                return true;
            }
        }

        return false;
    }

    function getUser(uid) {
        for (var i = 0; i < this.users.length; i++) {
            if (this.users[i]['uid'] == uid) {
                return this.users[i];
            }
        }
        return null;
    }

    function addToUser(uid, touserInfo) {
        this.tousers[uid].push({
            uid : touserInfo.uid,
            nick : touserInfo.nick,
            avatar : touserInfo.avatar,
            qid : touserInfo.qid,
            contentType : touserInfo.contentType,
            content : touserInfo.content,
            address : touserInfo.address
        });
        save();
    }

    function removeToUser(uid, touserId) {

        if (!this.tousers[uid] || !Array.isArray(this.tousers[uid]))
            return false;

        for (var i = 0; i < this.tousers[uid].length; i++) {
            if (this.tousers[uid][i].uid === touserId) {
                this.tousers[uid].splice(i, 1);
                save();
                return true;
            }
        }

        return false;
    }

    function getToUser(uid, touserId) {
        if (!this.tousers[uid] || !Array.isArray(this.tousers[uid]) || this.tousers.length === 0)
            return null;

        for (var i = 0; i < this.tousers[uid].length; i++) {
            if (touserId == this.tousers[uid][i].uid) {
                return this.tousers[uid][i];
            }
        }

        return null;
    }

    function getToUsers(uid) {
        if (!this.tousers[uid] || !Array.isArray(this.tousers[uid]))
            return [];

        return this.tousers[uid];
    }

    function getQuestions(uid) {
        var index = CONST_QUE_INDEX + uid;
        if (!this.questions[index]) {
            return null;
        }
        return this.questions[index];
    }

    function addQuestion(uid, qid) {
        var index = CONST_QUE_INDEX + uid;
        if (!this.questions[index]) {
            this.questions[index] = [];
        }
        if (this.questions[index].indexOf(qid) !== -1) return false;
        this.questions[index].push(qid);
        save();
    }

    function removeQuestion(uid, qid) {
        var index = CONST_QUE_INDEX + uid;
        if (!this.questions[index]) {
            return false;
        }
        var k = this.questions[index].indexOf(qid);
        if (k === -1) {
            return false;
        }
        this.questions[index].splice(k, 1);
        save();
        return true;
    }

    function clearQuestions(uid) {
        var index = CONST_QUE_INDEX + uid;
        delete this.questions[index];

        save();
        return true;
    }

    function addQuestionsInfo(questionsInfo, needClear) {
        if (needClear) this.questionsInfo.length = 0; //清空数组
        for (var i = 0; i < questionsInfo.length; i++) {
            this.questionsInfo.push(questionsInfo[i]);
        }
    }
    function removeQuestionInfo(qid) {
        for (var i = 0; i < this.questionsInfo.length; i++) {
            if (this.questionsInfo[i].qid == qid) {
                this.questionsInfo.splice(i, 1);
            }
        }
    }
    function clearQuestionsInfo() {
        this.questionsInfo.length = 0;
        return true;
    }

    /**
     * 添加或者获取chatlogs
     * @param uid
     * @param toUserId
     * @param qid
     * @param chatlog 不传为获取
     */
    function chatlog(uid, toUserId, qid, chatlog) {
        chatlog = typeof chatlog !== 'undefined' ?  chatlog : undefined;

        if (chatlog === undefined) {
            if (!this.chatlogs[uid] || !this.chatlogs[uid][toUserId]
                || !this.chatlogs[uid][toUserId][qid] || !Array.isArray(this.chatlogs[uid][toUserId][qid])) {
                return [];
            }

            return this.chatlogs[uid][toUserId][qid];

        } else if (chatlog === null) {
            if (this.chatlogs[uid]==undefined || this.chatlogs[uid][toUserId]==undefined || this.chatlogs[uid][toUserId][qid]==undefined) return true;

            delete this.chatlogs[uid][toUserId][qid];
            return true;
        } else {
            //判断+创建
            if (this.chatlogs[uid] === undefined) {
                this.chatlogs[uid] = {};
            }
            if (this.chatlogs[uid][toUserId] === undefined) {
                this.chatlogs[uid][toUserId] = {};
            }
            if (this.chatlogs[uid][toUserId][qid] === undefined || !Array.isArray(this.chatlogs[uid][toUserId][qid])) {
                this.chatlogs[uid][toUserId][qid] = [];
            }

            this.chatlogs[uid][toUserId][qid].push(chatlog);
            save();
        }
    }

    function clearChatlogInfo() {
        this.chatlogInfo.length = 0;
    }

    function replaceChatlogInfo(uid, touserId, qid) {
        this.chatlogInfo.length = 0;
        var chatlog = this.chatlog(uid, touserId, qid);
        for (var i = 0; i < chatlog.length; i++) {
            this.chatlogInfo.push(chatlog[i]);
        }
    }

    /**
     * 初始化toUserInfo
     * @param data json
     */
    function initTouserInfo(data) {
        data = typeof data !== 'undefined' ?  data : {};
        this.touserInfo.uid = data.uid ? data.uid : 0;
        this.touserInfo.qid = data.qid ? data.qid : 0;
        this.touserInfo.nick = data.nick ? data.nick : '猪猪微答';
        this.touserInfo.avatar = data.avatar ? data.avatar : 'http://weida.products-test.zhuzhu.com/static/images/ma-operator/login-logo.png';
        this.touserInfo.content = data.content ? data.content : '客服聊天系统';
        this.touserInfo.contentType = data.contentType ? data.contentType : maConstants.contentType.TYPE_TEXT;
        this.touserInfo.address = data.address ? data.address : "";
    }


    function save() {
        localStorage.setItem(CONST_CHAT_INDEX, JSON.stringify({
            users : data.users,
            tousers : data.tousers,
            questions : data.questions,
            chatlogs : data.chatlogs,
        }));
    }


    return data;

});