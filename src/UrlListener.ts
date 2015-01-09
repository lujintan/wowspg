import util = require('./utils');
import Config = require('./Config');
import RenderOption = require('./RenderOption');

/**
 * bind popstate event when browser support history api
 * @param callback
 */
function popStateHistoryListener(callback: Function): void{
    util.lang.addEventListener(window, 'popstate', function(e){
        var state: any = history.state;
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
function hashHistoryListener(callback: Function): void{
    util.lang.addEventListener(window, 'hashchange', function(e){
        callback();
    });
}

/**
 * To listen the url changing
 */
class UrlListener{
    /**
     * history listener
     * @type {function(Function): void|function(Function): void}
     */
    public static historyListener: Function = (function(){
        if (util.flag.supportHistory){
            return popStateHistoryListener;
        }
        else{
            return hashHistoryListener;
        }
    })();

    /**
     * bind event when link click
     * @param callback
     */
    public static linkListener(callback: Function): void {
        var elemBody: Element = document.body;
        var wowOption: RenderOption = Config.getOption();
        util.lang.addEventListener(elemBody, 'click', function(even){
            var elemTarget: HTMLElement = even.target || even.srcElement;

            if (elemTarget &&
                elemTarget.nodeType === 1 &&
                elemTarget.nodeName.toLocaleLowerCase() === 'a'){
                var attrTarget:string = elemTarget.getAttribute('target');
                var elemClassName: string = elemTarget.className || '';
                if (elemClassName) {
                    var classes: string[] = elemClassName.split(' ');
                    var isUngo: boolean = false;
                    var unGoClass: string = wowOption.getUnGoClass();
                    util.lang.arrayForEach(classes, function(cla: string){
                        if (cla === unGoClass) {
                            isUngo = true;
                            return false;
                        }
                    });
                    if (isUngo) {
                        return;
                    }
                }

                if (attrTarget === '_blank'){
                    return;
                }
                var href:string = elemTarget.getAttribute('href');
                if (typeof href === 'undefined'){
                    return;
                }

                var renderUrl: string = util.cus.getRenderUrl(href, wowOption.getBaseUrl());

                if (typeof renderUrl !== 'undefined'){
                    util.lang.eventPreventDefault(even);

                    callback(renderUrl);
                }
            }
        });
    }
}

export = UrlListener;