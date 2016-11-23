/**
 * Created by raid on 2016/11/18.
 */
angular.module('dataService', []).factory('dataService', function () {
    const CONST_CHAT_INDEX = 'microchat';

    var data = {
        users : [],
        tousers : [],

        //界面中用到的变量
        uiVar : {
            loginParams : {
                userPhone : "",
                userPasswd : ""
            },
            loginDialogActive : false,

        },

        init : init, //初始化dataService，读取localStorage中的数据

        addUser : addUser, //添加用户
        removeUser : removeUser, //删除用户
        getUser : getUser, //获取用户
        getAllLocalUser : getAllLocalUser, //获取所有用户
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

    function getAllLocalUser() {

    }

    function save() {
        localStorage.setItem(CONST_CHAT_INDEX, JSON.stringify({
            users : data.users,
            tousers : data.tousers}));
    }


    return data;

});