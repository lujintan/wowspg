import Router = require('./Router');
import err = require('./Error');
import util = require('./utils');
import Tree = require('./Tree');
import Block = require('./Block');

import decl = require('./declare');

var win: any = decl.win;
var ErrorType = err.ErrorType;
var ErrorController = err.ErrorController;

/**
 * Matching a router path from the router tree
 */
class RouterMatcher{
    private routerConf: any;
    private currentRouterPath: Router[];
    private routerParams: Object;
    private currentRenderUrl: string;

    constructor(routerConf: any){
        this.routerConf = routerConf;
        this.routerConf = this.fixRouterConf();
        this.routerParams = {};
        this.currentRouterPath = [];
        this.currentRenderUrl = '';
    }

    /**
     * Judging the configuration of router is correct
     * @returns {any}
     */
    private fixRouterConf(): any {
        var conf: any = this.routerConf,
            len: number = 0;

        util.lang.objForIn(conf, function(rItem, rKey){
            if (rItem && (rItem.block || rItem.router)) {
                len++;
            }
        });

        if (len) {
            return conf;
        } else {
            //config error
            err.ErrorController.trigger(err.ErrorType.CONFIG_ERROR);
        }
    }

    /**
     * Matching the url and return the router path
     * @param url
     * @returns {Promise}
     */
    private routerMatch(url: string): any{
        var deferred: any = win.wow.promise.defer();
        var _this: RouterMatcher = this;

        _this.currentRouterPath = [];
        var rootRouterDoneCount: number = 1;
        var rootCount: number = 0;
        var isRejected: boolean = false;

        util.lang.objForIn(_this.routerConf, function(rConf, reg){
            var rootRouter: Router = new Router(reg, rConf.title, rConf.block, rConf.router);
            var routerTree: Tree = new Tree(rootRouter);
            var nextMatchRouter: Router;
            rootCount++;

            if (_this.currentRenderUrl === url){
                //traversal the router tree to find out the router matched
                routerTree.traversal(function(router): any{
                    var defLoadRouter: any = win.wow.promise.defer();
                    var routerReg: RegExp = router.getUrlReg();
                    var regResult: string[] = routerReg.exec(url);

                    if (_this.currentRenderUrl !== url) {
                        if (!isRejected) {
                            deferred.reject(ErrorController.getError(ErrorType.ROUTER_MATCHING_STOPPED));
                            isRejected = true;
                        }
                        return true;
                    }

                    if (regResult && typeof regResult[0] !== 'undefined'){
                        if (nextMatchRouter){
                            if (!nextMatchRouter.equal(router)){
                                return true;
                            }
                            else{
                                nextMatchRouter = null;
                            }
                        } else{    //find the next leaf which to need to search
                            var childRouters: Router[] = router.getChildrenNods();
                            util.lang.arrayForEach(childRouters, function(router){
                                var routerUrlReg = router.getUrlReg(),
                                    regChildResult = routerUrlReg.exec(url);
                                if (regChildResult && typeof regChildResult[0] !== 'undefined'){
                                    nextMatchRouter = router;
                                }
                            });

                            if (!nextMatchRouter && childRouters.length){
                                return true;
                            }
                        }
                        //this router node is what i want
                        _this.currentRouterPath.push(router);
                        var urlkeys: string[] = router.getUrlKeys();
                        util.lang.arrayForEach(urlkeys, function(urlKey, index){
                            _this.routerParams[urlKey] = regResult[index + 1];
                        });

                        if (typeof router.blocks === 'string'){  //the block need to require from server
                            util.lang._require([router.blocks]).then(function(mods: any){
                                var childRouterConf: any = mods[0];
                                router.setBlocks(childRouterConf.block);
                                router.setChildrenRouters(childRouterConf.router);
                                defLoadRouter.resolve();
                            });
                        } else{
                            defLoadRouter.resolve();
                        }
                    } else {
                        //stop matching this leaf and going on
                        return true;
                    }
                    return defLoadRouter.promise;
                }).then(function(){
                    if (++rootRouterDoneCount > rootCount){
                        deferred.resolve();
                    }
                });
            }
        });

        return deferred.promise;
    }

    /**
     * find the child block which is same with the name appointed
     * @param blockName
     * @param startDepth
     * @returns {{depth: number, block: Block}}
     */
    private findBlockByName(blockName: string, startDepth: number = 1): any{
        var pathDepth: number = 0;
        var targetBlock: Block = null;
        var currentRouterPath: Router[] = this.currentRouterPath;

        for (var i = startDepth, len = currentRouterPath.length ; i < len ; i++){
            var router: Router = currentRouterPath[i];
            var blocks: Block[] = router.getBlocks();

            util.lang.arrayForEach(blocks, function(block: Block, depth: number){
                if (block.getName() === blockName){
                    pathDepth = depth;
                    targetBlock = block;
                }
            });
        }

        return {
            depth: pathDepth,
            block: targetBlock
        };
    }

    /**
     * Get the block which is need to render by router path
     * @param rootBlock
     * @param depth
     * @returns {Block}
     */
    private matchBlockTree(rootBlock: Block, depth: number = 1): Block{
        var _this: RouterMatcher = this;
        var coverInfo: any = _this.findBlockByName(rootBlock.getName(), depth);
        var block = coverInfo.block;
        var pathDepth: number = coverInfo.depth || depth;

        if (block){
            rootBlock.mergeOtherBlock(block);
        }
        var childrenBlocks = rootBlock.getChildrenBlocks();

        util.lang.arrayForEach(childrenBlocks, function(childBlock: Block){
            _this.matchBlockTree(childBlock, pathDepth);
        });

        return rootBlock;
    }

    /**
     * Matching url
     * @param url
     * @returns {Promise}
     */
    public match(url: string): any{
        var _this: RouterMatcher = this;

        var deferred: any = win.wow.promise.defer();
        var blockTreeRoots: Block[] = [];

        _this.currentRenderUrl = url;
        _this.routerMatch(url).done(function(){
            var currentRouterPath = _this.currentRouterPath;
            if (!currentRouterPath.length){
                //do not find out the router matched
                deferred.reject(ErrorController.getError(ErrorType.PAGE_NOT_FOUND));
            } else{
                blockTreeRoots = currentRouterPath[0].getBlocks();

                util.lang.arrayForEach(blockTreeRoots, function(block: Block, index: number){
                    blockTreeRoots[index] = _this.matchBlockTree(block);
                });

                deferred.resolve(blockTreeRoots);
            }
        });

        return deferred.promise;
    }

    /**
     * get params from router matching
     * @returns {Object}
     */
    public getRouterParams(): any{
        return this.routerParams;
    }

    /**
     * get page's title which is in router's config
     * @returns {string}
     */
    public getRouterTitle(): string{
        var _this: RouterMatcher = this;
        var title: string = document.title;
        util.lang.arrayForEach(_this.currentRouterPath, function(router: Router){
            var routerTitle: string = router.getTitle();
            if (routerTitle){
                title = routerTitle;
            }
        });
        return title;
    }
}

export = RouterMatcher;