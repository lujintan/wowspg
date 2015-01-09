import Block = require('./Block');
import TreeNode = require('./TreeNode');
import util = require('./utils');

/**
 * Router of a page
 */
class Router implements TreeNode{
    private urlReg: RegExp;
    private title: string;
    private urlKeys: string[];
    private blocks: Block[];
    private childrenRouters: any[];

    constructor(urlReg: string, title: string, blocks: Block[] = [], childrenRouters: any[] = []) {
        var _this: Router = this;
        _this.urlReg = util.cus.getRenderReg(urlReg);
        _this.title = title;
        _this.setBlocks(blocks);
        _this.setChildrenRouters(childrenRouters);
        _this.urlKeys = [];
    }

    /**
     * set children routers by router config
     * @param childrenRouters
     */
    public setChildrenRouters(childrenRouters?: any[]): void{
        var _this: Router = this;
        if (childrenRouters && typeof childrenRouters.length === 'undefined'){
            _this.childrenRouters = [];
            util.lang.objForIn(childrenRouters, function(info, reg){
                if (typeof info === 'string'){
                    _this.childrenRouters.push(new Router(reg, null, info));
                }
                else{
                    _this.childrenRouters.push(new Router(reg, null, info.block, info.router));
                }
            });
        }
        else{
            _this.childrenRouters = childrenRouters;
        }
    }

    /**
     * set blocks by router config
     * @param blocks
     */
    public setBlocks(blocks?: Block[]): void{
        var _this: Router = this;
        if (blocks && typeof blocks.length === 'undefined'){
            _this.blocks = [];
            util.lang.objForIn(blocks, function(info, name){
                var cusHandler: any = info.handler || {},
                    childrenBlocks: Block[] = [],
                    depsBlocks: Block[] = [];

                if (info.block){
                    util.lang.objForIn(info.block, function(childInfo: any, childName: string){
                        var childHandler: any = childInfo.handler || {};
                        childrenBlocks.push(new Block(
                            childName, childInfo.selector, childInfo.sync, childInfo.tpl,
                            childInfo.ds, childInfo.dt, childInfo.css,
                            childHandler.start, childHandler.ready, childHandler.usable));
                    });
                }

                if (info.deps){
                    util.lang.arrayForEach(info.deps, function(depsName: any){
                        depsBlocks.push(new Block(depsName));
                    });
                }

                _this.blocks.push(new Block(
                    name, info.selector, info.sync, info.tpl, info.ds, info.dt, info.css,
                    cusHandler.start, cusHandler.ready, cusHandler.usable,
                    childrenBlocks, depsBlocks));
            });

            util.lang.arrayForEach(_this.blocks, function(block: Block){
                var deps: Block[] = block.getDepsBlocks();
                var realDepsBlock: Block[] = [];
                util.lang.arrayForEach(deps, function(depsBlock: Block){
                    var depsBlockName: string = depsBlock.getName();
                    util.lang.arrayForEach(_this.blocks, function(inBlock: Block){
                        if (inBlock.getName() === depsBlockName){
                            realDepsBlock.push(inBlock);
                            var nextBlocks = inBlock.getNextBlocks();
                            nextBlocks.push(block);
                            inBlock.setNextBlocks(nextBlocks);
                            return false;
                        }
                    });
                });

                block.setDepsBlocks(realDepsBlock);
            });
        }
        else{
            _this.blocks = blocks || [];
        }
    }


    public getTitle(): string{
        return this.title;
    }
    public getUrlReg(): RegExp{
        return this.urlReg;
    }
    public getBlocks(): Block[]{
        return this.blocks;
    }
    public getChildrenNods(): any[] {
        return this.childrenRouters;
    }
    public getUrlKeys(): string[] {
        return this.urlKeys;
    }

    /**
     * whether it is equal to anther router object or not
     * @param router
     * @returns {boolean}
     */
    public equal(router: Router): boolean{
        if (router.getUrlReg() === this.urlReg && router.getBlocks() === this.blocks){
            return true;
        }
        return false;
    }

}

export = Router;