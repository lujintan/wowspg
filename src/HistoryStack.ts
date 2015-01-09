/**
 * Created by lujintan on 11/26/14.
 */

import History = require('./History');
import util = require('./utils');
import RenderOption = require('./RenderOption');
import Config = require('./Config');
import decl = require('./declare');

var win: any = decl.win;
var isSupportHistory: boolean = !!history.pushState;

/**
 * A stack which deposited browser's histories
 */
class HistoryStack {
    private static allHis: any = {};
    private static currentHistory: History = null;

    /**
     * generate a history object by url, title and the page's data
     * @param url
     * @param title
     * @param data
     * @returns {History}
     */
    private static generateHistory(url: string, title: string, data: Object): History {
        var config: RenderOption = Config.getOption();
        var renderUrl: string = util.cus.getRenderUrl(url, config.getBaseUrl());
        var hisId: string = util.lang.generateRandomId('His');
        var nowHistory: History = new History(hisId, renderUrl, title, data);
        HistoryStack.currentHistory = nowHistory;
        HistoryStack.allHis[hisId] = nowHistory;

        return nowHistory;
    }

    /**
     * push the history info to the history's stack
     * @param url
     * @param title
     * @param data
     */
    public static push(url: string, title: string, data: Object): void {
        var nowHis: History = HistoryStack.generateHistory(url, title, data);

        if (isSupportHistory) {
            history.pushState({
                _id: nowHis.getId()
            }, nowHis.getTitle(), nowHis.getUrl());
        } else {
            location.href = url;
        }
    }

    /**
     * replace current history info
     * @param url
     * @param title
     * @param data
     */
    public static replace(url: string, title: string, data: Object): void {
        if (HistoryStack.currentHistory){
            delete HistoryStack.allHis[HistoryStack.currentHistory.getId()];
        }

        var nowHis: History = HistoryStack.generateHistory(url, title, data);

        if (isSupportHistory) {
            history.replaceState({
                _id: nowHis.getId()
            }, nowHis.getTitle(), nowHis.getUrl());
        }
    }

    /**
     * get history info by history's id
     * @param _id
     * @returns {*}
     */
    public static getHistory(_id: string): History {
        if (HistoryStack.allHis[_id]){
            return HistoryStack.allHis[_id];
        }
        return null;
    }

    /**
     * get current history info
     * @returns {History}
     */
    public static getCurrentHistory(): History{
        return HistoryStack.currentHistory;
    }

    public static setCurrentHistory(his: History): void{
        HistoryStack.currentHistory = his;
    }
}

export = HistoryStack;