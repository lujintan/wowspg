define(["require", "exports", './declare'], function (require, exports, decl) {
    var win = decl.win;
    var lang;
    (function (lang) {
        /**
         * add event listener to a dom
         * @param elem
         * @param type
         * @param evenHandle
         */
        function addEventListener(elem, type, evenHandle) {
            if (elem.addEventListener) {
                elem.addEventListener(type, evenHandle, false);
            }
            else if (elem.attachEvent) {
                elem.attachEvent('on' + type, evenHandle);
            }
        }
        lang.addEventListener = addEventListener;
        /**
         * prevent the default action
         * @param even
         */
        function eventPreventDefault(even) {
            if (even && even.preventDefault) {
                even.preventDefault();
            }
            else {
                window.event.returnValue = false;
            }
        }
        lang.eventPreventDefault = eventPreventDefault;
        /**
         * array for each
         * @param arr
         * @param callback
         */
        function arrayForEach(arr, callback) {
            for (var i = 0, len = arr.length; i < len; i++) {
                if (callback(arr[i], i) === false) {
                    break;
                }
            }
        }
        lang.arrayForEach = arrayForEach;
        /**
         * object for in
         * @param obj
         * @param callback
         */
        function objForIn(obj, callback) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (callback(obj[key], key) === false) {
                        break;
                    }
                }
            }
        }
        lang.objForIn = objForIn;
        /**
         * an empty function
         */
        function fnEmpty() {
        }
        lang.fnEmpty = fnEmpty;
        /**
         * an empty function which return a Promise
         * @returns {Promise}
         */
        function fnThenEmpty() {
            var deferred = win.wow.promise.defer();
            deferred.resolve();
            return deferred.promise;
        }
        lang.fnThenEmpty = fnThenEmpty;
        /**
         * json parse
         * @param data
         * @returns {*}
         */
        function parseJson(data) {
            if (!data || typeof data !== 'string') {
                return null;
            }
            if (win.JSON && win.JSON.parse) {
                return win.JSON.parse(data);
            }
            if (/^[\],:{}\s]*$/.test(data.replace(/\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g, "@").replace(/"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                return (new Function('return ' + data))();
            }
            throw new Error("Invalid JSON: " + data);
            return;
        }
        lang.parseJson = parseJson;
        /**
         * extend a object's properties by anther
         * @param objs
         * @returns {Object}
         */
        function objExtend() {
            var objs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                objs[_i - 0] = arguments[_i];
            }
            var toObj = {};
            arrayForEach(objs, function (obj) {
                if (typeof obj === 'object') {
                    objForIn(obj, function (item, key) {
                        toObj[key] = item;
                    });
                }
            });
            return toObj;
        }
        lang.objExtend = objExtend;
        /**
         * _require resource from server
         * @param modules
         * @returns {Promise}
         * @private
         */
        function _require(modules) {
            var defered = win.wow.promise.defer();
            require(modules, function () {
                var mods = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    mods[_i - 0] = arguments[_i];
                }
                defered.resolve(mods);
            }, function (err) {
                defered.reject(err);
            });
            return defered.promise;
        }
        lang._require = _require;
        /**
         * generate a random id
         * @param prevStr
         * @returns {string}
         */
        function generateRandomId(prevStr) {
            if (prevStr === void 0) { prevStr = ''; }
            return 'wowId' + prevStr + new Date().getTime();
        }
        lang.generateRandomId = generateRandomId;
        /**
         * path join
         * @param base
         * @param rel
         */
        function mergePath(base, rel) {
            var baseInfo = base.split('?');
            var relInfo = rel.split('?');
            var base = baseInfo[0].replace(/\/$/, '');
            var baseParam = baseInfo[1];
            if (!baseParam) {
                baseParam = '';
            }
            else {
                baseParam = '?' + baseParam;
            }
            var rel = relInfo[0];
            var relParam = relInfo[1];
            if (relParam) {
                baseParam = '?' + relParam;
            }
            if (/^\.\./.test(rel)) {
                base += '/';
            }
            if (rel[0] === '#') {
                return rel;
            }
            var base_path = base.split(/\/+/);
            var rel_path = rel.split(/\/+/);
            if (base_path[base_path.length - 1] === '..') {
                base_path.push('');
            }
            var i;
            while ((i = base_path.indexOf('..')) + 1) {
                base_path = base_path.slice(i - 1, 2);
            }
            if (!base_path.length) {
                base_path = [''];
            }
            else {
                base_path.pop();
            }
            if (rel_path[rel_path.length - 1] === '.' || rel_path[rel_path.length - 1] === '..') {
                rel_path.push('');
            }
            var old_rel_path = rel_path;
            rel_path = [];
            for (var i = 0, l = old_rel_path.length; i < l; i++) {
                if (old_rel_path[i] != '.') {
                    rel_path.push(old_rel_path[i]);
                }
            }
            var tmp = [];
            for (var i = 0, l = rel_path.length; i < l; i++) {
                var x = rel_path[i];
                if (x == '..' && !(tmp.length == 0 || tmp[tmp.length - 1] == '..')) {
                    tmp.pop();
                }
                else {
                    tmp.push(x);
                }
            }
            var add_trailer_slash = true;
            var x;
            while (x = tmp.shift()) {
                if (x === '..' && base_path.length > 1) {
                    base_path.pop();
                }
                else {
                    base_path.push(x);
                    for (var i = 0, l = tmp.length; i < l; i++) {
                        var t = tmp[i];
                        base_path.push(t);
                    }
                    add_trailer_slash = false;
                    break;
                }
            }
            if (add_trailer_slash) {
                base_path.push('');
            }
            return base_path.join('/') + baseParam;
        }
        lang.mergePath = mergePath;
    })(lang = exports.lang || (exports.lang = {}));
    var cus;
    (function (cus) {
        /**
         * get the render url
         * @param href
         * @param baseUrl
         * @returns {string}
         */
        function getRenderUrl(href, baseUrl) {
            var _renderUrl;
            if (href.indexOf(baseUrl) > -1) {
                _renderUrl = href.replace(baseUrl, '');
            }
            else if (!/^(http|https|ftp):\/\//.test(href) && !/^#/.test(href) && !/javascript:/.test(href)) {
                _renderUrl = href;
            }
            if (!/^\//.test(_renderUrl) && typeof _renderUrl !== 'undefined') {
                var base = getRenderUrl(location.href, baseUrl);
                _renderUrl = lang.mergePath(base, _renderUrl);
            }
            return _renderUrl;
        }
        cus.getRenderUrl = getRenderUrl;
        /**
         * get real regexp by the router key
         * @param regStr
         * @returns {RegExp}
         */
        function getRenderReg(regStr) {
            var reg = new RegExp(regStr), keys = [];
            if (regStr === '/') {
                reg = /^\/(\?[^#]*)?$/;
            }
            else {
                var regString = '';
                if (/^\//.test(regStr)) {
                    regString = '^' + regString;
                }
                if (/\/$/.test(regStr)) {
                    regString += regStr.replace(/\/$/, '/?(\\?[^#]*)?$');
                }
                else {
                    regString += regStr;
                }
                regString = regString.replace(/\(:([^\)]+)\)/g, function (str, key) {
                    keys.push(key);
                    return '([^\\)/?#]+)';
                });
                reg = new RegExp(regString);
            }
            return reg;
        }
        cus.getRenderReg = getRenderReg;
        /**
         * get url params
         * @param url
         * @returns {*}
         */
        function getUrlParams(url) {
            if (!/\?/.test(url)) {
                return {};
            }
            var url = url.replace(/[^?]*\?/, ''), queries = url.split('&'), params = {};
            lang.arrayForEach(queries, function (query, i) {
                var keyVal = query.split('=');
                if (keyVal.length === 2) {
                    params[keyVal[0]] = keyVal[1];
                }
            });
            return params;
        }
        cus.getUrlParams = getUrlParams;
    })(cus = exports.cus || (exports.cus = {}));
    /**
     * some flags for
     */
    var flag;
    (function (flag) {
        /**
         * detect weather the browser support the history api
         * @type {boolean}
         */
        flag.supportHistory = !!history.pushState;
    })(flag = exports.flag || (exports.flag = {}));
});
