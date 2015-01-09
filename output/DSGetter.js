/**
 * Created by lujintan on 12/1/14.
 */
define(["require", "exports", './utils', './declare'], function (require, exports, util, decl) {
    var win = decl.win;
    /**
     * Ajax Creator
     */
    var Ajax = (function () {
        function Ajax(url) {
            this.url = url;
        }
        /**
         * get XMLHttpRequest Object
         * @returns {any}
         */
        Ajax.prototype.getXhr = function () {
            if (this.xhr) {
                return this.xhr;
            }
            try {
                if (win.ActiveXObject) {
                    return this.xhr = new win.ActiveXObject('Microsoft.XMLHTTP');
                }
                else {
                    return this.xhr = new win.XMLHttpRequest();
                }
            }
            catch (e) {
            }
        };
        /**
         * the base callback of the ajax
         * @returns {Promise}
         */
        Ajax.prototype.callback = function () {
            var defered = win.wow.promise.defer();
            if (DSGetter.cancelTime > this.sendTime) {
                return defered.promise;
            }
            var xhr = this.xhr;
            try {
                if (xhr.readyState === 4) {
                    var status = xhr.status, text = xhr.responseText;
                    if (!status) {
                        status = text ? 200 : 404;
                    }
                    else if (status === 1223) {
                        status = 204;
                    }
                    if (status >= 200 && status < 300) {
                        var data = util.lang.parseJson(text);
                        defered.resolve(data);
                    }
                    else {
                        defered.reject(xhr);
                    }
                }
                else {
                    defered.reject(xhr);
                }
            }
            catch (e) {
                defered.reject(xhr);
            }
            return defered.promise;
        };
        /**
         * send request
         * @returns {Promise}
         */
        Ajax.prototype.send = function () {
            var defered = win.wow.promise.defer(), _this = this, xhr = _this.getXhr(), callback = _this.callback;
            _this.sendTime = new Date().getTime();
            if (_this.sendTime < DSGetter.cancelTime) {
                defered.reject();
                return defered.promise;
            }
            xhr.open('GET', _this.url, true);
            xhr.send();
            if (xhr.readyState === 4) {
                setTimeout(function () {
                    _this.callback().done(function (data) {
                        defered.resolve(data);
                    });
                }, 0);
            }
            else {
                xhr.onreadystatechange = function () {
                    _this.callback().done(function (data) {
                        defered.resolve(data);
                    });
                };
            }
            return defered.promise;
        };
        return Ajax;
    })();
    /**
     * To get data source from server
     * The default DSGetter is based on ajax
     */
    var DSGetter = (function () {
        function DSGetter() {
        }
        DSGetter.get = function (url) {
            var ajax = new Ajax(url);
            return ajax.send();
        };
        DSGetter.cancelAll = function () {
            DSGetter.cancelTime = new Date().getTime();
        };
        DSGetter.cancelTime = 0; //last time of cancel request
        return DSGetter;
    })();
    return DSGetter;
});
