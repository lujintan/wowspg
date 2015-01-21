/**
 * Created by lujintan on 12/1/14.
 */
define(["require", "exports"], function (require, exports) {
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
