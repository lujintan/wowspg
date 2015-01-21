/**
 * Created by lujintan on 12/4/14.
 */
define(["require", "exports", './RenderOption'], function (require, exports, RenderOption) {
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
