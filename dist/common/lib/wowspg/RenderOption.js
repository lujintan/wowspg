/**
 * Created by lujintan on 11/27/14.
 */
define(["require", "exports"], function (require, exports) {
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
