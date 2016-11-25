/**
 * Created by raid on 2016/11/18.
 */
angular.module('dataService', []).factory('dataService', function () {
    const CONST_CHAT_INDEX = 'microchat';
    const CONST_QUE_INDEX = 'question';

    var data = {
        users : [], //客服用户
        tousers : {}, //聊天的另外一个用户
        questions : {}, //每个用户分别的问题列表

        //界面中用到的变量
        uiVar : {
            loginParams : {
                userPhone : "",
                userPasswd : ""
            },
            loginDialogActive : false,

            userActive : 0,
            touserActive : {},
            queActive : 0,

        },
        //展示在聊天界面中的问题数据
        questionsInfo : [],

        init : init, //初始化dataService，读取localStorage中的数据

        /**
         * 用户相关操作
         */
        addUser : addUser, //添加用户
        removeUser : removeUser, //删除用户
        getUser : getUser, //获取用户
        addToUser : addToUser, //添加聊天的另外一个用户
        removeToUser : removeToUser, //删除
        getToUsers : getToUsers, //获取


        /**
         * 问题相关操作
         */
        getQuestions : getQuestions, //获取指定用户的问题列表
        addQuestion : addQuestion, //添加问题
        removeQuestion : removeQuestion, //删除问题

        /**
         *  展示问题相关操作
         */
        addQuestionsInfo : addQuestionsInfo,
        removeQuestionInfo : removeQuestionInfo,

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

        return microchat;
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
        if (!this.tousers[uid]) {
            this.tousers[uid] = [];
        }
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

    function addQuestionsInfo(questionsInfo) {
        this.questionsInfo.length = 0; //
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

    function save() {
        localStorage.setItem(CONST_CHAT_INDEX, JSON.stringify({
            users : data.users,
            tousers : data.tousers,
            questions : data.questions
        }));
    }


    return data;

});