/**
 * 此函数存放所有的http请求
 * Created by raid on 2016/11/16.
 */
angular.module('urlService', ['ngFileUpload', 'httpService']).factory('urlService', function (httpService, Upload) {
    // const HTTP_URL_PREFIX = "http://weida.products-test.zhuzhu.com";
    const HTTP_URL_PREFIX = "";

    var service = {
        user : { //用户相关
            add : addUser, //客服帐号登录
            userQuestionInfo : getUserQuestionInfo, //获取用户信息
            userLogout : userLogout, //注销用户
        },
        question : { //问题相关
            questionsDetail : getQuestionsDetail, //获取问题列表
            getEmojiH5 : getEmojiH5, //聊天内容解析Emoji表情
            thankUser : thankUser, //感谢回答者
            setPrivacy : setPrivacy, //设置私密
        },
        upload : { //文件上传相关
            uploadImg : uploadImg, //上传图片文件
        }
    };

    return service;

    function addUser(phone, passwd) {
        return httpService.get(HTTP_URL_PREFIX + "/?_c=microAnswerOperator&_a=addUser&phone="+phone+"&password="+passwd
            ).then(function (data) {
                return data;
            });
    }

    function userLogout(uid) {
        return httpService.get(HTTP_URL_PREFIX + "/?_c=microAnswerOperator&_a=userLogout&uid="+uid
        ).then(function (data) {
            return data;
        });
    }

    function getQuestionsDetail(qids, page) {
        page = typeof page !== 'undefined' ?  page : 1;

        if (!Array.isArray(qids)) return false;
        qids = qids.join(',');
        return httpService.get(HTTP_URL_PREFIX + "/?_c=microAnswerOperator&_a=questionsDetail&qids="+qids+"&page="+page
        ).then(function (data) {
            return data;
        });
    }

    function getUserQuestionInfo(uid, qid) {
        uid = parseInt(uid);
        if (!uid) return false;

        return httpService.get(HTTP_URL_PREFIX + "/?_c=microAnswerOperator&_a=userQuestionInfo&uid="+uid+"&qid="+qid)
            .then(function (data) {
                return data;
            });
    }
    
    function uploadImg(file, callback) {
        Upload.upload({
            url: "/?_c=microAnswerOperator&_a=uploadImage",
            data: {file: file}
        }).then(function (resp) {
            callback(resp.data);
        }, function (resp) {
            console.log('Error status: ' + resp.status);
        }, function (evt) {
        });
    }

    function getEmojiH5(content1, content2) {
        content1 = typeof content1 !== 'undefined' ?  content1 : '';
        content2 = typeof content2 !== 'undefined' ?  content2 : '';

        return httpService.get(HTTP_URL_PREFIX + "/?_c=microAnswerOperator&_a=getEmojiH5&content1="+content1+"&content2="+content2)
            .then(function (data) {
                return data;
            });
    }
    
    function thankUser(uid, randId) {
        return httpService.get(HTTP_URL_PREFIX + "/?_c=microAnswerOperator&_a=thankUser&uid="+uid+"&aid="+randId)
            .then(function (data) {
                return data;
            });
    }
    
    function setPrivacy(uid, qid, targetUserId, type) {
        return httpService.get(HTTP_URL_PREFIX + "/?_c=microAnswerOperator&_a=setPrivacy&uid="+uid+"&qid="+qid+"&targetUserId="+targetUserId+"&type="+type)
            .then(function (data) {
                return data;
            });
    }
});




