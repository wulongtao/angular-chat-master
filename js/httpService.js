/**
 * Created by raid on 2016/11/16.
 * 此函数封装了一层http函数
 */
angular.module('httpService', [])
    .service('httpService', HttpUtil);


/**
 * http请求工具类
 * @param $http
 * @param $q
 * @returns {{get: service.get}}
 * @constructor
 */
function HttpUtil($http, $q) {
    var service = {
        get : function (url, config) {
            return handle('get', url, null, config);
        },
        post : function (url, data, config) {
            return handle('post', url, data, config);
        },
        put : function (url, data, config) {
            return handle('put', url, data, config);
        }
    };


    function handle(method, url, data, config) {

        var promise;
        var defer = $q.defer();
        switch (method) {
            case 'get' :
                promise = $http.get(url, config);
                break;
            case 'post' :
                promise = $http.post(url, data, config);
                break;
            case 'put':
                promise = $http.put(url, data, config);
                break;
        }

        promise.then(function (rep) {
            defer.resolve(rep.data);
        }, function () {
            defer.reject('error');
        });

        return defer.promise;

    }

    return service;
}

