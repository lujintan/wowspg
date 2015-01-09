/**
 * Created by lujintan on 11/27/14.
 */

/**
 * Describe the render options
 */
class RenderOption{
    //the base url of the site, wow will only render the url in the latter part
    private baseUrl: string;
    //page load timeout
    private timeout: number;
    //initial url
    private url: string;
    //whether support history or not
    private supportHistory: boolean;
    //render type, one of 'hash', 'url' or 'all'
    private type: string;
    //disabled class selector
    private unGoClass: string;
    //A loader of loading block
    private loader: Function;
    //promise object
    private promise: any;
    //selector object
    private selector: any;
    //event trigger
    private eventTrigger: any;

    constructor(
        baseUrl: string = location.protocol + '//' + location.host,
        timeout: number = 30,
        supportHistory: boolean = true,
        type: string = 'all',
        unGoClass: string = 'un-go',
        loader: Function = function(){},
        url?: string,
        promise?: any,
        selector?: any,
        eventTrigger?: any){

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

    public getBaseUrl(): string{
        return this.baseUrl;
    }
    public getTimeout(): number{
        return this.timeout;
    }
    public geUrl(): string{
        return this.url;
    }
    public getType(): string{
        return this.type;
    }
    public getSupportHistory(): boolean{
        return this.supportHistory;
    }
    public getLoader(): Function{
        return this.loader;
    }
    public getPromise(): any{
        return this.promise;
    }
    public getSelector(): any{
        return this.selector;
    }
    public getEventTrigger(): any{
        return this.eventTrigger;
    }
    public getUnGoClass(): string{
        return this.unGoClass;
    }
}

export = RenderOption;