/**
 * Created by raid on 2016/11/18.
 */
angular.module('dataService', []).factory('dataService', function () {

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

        addUser : addUser, //添加用户
        removeUser : removeUser, //删除用户
        getUser : getUser, //获取用户
    };

    function addUser(user) {
        // this.users.push(user);
        this.users[user.uid] = user;
    }

    function removeUser(uid) {
        if (!this.users[uid]) {
            return false;
        }
        this.users.splice(uid, 1);

        return false;
    }

    function getUser(uid) {
        if (!this.users[uid]) {
            return null;
        }
        return this.users[uid];
    }

    return data;

});