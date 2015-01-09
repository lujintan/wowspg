/**
 * Created by lujintan on 12/1/14.
 */

/**
 * declare the base namespace
 */
module decl{
    export var win: any = window;   //window
    export var $: any = win.jQuery;
    win.wow = {};
    export var promise: any = (function(){
        if (win.when){
            win.wow.promise = win.when;
            return win.wow.promise;
        } else if ($ && $.Deferred){
            var _defer: any = function(){
                var df: any = $.Deferred();
                df.promise = df.promise();
                return df;
            };
            win.wow.promise = {
                defer: _defer
            };
            return win.wow.promise;
        }
    })();
    export var selector: any = (function(){
        if (win.Sizzle){
            win.wow.selector = win.Sizzle;
            return win.wow.selector;
        } else if ($){
            win.wow.selector = $;
            return win.wow.promise;
        }
    })();
    export var eventTrigger: any = (function(){
        if (win.$){
            return win.wow.eventTrigger = function(elem, eventName, data){
                $(elem).trigger(eventName, data);
            };
        }
    })();
}

export = decl;
