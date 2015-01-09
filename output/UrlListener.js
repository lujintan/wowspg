define(["require", "exports", './utils', './Config'], function (require, exports, util, Config) {
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
