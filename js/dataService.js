/**
 * Created by raid on 2016/11/18.
 */
angular.module('dataService', []).factory('dataService', function () {
    const CONST_CHAT_INDEX = 'microchat';
    const CONST_QUE_INDEX = 'question';

    var data = {
        users : [],
        tousers : [],
        questions : {},

        //界面中用到的变量
        uiVar : {
            loginParams : {
                userPhone : "",
                userPasswd : ""
            },
            loginDialogActive : false,

        },
        //展示在聊天界面中的问题数据
        questionsInfo : {},

        init : init, //初始化dataService，读取localStorage中的数据

        /**
         * 用户相关操作
         */
        addUser : addUser, //添加用户
        removeUser : removeUser, //删除用户
        getUser : getUser, //获取用户


        /**
         * 问题相关操作
         */
        addQuestion : addQuestion, //添加问题
        removeQuestion : removeQuestion, //删除问题

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

        console.log(this.users);

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

    function save() {
        localStorage.setItem(CONST_CHAT_INDEX, JSON.stringify({
            users : data.users,
            tousers : data.tousers,
            questions : data.questions
        }));
    }


    return data;

});