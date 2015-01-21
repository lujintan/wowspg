/**
 * Created by lujintan on 12/1/14.
 */
define('common/lib/wowspg/declare',["require", "exports"], function (require, exports) {
    /**
     * declare the base namespace
     */
    var decl;
    (function (decl) {
        decl.win = window; //window
        decl.$ = decl.win.jQuery;
        decl.win.wow = {};
        decl.promise = (function () {
            if (decl.win.when) {
                decl.win.wow.promise = decl.win.when;
                return decl.win.wow.promise;
            }
            else if (decl.$ && decl.$.Deferred) {
                var _defer = function () {
                    var df = decl.$.Deferred();
                    df.promise = df.promise();
                    return df;
                };
                decl.win.wow.promise = {
                    defer: _defer
                };
                return decl.win.wow.promise;
            }
        })();
        decl.selector = (function () {
            if (decl.win.Sizzle) {
                decl.win.wow.selector = decl.win.Sizzle;
                return decl.win.wow.selector;
            }
            else if (decl.$) {
                decl.win.wow.selector = decl.$;
                return decl.win.wow.promise;
            }
        })();
        decl.eventTrigger = (function () {
            if (decl.win.$) {
                return decl.win.wow.eventTrigger = function (elem, eventName, data) {
                    decl.$(elem).trigger(eventName, data);
                };
            }
        })();
    })(decl || (decl = {}));
    return decl;
});

define('common/lib/wowspg/utils',["require", "exports", './declare'], function (require, exports, decl) {
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

/**
 * Created by lujintan on 11/27/14.
 */
define('common/lib/wowspg/RenderOption',["require", "exports"], function (require, exports) {
    /**
     * Describe the render options
     */
    var RenderOption = (function () {
        function RenderOption(baseUrl, timeout, supportHistory, type, unGoClass, loader, url, promise, selector, eventTrigger) {
            if (baseUrl === void 0) { baseUrl = location.protocol + '//' + location.host; }
            if (timeout === void 0) { timeout = 30; }
            if (supportHistory === void 0) { supportHistory = true; }
            if (type === void 0) { type = 'all'; }
            if (unGoClass === void 0) { unGoClass = 'un-go'; }
            if (loader === void 0) { loader = function () {
            }; }
            this.baseUrl = baseUrl;
            this.timeout = timeout;
            this.supportHistory = supportHistory;
            this.type = type === 'hash' ? 'hash' : 'all';
            this.unGoClass = unGoClass;
            this.loader = loader;
            this.url = url;
            this.promise = promise;
            this.selector = selector;
            this.eventTrigger = eventTrigger;
        }
        RenderOption.prototype.getBaseUrl = function () {
            return this.baseUrl;
        };
        RenderOption.prototype.getTimeout = function () {
            return this.timeout;
        };
        RenderOption.prototype.geUrl = function () {
            return this.url;
        };
        RenderOption.prototype.getType = function () {
            return this.type;
        };
        RenderOption.prototype.getSupportHistory = function () {
            return this.supportHistory;
        };
        RenderOption.prototype.getLoader = function () {
            return this.loader;
        };
        RenderOption.prototype.getPromise = function () {
            return this.promise;
        };
        RenderOption.prototype.getSelector = function () {
            return this.selector;
        };
        RenderOption.prototype.getEventTrigger = function () {
            return this.eventTrigger;
        };
        RenderOption.prototype.getUnGoClass = function () {
            return this.unGoClass;
        };
        return RenderOption;
    })();
    return RenderOption;
});

/**
 * Created by lujintan on 12/4/14.
 */
define('common/lib/wowspg/Config',["require", "exports", './RenderOption'], function (require, exports, RenderOption) {
    /**
     * Setting and Getting wowspg's configuration
     */
    var Config = (function () {
        function Config() {
        }
        /**
         * set router configuration
         * @param routerConfig
         */
        Config.setRouterConfig = function (routerConfig) {
            Config.routerConfig = routerConfig;
        };
        /**
         * set options
         * @param opt
         */
        Config.setOption = function (opt) {
            Config.option = new RenderOption(opt.baseUrl, opt.timeout, opt.supportHistory, opt.type, opt.loader, opt.url, opt.promise, opt.selector, opt.eventTrigger);
        };
        /**
         * get wowspg's option
         * @returns {RenderOption}
         */
        Config.getOption = function () {
            return Config.option;
        };
        /**
         * get router configuration
         * @returns {Object}
         */
        Config.getRouterConfig = function () {
            return Config.routerConfig;
        };
        return Config;
    })();
    return Config;
});

define('common/lib/wowspg/UrlListener',["require", "exports", './utils', './Config'], function (require, exports, util, Config) {
    /**
     * bind popstate event when browser support history api
     * @param callback
     */
    function popStateHistoryListener(callback) {
        util.lang.addEventListener(window, 'popstate', function (e) {
            var state = history.state;
            if (!state || !state._id) {
                return;
            }
            callback(state._id);
        });
    }
    /**
     * bind hashchange event when browser do not support history api
     * @param callback
     */
    function hashHistoryListener(callback) {
        util.lang.addEventListener(window, 'hashchange', function (e) {
            callback();
        });
    }
    /**
     * To listen the url changing
     */
    var UrlListener = (function () {
        function UrlListener() {
        }
        /**
         * bind event when link click
         * @param callback
         */
        UrlListener.linkListener = function (callback) {
            var elemBody = document.body;
            var wowOption = Config.getOption();
            util.lang.addEventListener(elemBody, 'click', function (even) {
                var elemTarget = even.target || even.srcElement;
                if (elemTarget && elemTarget.nodeType === 1 && elemTarget.nodeName.toLocaleLowerCase() === 'a') {
                    var attrTarget = elemTarget.getAttribute('target');
                    var elemClassName = elemTarget.className || '';
                    if (elemClassName) {
                        var classes = elemClassName.split(' ');
                        var isUngo = false;
                        var unGoClass = wowOption.getUnGoClass();
                        util.lang.arrayForEach(classes, function (cla) {
                            if (cla === unGoClass) {
                                isUngo = true;
                                return false;
                            }
                        });
                        if (isUngo) {
                            return;
                        }
                    }
                    if (attrTarget === '_blank') {
                        return;
                    }
                    var href = elemTarget.getAttribute('href');
                    if (typeof href === 'undefined') {
                        return;
                    }
                    var renderUrl = util.cus.getRenderUrl(href, wowOption.getBaseUrl());
                    if (typeof renderUrl !== 'undefined') {
                        util.lang.eventPreventDefault(even);
                        callback(renderUrl);
                    }
                }
            });
        };
        /**
         * history listener
         * @type {function(Function): void|function(Function): void}
         */
        UrlListener.historyListener = (function () {
            if (util.flag.supportHistory) {
                return popStateHistoryListener;
            }
            else {
                return hashHistoryListener;
            }
        })();
        return UrlListener;
    })();
    return UrlListener;
});

define('common/lib/wowspg/Error',["require", "exports", './utils'], function (require, exports, util) {
    /**
     * Enumerate error's code
     */
    (function (ErrorType) {
        ErrorType[ErrorType["CONFIG_ERROR"] = 101] = "CONFIG_ERROR";
        ErrorType[ErrorType["ROUTER_MATCHING_STOPPED"] = 102] = "ROUTER_MATCHING_STOPPED";
        ErrorType[ErrorType["TIMEOUT_ERROR"] = 202] = "TIMEOUT_ERROR";
        ErrorType[ErrorType["BLOCK_ERROR"] = 303] = "BLOCK_ERROR";
        ErrorType[ErrorType["BLOCK_SELECTOR_IS_EMPTY"] = 310] = "BLOCK_SELECTOR_IS_EMPTY";
        ErrorType[ErrorType["BLOCK_DEPENDS_BLOCK_NOT_READY"] = 311] = "BLOCK_DEPENDS_BLOCK_NOT_READY";
        ErrorType[ErrorType["BLOCK_CONTAINER_NOT_EXIST"] = 311] = "BLOCK_CONTAINER_NOT_EXIST";
        ErrorType[ErrorType["PAGE_NOT_FOUND"] = 404] = "PAGE_NOT_FOUND";
        ErrorType[ErrorType["RUNTIME_ERROR"] = 505] = "RUNTIME_ERROR";
        ErrorType[ErrorType["RUNTIME_ERROR_RESOURCE_UNREADY"] = 506] = "RUNTIME_ERROR_RESOURCE_UNREADY";
        ErrorType[ErrorType["RESOURCE_LOAD_ERROR"] = 606] = "RESOURCE_LOAD_ERROR";
        ErrorType[ErrorType["RESOURCE_DATASOURCE_LOAD_FAIL"] = 610] = "RESOURCE_DATASOURCE_LOAD_FAIL";
    })(exports.ErrorType || (exports.ErrorType = {}));
    var ErrorType = exports.ErrorType;
    /**
     * Describe the Error information
     */
    var ErrorInfo = (function () {
        function ErrorInfo(code, message) {
            this.code = code;
            this.message = message;
        }
        ErrorInfo.prototype.getCode = function () {
            return this.code;
        };
        ErrorInfo.prototype.getMessage = function () {
            return this.message;
        };
        return ErrorInfo;
    })();
    exports.ErrorInfo = ErrorInfo;
    /**
     * An Error Controller to throw errors and maintain the default error list
     */
    var ErrorController = (function () {
        function ErrorController() {
        }
        /**
         * get error by error's type
         * @param err
         * @returns {ErrorInfo}
         */
        ErrorController.getError = function (err) {
            var errorInfo;
            util.lang.arrayForEach(this.ErrorList, function (item, index) {
                if (item.code === err) {
                    errorInfo = item;
                    return false;
                }
            });
            return errorInfo;
        };
        /**
         * Throw a error which contains the error's message
         * @param err error's type
         */
        ErrorController.trigger = function (err) {
            util.lang.arrayForEach(this.ErrorList, function (item, index) {
                if (item.code === err) {
                    throw new Error(item.message);
                    return false;
                }
            });
        };
        /**
         * Error List, contains error's describe and error's code
         * @type {any[]}
         */
        ErrorController.ErrorList = [
            new ErrorInfo(101 /* CONFIG_ERROR */, 'Config is error!'),
            new ErrorInfo(102 /* ROUTER_MATCHING_STOPPED */, 'Router matching has stopped!'),
            new ErrorInfo(202 /* TIMEOUT_ERROR */, 'Page load timeout!'),
            new ErrorInfo(303 /* BLOCK_ERROR */, 'Block render error!'),
            new ErrorInfo(310 /* BLOCK_SELECTOR_IS_EMPTY */, 'Block\'s selector is empty!'),
            new ErrorInfo(311 /* BLOCK_DEPENDS_BLOCK_NOT_READY */, 'The blocks depend on is not rendered!'),
            new ErrorInfo(311 /* BLOCK_CONTAINER_NOT_EXIST */, 'The block\'s container is not exist!'),
            new ErrorInfo(404 /* PAGE_NOT_FOUND */, 'Page is not found!'),
            new ErrorInfo(505 /* RUNTIME_ERROR */, 'Error found in page code!'),
            new ErrorInfo(506 /* RUNTIME_ERROR_RESOURCE_UNREADY */, 'Data source or first loaded resources unready!'),
            new ErrorInfo(606 /* RESOURCE_LOAD_ERROR */, 'Resouce load unsuccessful!'),
            new ErrorInfo(610 /* RESOURCE_DATASOURCE_LOAD_FAIL */, 'Data source load unsuccessful!')
        ];
        return ErrorController;
    })();
    exports.ErrorController = ErrorController;
});

/**
 * Created by lujintan on 11/26/14.
 */
define('common/lib/wowspg/History',["require", "exports"], function (require, exports) {
    /**
     * The site's history information
     */
    var History = (function () {
        function History(_id, url, title, data) {
            this._id = _id;
            this.url = url;
            this.title = title;
            this.data = data;
        }
        /**
         * add block's data to
         * @param name
         * @param data
         */
        History.prototype.addBlockData = function (name, data) {
            this.data[name] = data;
        };
        History.prototype.getId = function () {
            return this._id;
        };
        History.prototype.getData = function () {
            return this.data;
        };
        History.prototype.getTitle = function () {
            return this.title;
        };
        History.prototype.getUrl = function () {
            return this.url;
        };
        return History;
    })();
    return History;
});

/**
 * Created by lujintan on 11/26/14.
 */
define('common/lib/wowspg/HistoryStack',["require", "exports", './History', './utils', './Config', './declare'], function (require, exports, History, util, Config, decl) {
    var win = decl.win;
    var isSupportHistory = !!history.pushState;
    /**
     * A stack which deposited browser's histories
     */
    var HistoryStack = (function () {
        function HistoryStack() {
        }
        /**
         * generate a history object by url, title and the page's data
         * @param url
         * @param title
         * @param data
         * @returns {History}
         */
        HistoryStack.generateHistory = function (url, title, data) {
            var config = Config.getOption();
            var renderUrl = util.cus.getRenderUrl(url, config.getBaseUrl());
            var hisId = util.lang.generateRandomId('His');
            var nowHistory = new History(hisId, renderUrl, title, data);
            HistoryStack.currentHistory = nowHistory;
            HistoryStack.allHis[hisId] = nowHistory;
            return nowHistory;
        };
        /**
         * push the history info to the history's stack
         * @param url
         * @param title
         * @param data
         */
        HistoryStack.push = function (url, title, data) {
            var nowHis = HistoryStack.generateHistory(url, title, data);
            if (isSupportHistory) {
                history.pushState({
                    _id: nowHis.getId()
                }, nowHis.getTitle(), nowHis.getUrl());
            }
            else {
                location.href = url;
            }
        };
        /**
         * replace current history info
         * @param url
         * @param title
         * @param data
         */
        HistoryStack.replace = function (url, title, data) {
            if (HistoryStack.currentHistory) {
                delete HistoryStack.allHis[HistoryStack.currentHistory.getId()];
            }
            var nowHis = HistoryStack.generateHistory(url, title, data);
            if (isSupportHistory) {
                history.replaceState({
                    _id: nowHis.getId()
                }, nowHis.getTitle(), nowHis.getUrl());
            }
        };
        /**
         * get history info by history's id
         * @param _id
         * @returns {*}
         */
        HistoryStack.getHistory = function (_id) {
            if (HistoryStack.allHis[_id]) {
                return HistoryStack.allHis[_id];
            }
            return null;
        };
        /**
         * get current history info
         * @returns {History}
         */
        HistoryStack.getCurrentHistory = function () {
            return HistoryStack.currentHistory;
        };
        HistoryStack.setCurrentHistory = function (his) {
            HistoryStack.currentHistory = his;
        };
        HistoryStack.allHis = {};
        HistoryStack.currentHistory = null;
        return HistoryStack;
    })();
    return HistoryStack;
});

/**
 * Created by lujintan on 12/1/14.
 */
define('common/lib/wowspg/DSGetter',["require", "exports", './utils', './declare'], function (require, exports, util, decl) {
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

/**
 * Created by lujintan on 11/26/14.
 */
define('common/lib/wowspg/Block',["require", "exports", './utils', './HistoryStack', './DSGetter', './Error', './declare'], function (require, exports, util, HistoryStack, DSGetter, err, decl) {
    var win = decl.win;
    var ErrorType = err.ErrorType;
    var ErrorController = err.ErrorController;
    var RendertStatus;
    (function (RendertStatus) {
        RendertStatus[RendertStatus["START"] = 0] = "START";
        RendertStatus[RendertStatus["RENDER_READY"] = 50] = "RENDER_READY";
        RendertStatus[RendertStatus["READY_HANDLER_READY"] = 80] = "READY_HANDLER_READY";
        RendertStatus[RendertStatus["USABLE_HANDLER_READY"] = 100] = "USABLE_HANDLER_READY";
    })(RendertStatus || (RendertStatus = {}));
    /**
     * Block is pagelet of a page
     * A block can belongs to another as a child block
     * It also can depends on other blocks
     * A page is form out of a series of blocks with tree structure
     */
    var Block = (function () {
        function Block(name, selector, sync, tpl, ds, dt, css, startHandlers, readyHandlers, usableHandlers, childrenBlocks, depsBlocks) {
            if (selector === void 0) { selector = null; }
            if (sync === void 0) { sync = 'no'; }
            if (tpl === void 0) { tpl = null; }
            if (ds === void 0) { ds = null; }
            if (dt === void 0) { dt = ''; }
            if (css === void 0) { css = []; }
            if (startHandlers === void 0) { startHandlers = []; }
            if (readyHandlers === void 0) { readyHandlers = []; }
            if (usableHandlers === void 0) { usableHandlers = []; }
            if (childrenBlocks === void 0) { childrenBlocks = []; }
            if (depsBlocks === void 0) { depsBlocks = []; }
            this.name = name;
            this.selector = selector;
            this.tpl = tpl;
            this.ds = ds;
            this.dt = dt;
            this.css = css;
            this.startHandlers = startHandlers;
            this.readyHandlers = readyHandlers;
            this.usableHandlers = usableHandlers;
            this.childrenBlocks = childrenBlocks;
            this.depsBlocks = depsBlocks;
            this.sync = sync;
            this.nextBlocks = [];
            this.wrapper = document.body;
            this.rendered = false;
            this.requireIng = false;
            this.dsReady = false;
            this.renderData = {};
        }
        /**
         * trigger handlers' init function
         * @param handlers
         */
        Block.prototype.initBlockHandlers = function (handlers) {
            var _this = this;
            util.lang.arrayForEach(handlers, function (handler) {
                var blockWrap = win.wow.selector('.wow-wrap-container', _this.container);
                handler.init && handler.init(blockWrap && blockWrap[0] ? blockWrap[0] : _this.container, _this.renderData);
            });
        };
        /**
         * start to render template and trigger the start handler's init functino
         * @param modules
         * @param routerParams
         * @returns {Promise}
         */
        Block.prototype.renderStart = function (modules, routerParams, isHistoryData) {
            if (routerParams === void 0) { routerParams = {}; }
            var defered = win.wow.promise.defer();
            var _this = this;
            var historyNow = HistoryStack.getCurrentHistory();
            var url = historyNow.getUrl();
            //when data source, data transfer and start handlers are all loaded
            if (!_this.dsReady || (!modules.length && _this.sync !== 'sync')) {
                defered.reject(ErrorController.getError(506 /* RUNTIME_ERROR_RESOURCE_UNREADY */));
                return defered.promise;
            }
            //start handlers
            var hses = [];
            //modules index
            var modIndex = 0;
            //template render
            var tplRender = _this.sync === 'sync' ? function () {
                return _this.container.innerHTML;
            } : modules[modIndex++];
            //data transfer
            var dt;
            if (_this.dt) {
                dt = modules[modIndex++];
            }
            if (_this.startHandlers.length) {
                for (var len = modules.length; modIndex < len; modIndex++) {
                    hses.push(modules[modIndex]);
                }
            }
            //the data for rendering template
            _this.renderData = {
                data: _this.ds,
                g: win.wow.data,
                urlkeys: routerParams,
                params: util.cus.getUrlParams(url),
                location: location,
                title: document.title
            };
            var isRenderNow = true;
            if (dt && !isHistoryData) {
                if (typeof dt === 'function') {
                    var dtRes = dt(_this.ds, _this.renderData);
                    if (dtRes.then) {
                        isRenderNow = false;
                        dtRes.then(function (data) {
                            _this.ds = data;
                            _this.renderData.data = _this.ds;
                            var htmlStr = tplRender(_this.renderData);
                            if (_this.sync !== 'sync') {
                                //fill template in the block's container
                                _this.container.innerHTML = htmlStr;
                            }
                            //trigger the handler's init function
                            _this.initBlockHandlers(hses);
                            defered.resolve();
                        }, function () {
                            defered.reject();
                        });
                    }
                    else {
                        //Transferring data
                        _this.ds = dtRes;
                        _this.renderData.data = _this.ds;
                    }
                }
            }
            if (isRenderNow) {
                var htmlStr = tplRender(_this.renderData);
                if (_this.sync !== 'sync') {
                    //fill template in the block's container
                    _this.container.innerHTML = [
                        '<section class="wow-wrap-container">',
                        htmlStr,
                        '</section>'
                    ].join('');
                }
                //trigger the handler's init function
                _this.initBlockHandlers(hses);
                defered.resolve();
            }
            return defered.promise;
        };
        Block.prototype.requireResource = function (requireList, routerParams, defered) {
            var _this = this;
            if (_this.requireIng) {
                return;
            }
            _this.requireIng = true;
            var blockInfo = {
                name: _this.name,
                selector: _this.selector,
                container: _this.container
            };
            //require start resources
            util.lang._require(requireList).then(function (mods) {
                _this.requireIng = false;
                //init start handlers
                return _this.renderStart(mods, routerParams).then(function () {
                    _this.rendered = true;
                    defered.resolve();
                });
            }).then(function (mods) {
                //trigger event for block render ready
                win.wow.eventTrigger(win, 'wow.block.render', {
                    block: blockInfo,
                    progress: 50 /* RENDER_READY */
                });
                //require ready resources
                return util.lang._require(_this.readyHandlers);
            }).then(function (mods) {
                //init ready handlers
                _this.initBlockHandlers(mods);
                //trigger event for block ready handler executed
                win.wow.eventTrigger(win, 'wow.block.render', {
                    block: blockInfo,
                    progress: 80 /* READY_HANDLER_READY */
                });
                defered.resolve();
            }).then(function (mods) {
                //require usable resources
                return util.lang._require(_this.usableHandlers);
            }).then(function (mods) {
                //init usable handlers
                _this.initBlockHandlers(mods);
                //trigger event for block usable handler executed
                win.wow.eventTrigger(win, 'wow.block.render', {
                    block: blockInfo,
                    progress: 100 /* USABLE_HANDLER_READY */
                });
                defered.resolve();
            }, function (err) {
                if (err.code !== 506 /* RUNTIME_ERROR_RESOURCE_UNREADY */) {
                    defered.reject(err);
                }
            });
        };
        /**
         * Render block
         * @param wrapper   the block's wrapper HTMLElement
         * @param routerParams  the parameters which are matched from RouterMatcher
         * @returns {Promise}
         */
        Block.prototype.render = function (wrapper, routerParams) {
            var defered = win.wow.promise.defer();
            var _this = this;
            var _blockName = _this.name;
            var historyNow = HistoryStack.getCurrentHistory();
            var historyData = historyNow.getData();
            _this.wrapper = wrapper;
            //if selector is undefined then stop rendering block
            if (!_this.selector) {
                defered.reject(ErrorController.getError(310 /* BLOCK_SELECTOR_IS_EMPTY */));
            }
            else {
                var containers = win.wow.selector(_this.selector, _this.wrapper);
                //if container element exist
                if (containers && containers[0]) {
                    _this.container = containers[0];
                    var flagBreak = false;
                    //if block is depends on other blocks then judging whether blocks are all rendered or not
                    if (_this.depsBlocks.length) {
                        util.lang.arrayForEach(_this.depsBlocks, function (depsBlock, index) {
                            if (!depsBlock.isRendered()) {
                                defered.reject(ErrorController.getError(311 /* BLOCK_DEPENDS_BLOCK_NOT_READY */));
                                flagBreak = true;
                                return false;
                            }
                        });
                    }
                    if (!flagBreak && (_this.tpl || _this.tpl === '')) {
                        var modules = [];
                        var requireList = _this.sync === 'sync' ? [] : [_this.tpl];
                        //add resource string to require list
                        if (_this.dt) {
                            requireList.push(_this.dt);
                        }
                        requireList = requireList.concat(_this.startHandlers);
                        if (_this.css) {
                            util.lang.arrayForEach(_this.css, function (cssSource, index) {
                                requireList.push('css!' + cssSource);
                            });
                        }
                        win.wow.eventTrigger(win, 'wow.block.render', {
                            block: {
                                name: _this.name,
                                selector: _this.selector,
                                container: _this.container
                            },
                            progress: 0 /* START */
                        });
                        //if the block's data has already exist in history then getting it from history
                        if (historyData && historyData[_blockName]) {
                            _this.ds = historyData[_blockName];
                            _this.dsReady = true;
                            _this.requireResource(requireList, routerParams, defered);
                        }
                        else {
                            if (typeof _this.ds === 'string') {
                                _this.ds = _this.ds.replace(/\{([^\{\}]+)\}/g, function (str, key) {
                                    if (routerParams && routerParams[key]) {
                                        return routerParams[key];
                                    }
                                    var url = historyNow.getUrl();
                                    var urlParams = util.cus.getUrlParams(url);
                                    if (url && urlParams && urlParams[key]) {
                                        return urlParams[key];
                                    }
                                    if (win.wow.data && win.wow.data[key]) {
                                        return win.wow.data[key];
                                    }
                                    return '';
                                });
                                //load data from server
                                DSGetter.get(_this.ds).then(function (data) {
                                    _this.ds = data;
                                    _this.dsReady = true;
                                    _this.requireResource(requireList, routerParams, defered);
                                }, function () {
                                    defered.reject(ErrorController.getError(610 /* RESOURCE_DATASOURCE_LOAD_FAIL */));
                                });
                            }
                            else {
                                _this.dsReady = true;
                            }
                        }
                        _this.requireResource(requireList, routerParams, defered);
                    }
                    else {
                        defered.resolve();
                        _this.rendered = true;
                    }
                }
                else {
                    defered.reject(ErrorController.getError(311 /* BLOCK_CONTAINER_NOT_EXIST */));
                }
            }
            return defered.promise;
        };
        /**
         * Judging this block is equal to the other one
         * @param block  the target block
         * @returns {boolean}
         */
        Block.prototype.equal = function (block) {
            var _thisDs = this.ds, _blockDs = block.ds, _isEqual = false;
            if (this.tpl === block.tpl) {
                if (typeof _blockDs === 'string' && _blockDs === _thisDs) {
                    _isEqual = true;
                }
                else if (!_blockDs && !_thisDs) {
                    _isEqual = true;
                }
                else if (_blockDs && typeof _blockDs === 'object' && _thisDs && typeof _thisDs === 'object') {
                    _isEqual = true;
                    util.lang.objForIn(_blockDs, function (blockInfo, blockKey) {
                        if (blockInfo != _thisDs[name]) {
                            _isEqual = false;
                            return false;
                        }
                    });
                    util.lang.objForIn(_thisDs, function (blockInfo, blockKey) {
                        if (blockInfo != _blockDs[name]) {
                            _isEqual = false;
                            return false;
                        }
                    });
                }
            }
            return _isEqual;
        };
        Block.prototype.destroy = function () {
            var defered = win.wow.promise.defer();
            this.rendered = false;
            this.dsReady = false;
            return defered.promise;
        };
        Block.prototype.setDepsBlocks = function (depsBlocks) {
            this.depsBlocks = depsBlocks;
        };
        Block.prototype.setNextBlocks = function (nextBlocks) {
            this.nextBlocks = nextBlocks;
        };
        Block.prototype.setChildrenBlocks = function (childrenBlocks) {
            this.childrenBlocks = childrenBlocks;
        };
        Block.prototype.setRendered = function (rendered) {
            this.rendered = rendered;
        };
        Block.prototype.mergeOtherBlock = function (block) {
            if (this.name !== block.getName()) {
                return;
            }
            this.selector = block.getSelector() || this.selector;
            this.sync = block.getSync() || 'no';
            this.tpl = block.getTpl() || this.tpl;
            this.ds = block.getDs() || this.ds;
            this.dt = block.getDt() || this.dt;
            this.css = block.getCss() || this.css;
            this.startHandlers = block.getStartHandlers() || this.startHandlers;
            this.readyHandlers = block.getReadyHandlers() || this.readyHandlers;
            this.usableHandlers = block.getUsableHandlers() || this.usableHandlers;
            this.childrenBlocks = block.getChildrenBlocks() || this.childrenBlocks;
        };
        Block.prototype.getName = function () {
            return this.name;
        };
        Block.prototype.getSelector = function () {
            return this.selector;
        };
        Block.prototype.getSync = function () {
            return this.sync;
        };
        Block.prototype.getTpl = function () {
            return this.tpl;
        };
        Block.prototype.getDs = function () {
            return this.ds;
        };
        Block.prototype.getDt = function () {
            return this.dt;
        };
        Block.prototype.getCss = function () {
            return this.css;
        };
        Block.prototype.getStartHandlers = function () {
            return this.startHandlers;
        };
        Block.prototype.getReadyHandlers = function () {
            return this.readyHandlers;
        };
        Block.prototype.getUsableHandlers = function () {
            return this.usableHandlers;
        };
        Block.prototype.getChildrenBlocks = function () {
            return this.childrenBlocks;
        };
        Block.prototype.getDepsBlocks = function () {
            return this.depsBlocks;
        };
        Block.prototype.getNextBlocks = function () {
            return this.nextBlocks;
        };
        Block.prototype.getConteiner = function () {
            return this.container;
        };
        Block.prototype.isRendered = function () {
            return this.rendered;
        };
        return Block;
    })();
    return Block;
});

define('common/lib/wowspg/Router',["require", "exports", './Block', './utils'], function (require, exports, Block, util) {
    /**
     * Router of a page
     */
    var Router = (function () {
        function Router(urlReg, title, blocks, childrenRouters) {
            if (blocks === void 0) { blocks = []; }
            if (childrenRouters === void 0) { childrenRouters = []; }
            var _this = this;
            _this.urlReg = util.cus.getRenderReg(urlReg);
            _this.title = title;
            _this.setBlocks(blocks);
            _this.setChildrenRouters(childrenRouters);
            _this.urlKeys = [];
        }
        /**
         * set children routers by router config
         * @param childrenRouters
         */
        Router.prototype.setChildrenRouters = function (childrenRouters) {
            var _this = this;
            if (childrenRouters && typeof childrenRouters.length === 'undefined') {
                _this.childrenRouters = [];
                util.lang.objForIn(childrenRouters, function (info, reg) {
                    if (typeof info === 'string') {
                        _this.childrenRouters.push(new Router(reg, null, info));
                    }
                    else {
                        _this.childrenRouters.push(new Router(reg, null, info.block, info.router));
                    }
                });
            }
            else {
                _this.childrenRouters = childrenRouters;
            }
        };
        /**
         * set blocks by router config
         * @param blocks
         */
        Router.prototype.setBlocks = function (blocks) {
            var _this = this;
            if (blocks && typeof blocks.length === 'undefined') {
                _this.blocks = [];
                util.lang.objForIn(blocks, function (info, name) {
                    var cusHandler = info.handler || {}, childrenBlocks = [], depsBlocks = [];
                    if (info.block) {
                        util.lang.objForIn(info.block, function (childInfo, childName) {
                            var childHandler = childInfo.handler || {};
                            childrenBlocks.push(new Block(childName, childInfo.selector, childInfo.sync, childInfo.tpl, childInfo.ds, childInfo.dt, childInfo.css, childHandler.start, childHandler.ready, childHandler.usable));
                        });
                    }
                    if (info.deps) {
                        util.lang.arrayForEach(info.deps, function (depsName) {
                            depsBlocks.push(new Block(depsName));
                        });
                    }
                    _this.blocks.push(new Block(name, info.selector, info.sync, info.tpl, info.ds, info.dt, info.css, cusHandler.start, cusHandler.ready, cusHandler.usable, childrenBlocks, depsBlocks));
                });
                util.lang.arrayForEach(_this.blocks, function (block) {
                    var deps = block.getDepsBlocks();
                    var realDepsBlock = [];
                    util.lang.arrayForEach(deps, function (depsBlock) {
                        var depsBlockName = depsBlock.getName();
                        util.lang.arrayForEach(_this.blocks, function (inBlock) {
                            if (inBlock.getName() === depsBlockName) {
                                realDepsBlock.push(inBlock);
                                var nextBlocks = inBlock.getNextBlocks();
                                nextBlocks.push(block);
                                inBlock.setNextBlocks(nextBlocks);
                                return false;
                            }
                        });
                    });
                    block.setDepsBlocks(realDepsBlock);
                });
            }
            else {
                _this.blocks = blocks || [];
            }
        };
        Router.prototype.getTitle = function () {
            return this.title;
        };
        Router.prototype.getUrlReg = function () {
            return this.urlReg;
        };
        Router.prototype.getBlocks = function () {
            return this.blocks;
        };
        Router.prototype.getChildrenNods = function () {
            return this.childrenRouters;
        };
        Router.prototype.getUrlKeys = function () {
            return this.urlKeys;
        };
        /**
         * whether it is equal to anther router object or not
         * @param router
         * @returns {boolean}
         */
        Router.prototype.equal = function (router) {
            if (router.getUrlReg() === this.urlReg && router.getBlocks() === this.blocks) {
                return true;
            }
            return false;
        };
        return Router;
    })();
    return Router;
});

define('common/lib/wowspg/Tree',["require", "exports", './utils', './declare'], function (require, exports, util, decl) {
    var win = decl.win;
    /**
     * A tree structure
     */
    var Tree = (function () {
        function Tree(rootNode) {
            this.rootNode = rootNode;
        }
        Tree.prototype.dfTraversalNode = function (node, callback) {
            var deferred = win.wow.promise.defer(), execResult = callback(node), _this = this;
            if (execResult === false) {
                //stop traversal
                deferred.resolve();
            }
            else if (execResult === true) {
                //continue
                deferred.resolve();
            }
            else {
                var fnThen = execResult;
                if (!fnThen.then) {
                    fnThen = util.lang.fnThenEmpty();
                }
                fnThen.then(function () {
                    var childrenNodes = node.getChildrenNods();
                    var nodeLen = childrenNodes.length;
                    if (!childrenNodes || !nodeLen) {
                        //do not have any children
                        deferred.resolve();
                    }
                    else {
                        var compLen = 1;
                        util.lang.arrayForEach(childrenNodes, function (childNode, index) {
                            _this.dfTraversalNode(childNode, callback).then(function () {
                                if (++compLen > nodeLen) {
                                    //children nodes are all done
                                    deferred.resolve();
                                }
                            });
                        });
                    }
                });
            }
            return deferred.promise;
        };
        Tree.prototype.traversal = function (callback) {
            return this.dfTraversalNode(this.rootNode, callback);
        };
        return Tree;
    })();
    return Tree;
});

define('common/lib/wowspg/RouterMatcher',["require", "exports", './Router', './Error', './utils', './Tree', './declare'], function (require, exports, Router, err, util, Tree, decl) {
    var win = decl.win;
    var ErrorType = err.ErrorType;
    var ErrorController = err.ErrorController;
    /**
     * Matching a router path from the router tree
     */
    var RouterMatcher = (function () {
        function RouterMatcher(routerConf) {
            this.routerConf = routerConf;
            this.routerConf = this.fixRouterConf();
            this.routerParams = {};
            this.currentRouterPath = [];
            this.currentRenderUrl = '';
        }
        /**
         * Judging the configuration of router is correct
         * @returns {any}
         */
        RouterMatcher.prototype.fixRouterConf = function () {
            var conf = this.routerConf, len = 0;
            util.lang.objForIn(conf, function (rItem, rKey) {
                if (rItem && (rItem.block || rItem.router)) {
                    len++;
                }
            });
            if (len) {
                return conf;
            }
            else {
                //config error
                err.ErrorController.trigger(101 /* CONFIG_ERROR */);
            }
        };
        /**
         * Matching the url and return the router path
         * @param url
         * @returns {Promise}
         */
        RouterMatcher.prototype.routerMatch = function (url) {
            var deferred = win.wow.promise.defer();
            var _this = this;
            _this.currentRouterPath = [];
            var rootRouterDoneCount = 1;
            var rootCount = 0;
            var isRejected = false;
            util.lang.objForIn(_this.routerConf, function (rConf, reg) {
                var rootRouter = new Router(reg, rConf.title, rConf.block, rConf.router);
                var routerTree = new Tree(rootRouter);
                var nextMatchRouter;
                rootCount++;
                if (_this.currentRenderUrl === url) {
                    //traversal the router tree to find out the router matched
                    routerTree.traversal(function (router) {
                        var defLoadRouter = win.wow.promise.defer();
                        var routerReg = router.getUrlReg();
                        var regResult = routerReg.exec(url);
                        if (_this.currentRenderUrl !== url) {
                            if (!isRejected) {
                                deferred.reject(ErrorController.getError(102 /* ROUTER_MATCHING_STOPPED */));
                                isRejected = true;
                            }
                            return true;
                        }
                        if (regResult && typeof regResult[0] !== 'undefined') {
                            if (nextMatchRouter) {
                                if (!nextMatchRouter.equal(router)) {
                                    return true;
                                }
                                else {
                                    nextMatchRouter = null;
                                }
                            }
                            else {
                                var childRouters = router.getChildrenNods();
                                util.lang.arrayForEach(childRouters, function (router) {
                                    var routerUrlReg = router.getUrlReg(), regChildResult = routerUrlReg.exec(url);
                                    if (regChildResult && typeof regChildResult[0] !== 'undefined') {
                                        nextMatchRouter = router;
                                    }
                                });
                                if (!nextMatchRouter && childRouters.length) {
                                    return true;
                                }
                            }
                            //this router node is what i want
                            _this.currentRouterPath.push(router);
                            var urlkeys = router.getUrlKeys();
                            util.lang.arrayForEach(urlkeys, function (urlKey, index) {
                                _this.routerParams[urlKey] = regResult[index + 1];
                            });
                            if (typeof router.blocks === 'string') {
                                util.lang._require([router.blocks]).then(function (mods) {
                                    var childRouterConf = mods[0];
                                    router.setBlocks(childRouterConf.block);
                                    router.setChildrenRouters(childRouterConf.router);
                                    defLoadRouter.resolve();
                                });
                            }
                            else {
                                defLoadRouter.resolve();
                            }
                        }
                        else {
                            //stop matching this leaf and going on
                            return true;
                        }
                        return defLoadRouter.promise;
                    }).then(function () {
                        if (++rootRouterDoneCount > rootCount) {
                            deferred.resolve();
                        }
                    });
                }
            });
            return deferred.promise;
        };
        /**
         * find the child block which is same with the name appointed
         * @param blockName
         * @param startDepth
         * @returns {{depth: number, block: Block}}
         */
        RouterMatcher.prototype.findBlockByName = function (blockName, startDepth) {
            if (startDepth === void 0) { startDepth = 1; }
            var pathDepth = 0;
            var targetBlock = null;
            var currentRouterPath = this.currentRouterPath;
            for (var i = startDepth, len = currentRouterPath.length; i < len; i++) {
                var router = currentRouterPath[i];
                var blocks = router.getBlocks();
                util.lang.arrayForEach(blocks, function (block, depth) {
                    if (block.getName() === blockName) {
                        pathDepth = depth;
                        targetBlock = block;
                    }
                });
            }
            return {
                depth: pathDepth,
                block: targetBlock
            };
        };
        /**
         * Get the block which is need to render by router path
         * @param rootBlock
         * @param depth
         * @returns {Block}
         */
        RouterMatcher.prototype.matchBlockTree = function (rootBlock, depth) {
            if (depth === void 0) { depth = 1; }
            var _this = this;
            var coverInfo = _this.findBlockByName(rootBlock.getName(), depth);
            var block = coverInfo.block;
            var pathDepth = coverInfo.depth || depth;
            if (block) {
                rootBlock.mergeOtherBlock(block);
            }
            var childrenBlocks = rootBlock.getChildrenBlocks();
            util.lang.arrayForEach(childrenBlocks, function (childBlock) {
                _this.matchBlockTree(childBlock, pathDepth);
            });
            return rootBlock;
        };
        /**
         * Matching url
         * @param url
         * @returns {Promise}
         */
        RouterMatcher.prototype.match = function (url) {
            var _this = this;
            var deferred = win.wow.promise.defer();
            var blockTreeRoots = [];
            _this.currentRenderUrl = url;
            _this.routerMatch(url).done(function () {
                var currentRouterPath = _this.currentRouterPath;
                if (!currentRouterPath.length) {
                    //do not find out the router matched
                    deferred.reject(ErrorController.getError(404 /* PAGE_NOT_FOUND */));
                }
                else {
                    blockTreeRoots = currentRouterPath[0].getBlocks();
                    util.lang.arrayForEach(blockTreeRoots, function (block, index) {
                        blockTreeRoots[index] = _this.matchBlockTree(block);
                    });
                    deferred.resolve(blockTreeRoots);
                }
            });
            return deferred.promise;
        };
        /**
         * get params from router matching
         * @returns {Object}
         */
        RouterMatcher.prototype.getRouterParams = function () {
            return this.routerParams;
        };
        /**
         * get page's title which is in router's config
         * @returns {string}
         */
        RouterMatcher.prototype.getRouterTitle = function () {
            var _this = this;
            var title = document.title;
            util.lang.arrayForEach(_this.currentRouterPath, function (router) {
                var routerTitle = router.getTitle();
                if (routerTitle) {
                    title = routerTitle;
                }
            });
            return title;
        };
        return RouterMatcher;
    })();
    return RouterMatcher;
});

/**
 * Created by lujintan on 12/03/14.
 */
define('common/lib/wowspg/Render',["require", "exports", './utils', './Error', './declare'], function (require, exports, util, err, decl) {
    var win = decl.win;
    var ErrorType = err.ErrorType;
    var ErrorController = err.ErrorController;
    /**
     * For page render
     */
    var Render = (function () {
        function Render() {
        }
        /**
         * destroy a block and all its children blocks
         * @param rootBlock
         */
        Render.destroyBlock = function (rootBlock) {
            rootBlock.destroy();
            var childrenBlocks = rootBlock.getChildrenBlocks();
            util.lang.arrayForEach(childrenBlocks, function (childBlock) {
                Render.destroyBlock(childBlock);
            });
        };
        /**
         * render a block and all its children blocks
         * @param rootBlock
         * @param wrapper
         * @param routerParams
         * @returns {Promise}
         */
        Render.renderBlock = function (rootBlock, wrapper, routerParams) {
            var defered = win.wow.promise.defer();
            var renderResult;
            var lastEqualNameBlock = null;
            var rootBlockName = rootBlock.getName();
            util.lang.arrayForEach(Render.lastRenderBlocks, function (block) {
                if (rootBlockName === block.getName()) {
                    lastEqualNameBlock = block;
                    if (rootBlock.equal(block)) {
                        renderResult = util.lang.fnThenEmpty();
                        rootBlock.setRendered(true);
                        return false;
                    }
                }
            });
            if (!renderResult || !renderResult.then) {
                renderResult = rootBlock.render(wrapper, routerParams);
                if (lastEqualNameBlock && lastEqualNameBlock.isRendered()) {
                    Render.destroyBlock(lastEqualNameBlock);
                }
            }
            //render root block
            renderResult.then(function () {
                //add to current rendered block list
                Render.currentRenderBlocks.push(rootBlock);
                //render the children blocks
                var childrenBlocks = rootBlock.getChildrenBlocks();
                var childrenLen = childrenBlocks.length;
                var renderedNum = 1;
                var failChildrenName = [];
                util.lang.arrayForEach(childrenBlocks, function (childBlock) {
                    Render.renderBlock(childBlock, rootBlock.getConteiner(), routerParams).then(function () {
                        if (++renderedNum > childrenLen) {
                            if (!failChildrenName.length) {
                                defered.resolve();
                            }
                            else {
                                defered.reject(ErrorController.getError(303 /* BLOCK_ERROR */), failChildrenName);
                            }
                        }
                    }, function () {
                        failChildrenName.push(childBlock.getName());
                        if (++renderedNum > childrenLen) {
                            defered.reject(ErrorController.getError(303 /* BLOCK_ERROR */), failChildrenName);
                        }
                    });
                });
                if (!childrenBlocks.length) {
                    defered.resolve();
                }
                //render blocks which depends on this block
                var nextBlocks = rootBlock.getNextBlocks();
                util.lang.arrayForEach(nextBlocks, function (nextBlock) {
                    Render.renderBlock(nextBlock, wrapper, routerParams);
                });
            }, function (error) {
                defered.reject(error);
            });
            return defered.promise;
        };
        /**
         * To render page's all blocks
         * @param rootBlocks
         * @param routerParams
         * @returns {Promise}
         */
        Render.page = function (rootBlocks, routerParams) {
            var defered = win.wow.promise.defer();
            var renderedNum = 1;
            var rootBlockLen = rootBlocks.length;
            var failRenderedName = [];
            Render.lastRenderBlocks = Render.currentRenderBlocks;
            Render.currentRenderBlocks = [];
            //render all root blocks
            util.lang.arrayForEach(rootBlocks, function (rootBlock) {
                Render.renderBlock(rootBlock, document.body, routerParams).then(function () {
                    if (++renderedNum > rootBlockLen) {
                        if (!failRenderedName.length) {
                            defered.resolve();
                        }
                        else {
                            defered.reject(ErrorController.getError(303 /* BLOCK_ERROR */), failRenderedName);
                        }
                    }
                }, function () {
                    failRenderedName.push(rootBlock.getName());
                    if (++renderedNum > rootBlockLen) {
                        defered.reject(ErrorController.getError(303 /* BLOCK_ERROR */), failRenderedName);
                    }
                });
            });
            return defered.promise;
        };
        Render.lastRenderBlocks = [];
        Render.currentRenderBlocks = [];
        return Render;
    })();
    return Render;
});

/**
 * Created by lujintan on 11/27/14.
 */
define('common/lib/wowspg/main',["require", "exports", './declare', './UrlListener', './Error', './utils', './RouterMatcher', './Render', './HistoryStack', './Config', './DSGetter'], function (require, exports, decl, UrlListener, err, util, RouterMatcher, Render, HistoryStack, Config, DSGetter) {
    var win = decl.win;
    var ErrorType = err.ErrorType;
    var ErrorController = err.ErrorController;
    var routerMatcher;
    var wowOption;
    var wow;
    (function (wow) {
        /**
         * The entrance of the single page
         * @param routerConf
         * @param options
         */
        function init(routerConf, options) {
            //config judgment
            if (!routerConf) {
                err.ErrorController.trigger(101 /* CONFIG_ERROR */);
                return;
            }
            //set config
            Config.setOption(options);
            Config.setRouterConfig(routerConf);
            var promise = Config.getOption().getPromise();
            var selector = Config.getOption().getSelector();
            var eventTrigger = Config.getOption().getEventTrigger();
            if (promise) {
                win.wow.promise = promise;
            }
            if (selector) {
                win.wow.selector = selector;
            }
            if (eventTrigger) {
                win.wow.eventTrigger = eventTrigger;
            }
            //fix the configuration
            wowOption = Config.getOption();
            var wowRouterConfig = Config.getRouterConfig();
            routerMatcher = new RouterMatcher(wowRouterConfig);
            //match the router config then get the
            go(location.href, 'replace');
            //add link click listener
            UrlListener.linkListener(function (renderUrl) {
                go(renderUrl, 'push');
            });
            //add history listener
            UrlListener.historyListener(function (_id) {
                var curHis = HistoryStack.getHistory(_id);
                if (curHis) {
                    HistoryStack.setCurrentHistory(curHis);
                    var renderUrl = curHis.getUrl();
                    go(renderUrl, 'no');
                }
            });
        }
        wow.init = init;
        /**
         * define the wow static value
         * @param key
         * @param val
         */
        function define(key, val) {
            win.wow = win.wow || {};
            win.wow.data = win.wow.data || {};
            win.wow.data[key] = val;
        }
        wow.define = define;
        function go(url, hisCtrl) {
            var renderUrl = util.cus.getRenderUrl(url, wowOption.getBaseUrl());
            if (!renderUrl) {
                win.wow.eventTrigger(win, 'wow.page.change', {
                    error: ErrorController.getError(404 /* PAGE_NOT_FOUND */),
                    url: url
                });
                return;
            }
            DSGetter.cancelAll();
            routerMatcher.match(renderUrl).then(function (blockRoots) {
                if (hisCtrl === 'replace') {
                    HistoryStack.replace(renderUrl, routerMatcher.getRouterTitle(), {});
                }
                else if (hisCtrl !== 'no') {
                    HistoryStack.push(renderUrl, routerMatcher.getRouterTitle(), {});
                }
                Render.page(blockRoots, routerMatcher.getRouterParams()).then(function () {
                    win.wow.eventTrigger(win, 'wow.page.changed', {
                        his: HistoryStack.getCurrentHistory(),
                        url: renderUrl
                    });
                }, function (errInfo) {
                    win.wow.eventTrigger(win, 'wow.page.changed', {
                        error: errInfo,
                        url: renderUrl
                    });
                });
            }, function (errInfo) {
                win.wow.eventTrigger(win, 'wow.page.changed', {
                    error: errInfo,
                    url: renderUrl
                });
            });
            win.wow.eventTrigger(win, 'wow.page.change', {
                url: renderUrl
            });
        }
        wow.go = go;
    })(wow || (wow = {}));
    return wow;
});

