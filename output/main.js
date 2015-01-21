/**
 * Created by lujintan on 11/27/14.
 */
define(["require", "exports", './declare', './UrlListener', './Error', './utils', './RouterMatcher', './Render', './HistoryStack', './Config', './DSGetter'], function (require, exports, decl, UrlListener, err, util, RouterMatcher, Render, HistoryStack, Config, DSGetter) {
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
