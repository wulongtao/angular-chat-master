/**
 * Created by raid on 2016/11/10.
 */

function StorageUtil() {
    const APP_PREFIX = 'zz';
    const ALL_USERS_PREFIX = 'users';
    const USER_PREFIX = 'user';
    const TOUSER_PREFIX = 'touser'
    const ALL_QUESTIONS_PREFIX = 'questions';
    const QUESTION_PREFIX = 'question';
    const CHAT_LOGS_PREFIX = 'chatlogs';

    var chatStorage = {
        'users' : {},
        'questions' : {},
        'chatlogs' : {}
    };
    init();


    /**
     * 初始化获取localStorage中的数据并保存在内存中
     */
    function init() {
        var zzStorage = JSON.parse(localStorage.getItem(APP_PREFIX));
        if (zzStorage == null) {
            return ;
        }
        for (var i in zzStorage) {
            chatStorage[i] = zzStorage[i];
        }
    }

    /**
     * 获取、增加、删除user
     * @param uid 用户ID
     * @param user json对象，null时为删除,不传为返回
     */
    function user(uid, user) {
        user = typeof user !== 'undefined' ?  user : -1;
        if (user == -1) {
            return chatStorage[ALL_USERS_PREFIX][USER_PREFIX][uid];
        } else if (user === null) {
            delete chatStorage[ALL_USERS_PREFIX][USER_PREFIX][uid];
        } else {
            if (typeof chatStorage[ALL_USERS_PREFIX][USER_PREFIX] === 'undefined') {
                chatStorage[ALL_USERS_PREFIX][USER_PREFIX] = {};
            }
            chatStorage[ALL_USERS_PREFIX][USER_PREFIX][uid] = user;
        }
    }

    /**
     * 获取、增加、删除touser
     * @param uid 用户ID
     * @param user json对象，null时为删除,不传为返回
     */
    function toUser(uid, user) {
        user = typeof user !== 'undefined' ?  user : -1;
        if (user == -1) {
            return chatStorage[ALL_USERS_PREFIX][TOUSER_PREFIX][uid];
        } else if (user === null) {
            delete chatStorage[ALL_USERS_PREFIX][TOUSER_PREFIX][uid];
        } else {
            if (typeof chatStorage[ALL_USERS_PREFIX][TOUSER_PREFIX] === 'undefined') {
                chatStorage[ALL_USERS_PREFIX][TOUSER_PREFIX] = {};
            }
            chatStorage[ALL_USERS_PREFIX][TOUSER_PREFIX][uid] = user;
        }
    }

    /**
     * 设置问题
     * @param qid 问题ID
     * @param exceptUid 不设置的uid
     */
    function setQuestion(qid, exceptUid) {
        exceptUid = typeof exceptUid !== 'undefined' ?  exceptUid : 0;
        for (var i in chatStorage[ALL_QUESTIONS_PREFIX]) {
            if (i == exceptUid) continue;

            if ((typeof chatStorage[ALL_QUESTIONS_PREFIX][i] !== 'undefined')&&(chatStorage[ALL_QUESTIONS_PREFIX][i].indexOf(qid) == -1)) {
                chatStorage[ALL_QUESTIONS_PREFIX][i].push(qid);
            }
        }
    }

    /**
     * 删除问题
     * @param qid 问题ID
     * @param deleteAll 是否是删除操作,是则传true，否则传uid
     * @constructor
     */
    function deleteQuestion(qid, deleteAll) {
        if (deleteAll === true) {
            chatStorage[ALL_QUESTIONS_PREFIX][uid].splice(chatStorage[ALL_QUESTIONS_PREFIX][uid].indexOf(qid), 1);
        } else {
            for (var i in chatStorage[ALL_QUESTIONS_PREFIX]) {
                chatStorage[ALL_QUESTIONS_PREFIX][i].splice(chatStorage[ALL_QUESTIONS_PREFIX][i].indexOf(qid), 1);
            }
        }
    }

    /**
     * 聊天记录相关操作：获取，删除，设置
     * @param uid
     * @param toUserId
     * @param qid
     * @param chatlogs 不传为获取，传null为删除，其他为设置
     * @returns {*}
     */
    function chatlogs(uid, toUserId, qid, chatlogs) {
        qid = typeof qid !== 'undefined' ?  qid : 0;
        chatlogs = typeof chatlogs !== 'undefined' ?  (typeof chatlogs === 'string' ? JSON.parse(chatlogs) : chatlogs) : -1;

        if (chatlogs === -1) { //获取相关聊天记录
            var chatlog = null;
            try {
                chatlog = chatStorage[CHAT_LOGS_PREFIX][USER_PREFIX+uid][TOUSER_PREFIX+toUserId][QUESTION_PREFIX+qid];
            } catch (e) {
                return Array();
            }
            return chatlog == null ? new Array() : chatlog;
        } else if (chatlogs === null) { //删除记录
            delete chatStorage[CHAT_LOGS_PREFIX][USER_PREFIX+uid][TOUSER_PREFIX+toUserId][QUESTION_PREFIX+qid];
        } else  { //保存记录
            if (typeof chatStorage[CHAT_LOGS_PREFIX][USER_PREFIX+uid] === 'undefined') {
                chatStorage[CHAT_LOGS_PREFIX][USER_PREFIX+uid] = {};
            }
            if (typeof chatStorage[CHAT_LOGS_PREFIX][USER_PREFIX+uid][TOUSER_PREFIX+toUserId] === 'undefined') {
                chatStorage[CHAT_LOGS_PREFIX][USER_PREFIX+uid][TOUSER_PREFIX+toUserId] = {};
            }
            if (typeof chatStorage[CHAT_LOGS_PREFIX][USER_PREFIX+uid][TOUSER_PREFIX+toUserId][QUESTION_PREFIX+qid] === 'undefined') {
                chatStorage[CHAT_LOGS_PREFIX][USER_PREFIX+uid][TOUSER_PREFIX+toUserId][QUESTION_PREFIX+qid] = {};
            }
            chatStorage[CHAT_LOGS_PREFIX][USER_PREFIX+uid][TOUSER_PREFIX+toUserId][QUESTION_PREFIX+qid].push(chatlogs);
        }

    }

    /**
     * 保存localStorage
     */
    function saveStorage() {
        localStorage.setItem(APP_PREFIX, JSON.stringify(chatStorage));
    }

    /**
     * 清除localStorage
     */
    function clearStorage() {
        localStorage.removeItem(APP_PREFIX);
    }
}