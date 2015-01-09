define(["require", "exports", './Block', './utils'], function (require, exports, Block, util) {
    /**
     * Router of a page
     */
    var Router = (function () {
        function Router(urlReg, title, blocks, childrenRouters) {
            if (blocks === void 0) { blocks = []; }
            if (childrenRouters === void 0) { childrenRouters = []; }
            var _this = this;
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
        Router.prototype.setChildrenRouters = function (childrenRouters) {
            var _this = this;
            if (childrenRouters && typeof childrenRouters.length === 'undefined') {
                _this.childrenRouters = [];
                util.lang.objForIn(childrenRouters, function (info, reg) {
                    if (typeof info === 'string') {
                        _this.childrenRouters.push(new Router(reg, null, info));
                    }
                    else {
                        _this.childrenRouters.push(new Router(reg, null, info.block, info.router));
                    }
                });
            }
            else {
                _this.childrenRouters = childrenRouters;
            }
        };
        /**
         * set blocks by router config
         * @param blocks
         */
        Router.prototype.setBlocks = function (blocks) {
            var _this = this;
            if (blocks && typeof blocks.length === 'undefined') {
                _this.blocks = [];
                util.lang.objForIn(blocks, function (info, name) {
                    var cusHandler = info.handler || {}, childrenBlocks = [], depsBlocks = [];
                    if (info.block) {
                        util.lang.objForIn(info.block, function (childInfo, childName) {
                            var childHandler = childInfo.handler || {};
                            childrenBlocks.push(new Block(childName, childInfo.selector, childInfo.sync, childInfo.tpl, childInfo.ds, childInfo.dt, childInfo.css, childHandler.start, childHandler.ready, childHandler.usable));
                        });
                    }
                    if (info.deps) {
                        util.lang.arrayForEach(info.deps, function (depsName) {
                            depsBlocks.push(new Block(depsName));
                        });
                    }
                    _this.blocks.push(new Block(name, info.selector, info.sync, info.tpl, info.ds, info.dt, info.css, cusHandler.start, cusHandler.ready, cusHandler.usable, childrenBlocks, depsBlocks));
                });
                util.lang.arrayForEach(_this.blocks, function (block) {
                    var deps = block.getDepsBlocks();
                    var realDepsBlock = [];
                    util.lang.arrayForEach(deps, function (depsBlock) {
                        var depsBlockName = depsBlock.getName();
                        util.lang.arrayForEach(_this.blocks, function (inBlock) {
                            if (inBlock.getName() === depsBlockName) {
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
            else {
                _this.blocks = blocks || [];
            }
        };
        Router.prototype.getTitle = function () {
            return this.title;
        };
        Router.prototype.getUrlReg = function () {
            return this.urlReg;
        };
        Router.prototype.getBlocks = function () {
            return this.blocks;
        };
        Router.prototype.getChildrenNods = function () {
            return this.childrenRouters;
        };
        Router.prototype.getUrlKeys = function () {
            return this.urlKeys;
        };
        /**
         * whether it is equal to anther router object or not
         * @param router
         * @returns {boolean}
         */
        Router.prototype.equal = function (router) {
            if (router.getUrlReg() === this.urlReg && router.getBlocks() === this.blocks) {
                return true;
            }
            return false;
        };
        return Router;
    })();
    return Router;
});
