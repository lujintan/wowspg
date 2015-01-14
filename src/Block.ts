/**
 * Created by lujintan on 11/26/14.
 */

import Handler = require('./Handler');
import util = require('./utils');
import History = require('./History');
import HistoryStack = require('./HistoryStack');
import DSGetter = require('./DSGetter');
import err = require('./Error');
import decl = require('./declare');

var win: any = decl.win;
var ErrorType = err.ErrorType;
var ErrorController = err.ErrorController;

/**
 * Block is pagelet of a page
 * A block can belongs to another as a child block
 * It also can depends on other blocks
 * A page is form out of a series of blocks with tree structure
 */
class Block{
    //Block's name
    private name: string;
    //Block's selector
    private selector: string;
    //Block's template
    private tpl: string;
    //Block's data source
    private ds: any;
    //Block's data transfer
    private dt: string;
    //Block's stylesheet
    private css: string[];
    //data for template render
    private renderData: any;

    //Block's page handlers
    private startHandlers: string[];
    private readyHandlers: string[];
    private usableHandlers: string[];

    //Block's wrapper element
    private wrapper: HTMLElement;
    //Block's html container
    private container: HTMLElement;

    //children blocks of current block
    private childrenBlocks: Block[];
    //the blocks which current block depends on
    private depsBlocks: Block[];
    //the blocks which depends on this block
    private nextBlocks: Block[];
    private sync: string;

    //flags
    //wheather this block is loaded
    private rendered: boolean;
    private requireIng: boolean;
    private dsReady: boolean;

    constructor(name: string,
        selector: string = null,
        sync: string = 'no',
        tpl: string = null,
        ds: any = null,
        dt: string = '',
        css: string[] = [],
        startHandlers:string[] = [],
        readyHandlers:string[] = [],
        usableHandlers:string[] = [],
        childrenBlocks: Block[] = [],
        depsBlocks: Block[] = []
    ){
        this.name = name;
        this.selector = selector;
        this.tpl = tpl;
        this.ds = ds;
        this.dt = dt;
        this.css = css;
        this.startHandlers = startHandlers;
        this.readyHandlers = readyHandlers;
        this.usableHandlers = usableHandlers;
        this.childrenBlocks = childrenBlocks;
        this.depsBlocks = depsBlocks;
        this.sync = sync;

        this.nextBlocks = [];
        this.wrapper = document.body;
        this.rendered = false;
        this.requireIng = false;
        this.dsReady = false;
        this.renderData = {};
    }

    /**
     * trigger handlers' init function
     * @param handlers
     */
    private initBlockHandlers(handlers: any): any{
        var _this: Block = this;
        util.lang.arrayForEach(handlers, function(handler){
            var blockWrap = win.wow.selector('.wow-wrap-container', _this.container);
            handler.init && handler.init(blockWrap && blockWrap[0] ? blockWrap[0] : _this.container, _this.renderData);
        });
    }

    /**
     * start to render template and trigger the start handler's init functino
     * @param modules
     * @param routerParams
     * @returns {Promise}
     */
    private renderStart(modules: any, routerParams: any = {}, isHistoryData?: boolean) {
        var defered = win.wow.promise.defer();
        var _this: Block = this;
        var historyNow: History = HistoryStack.getCurrentHistory();
        var url: string = historyNow.getUrl();

        //when data source, data transfer and start handlers are all loaded
        if (!_this.dsReady || (!modules.length && _this.sync !== 'sync')){
            defered.reject(ErrorController.getError(ErrorType.RUNTIME_ERROR_RESOURCE_UNREADY));
            return defered.promise;
        }
        //start handlers
        var hses: any[] = [];
        //modules index
        var modIndex: number = 0;
        //template render
        var tplRender: Function = _this.sync === 'sync' ? function(){
                return _this.container.innerHTML;
            } : modules[modIndex++];
        //data transfer
        var dt: any;

        if (_this.dt) {
            dt = modules[modIndex++];
        }
        if (_this.startHandlers.length) {
            for (var len = modules.length; modIndex < len; modIndex++) {
                hses.push(modules[modIndex]);
            }

        }

        //the data for rendering template
        _this.renderData = {
            data: _this.ds,
            g: win.wow.data,
            urlkeys: routerParams,
            params: util.cus.getUrlParams(url),
            location: location,
            title: document.title
        };

        var isRenderNow: boolean = true;
        if (dt && !isHistoryData){
            if (typeof dt === 'function'){
                var dtRes: any = dt(_this.ds, _this.renderData);
                if (dtRes.then){
                    isRenderNow = false;
                    dtRes.then(function(data){
                        _this.ds = data;
                        _this.renderData.data = _this.ds;

                        var htmlStr:string = tplRender(_this.renderData);

                        if (_this.sync !== 'sync') {
                            //fill template in the block's container
                            _this.container.innerHTML = htmlStr;
                        }

                        //trigger the handler's init function
                        _this.initBlockHandlers(hses);

                        defered.resolve();
                    }, function(){
                        defered.reject();
                    });
                } else {
                    //Transferring data
                    _this.ds = dtRes;
                    _this.renderData.data = _this.ds;
                }
            }
        }

        if (isRenderNow){
            var htmlStr: string = tplRender(_this.renderData);

            if (_this.sync !== 'sync'){
                //fill template in the block's container
                _this.container.innerHTML = [
                    '<section class="wow-wrap-container">',
                        htmlStr,
                    '</section>'
                ].join('');
            }

            //trigger the handler's init function
            _this.initBlockHandlers(hses);

            defered.resolve();
        }
        return defered.promise;
    }

    private requireResource(requireList: string[], routerParams, defered: any) {
        var _this = this;
        if (_this.requireIng){
            return;
        }
        _this.requireIng = true;
        //require start resources
        util.lang._require(requireList).then(function(mods: any[]){
            _this.requireIng = false;

            //init start handlers
            return _this.renderStart(mods, routerParams).then(function(){
                _this.rendered = true;
                defered.resolve();
            });
        }).then(function(mods: any[]): any{
            //require ready resources
            return util.lang._require(_this.readyHandlers);

        }).then(function(mods: any[]){
            //init ready handlers
            _this.initBlockHandlers(mods);
            defered.resolve();

        }).then(function(mods: any[]): any{
            //require usable resources
            return util.lang._require(_this.usableHandlers);

        }).then(function(mods: any[]){
            //init usable handlers
            _this.initBlockHandlers(mods);
            defered.resolve();

        }, function(err: any){
            if (err.code !== ErrorType.RUNTIME_ERROR_RESOURCE_UNREADY){
                defered.reject(err);
            }
        });
    }

    /**
     * Render block
     * @param wrapper   the block's wrapper HTMLElement
     * @param routerParams  the parameters which are matched from RouterMatcher
     * @returns {Promise}
     */
    public render(wrapper?: HTMLElement, routerParams?: Object): any{
        var defered = win.wow.promise.defer();
        var _this: Block = this;
        var _blockName: string = _this.name;
        var historyNow: History = HistoryStack.getCurrentHistory();
        var historyData = historyNow.getData();
        _this.wrapper = wrapper;
        //if selector is undefined then stop rendering block
        if (!_this.selector){
            defered.reject(ErrorController.getError(ErrorType.BLOCK_SELECTOR_IS_EMPTY));

        } else {
            var containers = win.wow.selector(_this.selector, _this.wrapper);

            //if container element exist
            if (containers && containers[0]){
                _this.container = containers[0];
                var flagBreak: boolean = false;

                //if block is depends on other blocks then judging whether blocks are all rendered or not
                if (_this.depsBlocks.length){
                    util.lang.arrayForEach(_this.depsBlocks, function(depsBlock: Block, index: number){
                        if (!depsBlock.isRendered()) {

                            defered.reject(ErrorController.getError(ErrorType.BLOCK_DEPENDS_BLOCK_NOT_READY));

                            flagBreak = true;
                            return false;
                        }
                    });
                }

                if (!flagBreak && (_this.tpl || _this.tpl === '')){
                    var modules: any = [];
                    var requireList: string[] = _this.sync === 'sync' ? [] : [_this.tpl];
                    //add resource string to require list
                    if (_this.dt){
                        requireList.push(_this.dt);
                    }
                    requireList = requireList.concat(_this.startHandlers);
                    if (_this.css){
                        util.lang.arrayForEach(_this.css, function(cssSource: string, index: number){
                            requireList.push('css!' + cssSource);
                        });
                    }

                    //if the block's data has already exist in history then getting it from history
                    if (historyData && historyData[_blockName]){
                        _this.ds = historyData[_blockName];
                        _this.dsReady = true;
                        _this.requireResource(requireList, routerParams, defered);
                    } else {
                        if (typeof _this.ds === 'string') {
                            _this.ds = _this.ds.replace(/\{([^\{\}]+)\}/g, function(str, key){
                                if (routerParams && routerParams[key]){
                                    return routerParams[key];
                                }

                                var url: string = historyNow.getUrl();
                                var urlParams: any = util.cus.getUrlParams(url);

                                if (url && urlParams && urlParams[key]){
                                    return urlParams[key];
                                }

                                if (win.wow.data && win.wow.data[key]){
                                    return win.wow.data[key];
                                }

                                return '';
                            });

                            //load data from server
                            DSGetter.get(_this.ds).then(function(data: Object){
                                _this.ds = data;
                                _this.dsReady = true;
                                _this.requireResource(requireList, routerParams, defered);
                            }, function(){
                                defered.reject(ErrorController.getError(ErrorType.RESOURCE_DATASOURCE_LOAD_FAIL));
                            });
                        } else {
                            _this.dsReady = true;
                        }
                    }

                    _this.requireResource(requireList, routerParams, defered);
                } else{
                    defered.resolve();
                    _this.rendered = true;
                }
            } else {
                defered.reject(ErrorController.getError(ErrorType.BLOCK_CONTAINER_NOT_EXIST));
            }
        }

        return defered.promise;
    }

    /**
     * Judging this block is equal to the other one
     * @param block  the target block
     * @returns {boolean}
     */
    public equal(block: Block): boolean{
        var _thisDs: any = this.ds,
            _blockDs: any = block.ds,
            _isEqual: boolean = false;

        if (this.tpl === block.tpl){
            if (typeof _blockDs === 'string' && _blockDs === _thisDs) {
                _isEqual = true;
            } else if (typeof _blockDs === 'object' && typeof _thisDs === 'object'){
                _isEqual = true;
                util.lang.objForIn(_blockDs, function(blockInfo, blockKey){
                    if (blockInfo != _thisDs[name]) {
                        _isEqual = false;
                        return false;
                    }
                });
                util.lang.objForIn(_thisDs, function(blockInfo, blockKey){
                    if (blockInfo != _blockDs[name]) {
                        _isEqual = false;
                        return false;
                    }
                });
            }
        }

        return _isEqual;
    }

    public destroy(): any{
        var defered = win.wow.promise.defer();
        this.rendered = false;
        this.dsReady = false;
        return defered.promise;
    }

    public setDepsBlocks(depsBlocks: Block[]): void{
        this.depsBlocks = depsBlocks;
    }
    public setNextBlocks(nextBlocks: Block[]): void {
        this.nextBlocks = nextBlocks;
    }
    public setChildrenBlocks(childrenBlocks: Block[]): void {
        this.childrenBlocks = childrenBlocks;
    }
    public setRendered(rendered: boolean): void{
        this.rendered = rendered;
    }

    public mergeOtherBlock(block: Block): void {
        if (this.name !== block.getName()){
            return;
        }

        this.selector = block.getSelector() || this.selector;
        this.sync = block.getSync() || 'no';
        this.tpl = block.getTpl() || this.tpl;
        this.ds = block.getDs() || this.ds;
        this.dt = block.getDt() || this.dt;
        this.css = block.getCss() || this.css;
        this.startHandlers = block.getStartHandlers() || this.startHandlers;
        this.readyHandlers = block.getReadyHandlers() || this.readyHandlers;
        this.usableHandlers = block.getUsableHandlers() || this.usableHandlers;
        this.childrenBlocks = block.getChildrenBlocks() || this.childrenBlocks;
    }

    public getName(): string{
        return this.name;
    }
    public getSelector(): string{
        return this.selector;
    }
    public getSync(): string{
        return this.sync;
    }
    public getTpl(): string{
        return this.tpl;
    }
    public getDs(): string{
        return this.ds;
    }
    public getDt(): string{
        return this.dt;
    }
    public getCss(): string[]{
        return this.css;
    }
    public getStartHandlers(): any[]{
        return this.startHandlers;
    }
    public getReadyHandlers(): any[]{
        return this.readyHandlers;
    }
    public getUsableHandlers(): any[]{
        return this.usableHandlers;
    }
    public getChildrenBlocks(): Block[]{
        return this.childrenBlocks;
    }
    public getDepsBlocks(): Block[]{
        return this.depsBlocks;
    }
    public getNextBlocks(): Block[]{
        return this.nextBlocks;
    }
    public getConteiner(): HTMLElement{
        return this.container;
    }
    public isRendered(): boolean{
        return this.rendered;
    }
}
export = Block;
