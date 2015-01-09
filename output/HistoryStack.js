/**
 * Created by lujintan on 11/26/14.
 */
define(["require", "exports", './History', './utils', './Config', './declare'], function (require, exports, History, util, Config, decl) {
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
