/**
 * Created by lujintan on 11/27/14.
 */

import decl = require('./declare');
import UrlListener = require('./UrlListener');
import err = require('./Error');
import util = require('./utils');
import Router = require('./Router');
import RouterMatcher = require('./RouterMatcher');
import RenderOption = require('./RenderOption');
import Block = require('./Block');
import Render = require('./Render');
import History = require('./History');
import HistoryStack = require('./HistoryStack');
import Config = require('./Config');
import DSGetter = require('./DSGetter');

var win = decl.win;
var ErrorType = err.ErrorType;
var ErrorController = err.ErrorController;
var routerMatcher: RouterMatcher;
var wowOption: RenderOption;

module wow {
    /**
     * The entrance of the single page
     * @param routerConf
     * @param options
     */
    export function init(routerConf: any, options: any): void {
        //config judgment
        if (!routerConf){
            err.ErrorController.trigger(err.ErrorType.CONFIG_ERROR);
            return;
        }

        //set config
        Config.setOption(options);
        Config.setRouterConfig(routerConf);

        var promise: any = Config.getOption().getPromise();
        var selector: any = Config.getOption().getSelector();
        var eventTrigger: any = Config.getOption().getEventTrigger();
        if (promise){
            win.wow.promise = promise;
        }
        if (selector){
            win.wow.selector = selector;
        }
        if (eventTrigger){
            win.wow.eventTrigger = eventTrigger;
        }

        //fix the configuration
        wowOption = Config.getOption();
        var wowRouterConfig: any = Config.getRouterConfig();

        routerMatcher = new RouterMatcher(wowRouterConfig);

        //match the router config then get the
        go(location.href, 'replace');

        //add link click listener
        UrlListener.linkListener(function(renderUrl: string){
            go(renderUrl, 'push');
        });

        //add history listener
        UrlListener.historyListener(function(_id: string){
            var curHis: History = HistoryStack.getHistory(_id);
            if (curHis){
                HistoryStack.setCurrentHistory(curHis);
                var renderUrl: string = curHis.getUrl();
                go(renderUrl, 'no');
            }
        });
    }

    /**
     * define the wow static value
     * @param key
     * @param val
     */
    export function define(key: string, val: string): void{
        win.wow = win.wow || {};
        win.wow.data = win.wow.data || {};
        win.wow.data[key] = val;
    }

    export function go(url, hisCtrl?: string): void{
        var renderUrl = util.cus.getRenderUrl(url, wowOption.getBaseUrl());

        if (!renderUrl){
            win.wow.eventTrigger(win, 'wow.page.change', {
                error: ErrorController.getError(ErrorType.PAGE_NOT_FOUND),
                url: url
            });
            return;
        }
        win.wow.eventTrigger(win, 'wow.page.change', {
            url: renderUrl
        });
        DSGetter.cancelAll();
        routerMatcher.match(renderUrl).then(function(blockRoots: Block[]){
            if (hisCtrl === 'replace'){
                HistoryStack.replace(renderUrl, routerMatcher.getRouterTitle(), {});
            } else if (hisCtrl !== 'no'){
                HistoryStack.push(renderUrl, routerMatcher.getRouterTitle(), {});
            }
            Render.page(blockRoots, routerMatcher.getRouterParams()).then(function(){
                win.wow.eventTrigger(win, 'wow.page.changed', {
                    his: HistoryStack.getCurrentHistory(),
                    url: renderUrl
                });
            }, function(errInfo){
                win.wow.eventTrigger(win, 'wow.page.changed', {
                    error: errInfo,
                    url: renderUrl
                });
            });
        }, function(errInfo){
            win.wow.eventTrigger(win, 'wow.page.changed', {
                error: errInfo,
                url: renderUrl
            });
        });
    }
}

export = wow;