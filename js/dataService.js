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

        removeUser : removeUser,
    }

    function removeUser(uid) {
        for (var i = 0; i < this.users.length; i++) {
            if (users[i].uid == uid) {
                users.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    return data;

});