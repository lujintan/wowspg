/**
 * Created by lujintan on 12/4/14.
 */

import RenderOption = require('./RenderOption');

/**
 * Setting and Getting wowspg's configuration
 */
class Config{
    private static option: RenderOption;        //render options
    private static routerConfig: Object;        //router configuration

    /**
     * set router configuration
     * @param routerConfig
     */
    public static setRouterConfig(routerConfig: Object): void{
        Config.routerConfig = routerConfig;
    }

    /**
     * set options
     * @param opt
     */
    public static setOption(opt: any): void{
        Config.option = new RenderOption(
            opt.baseUrl,
            opt.timeout,
            opt.supportHistory,
            opt.type,
            opt.loader,
            opt.url,
            opt.promise,
            opt.selector,
            opt.eventTrigger);
    }

    /**
     * get wowspg's option
     * @returns {RenderOption}
     */
    public static getOption(): RenderOption{
        return Config.option;
    }

    /**
     * get router configuration
     * @returns {Object}
     */
    public static getRouterConfig(): Object{
        return Config.routerConfig;
    }
}

export = Config;