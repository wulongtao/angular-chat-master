/**
 * Created by raid on 2016/11/16.
 */
angular.module('httpService', [])
    .service('HttpService', HttpUtil);


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
            if (rep.data.success || rep.data.status == 1) {
                defer.resolve(rep.data);
            } else {
                console.log(rep.data.message);
            }
        }, function () {
            defer.reject('error');
        });

        return defer.promise;

    }

    return service;
}

