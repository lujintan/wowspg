define(["require", "exports", './Router', './Error', './utils', './Tree', './declare'], function (require, exports, Router, err, util, Tree, decl) {
    var win = decl.win;
    var ErrorType = err.ErrorType;
    var ErrorController = err.ErrorController;
    /**
     * Matching a router path from the router tree
     */
    var RouterMatcher = (function () {
        function RouterMatcher(routerConf) {
            this.routerConf = routerConf;
            this.routerConf = this.fixRouterConf();
            this.routerParams = {};
            this.currentRouterPath = [];
        }
        /**
         * Judging the configuration of router is correct
         * @returns {any}
         */
        RouterMatcher.prototype.fixRouterConf = function () {
            var conf = this.routerConf, len = 0;
            util.lang.objForIn(conf, function (rItem, rKey) {
                if (rItem && (rItem.block || rItem.router)) {
                    len++;
                }
            });
            if (len) {
                return conf;
            }
            else {
                //config error
                err.ErrorController.trigger(101 /* CONFIG_ERROR */);
            }
        };
        /**
         * Matching the url and return the router path
         * @param url
         * @returns {Promise}
         */
        RouterMatcher.prototype.routerMatch = function (url) {
            var deferred = win.wow.promise.defer();
            var _this = this;
            _this.currentRouterPath = [];
            var rootRouterDoneCount = 1;
            var rootCount = 0;
            util.lang.objForIn(_this.routerConf, function (rConf, reg) {
                var rootRouter = new Router(reg, rConf.title, rConf.block, rConf.router);
                var routerTree = new Tree(rootRouter);
                var nextMatchRouter;
                rootCount++;
                //traversal the router tree to find out the router matched
                routerTree.traversal(function (router) {
                    var defLoadRouter = win.wow.promise.defer();
                    var routerReg = router.getUrlReg();
                    var regResult = routerReg.exec(url);
                    if (regResult && typeof regResult[0] !== 'undefined') {
                        if (nextMatchRouter) {
                            if (!nextMatchRouter.equal(router)) {
                                return true;
                            }
                            else {
                                nextMatchRouter = null;
                            }
                        }
                        else {
                            var childRouters = router.getChildrenNods();
                            util.lang.arrayForEach(childRouters, function (router) {
                                var routerUrlReg = router.getUrlReg(), regChildResult = routerUrlReg.exec(url);
                                if (regChildResult && typeof regChildResult[0] !== 'undefined') {
                                    nextMatchRouter = router;
                                }
                            });
                            if (!nextMatchRouter && childRouters.length) {
                                return true;
                            }
                        }
                        //this router node is what i want
                        _this.currentRouterPath.push(router);
                        var urlkeys = router.getUrlKeys();
                        util.lang.arrayForEach(urlkeys, function (urlKey, index) {
                            _this.routerParams[urlKey] = regResult[index + 1];
                        });
                        if (typeof router.blocks === 'string') {
                            util.lang._require([router.blocks]).then(function (mods) {
                                var childRouterConf = mods[0];
                                router.setBlocks(childRouterConf.block);
                                router.setChildrenRouters(childRouterConf.router);
                                defLoadRouter.resolve();
                            });
                        }
                        else {
                            defLoadRouter.resolve();
                        }
                    }
                    else {
                        //stop matching this leaf and going on
                        return true;
                    }
                    return defLoadRouter.promise;
                }).done(function () {
                    if (++rootRouterDoneCount > rootCount) {
                        deferred.resolve();
                    }
                });
            });
            return deferred.promise;
        };
        /**
         * find the child block which is same with the name appointed
         * @param blockName
         * @param startDepth
         * @returns {{depth: number, block: Block}}
         */
        RouterMatcher.prototype.findBlockByName = function (blockName, startDepth) {
            if (startDepth === void 0) { startDepth = 1; }
            var pathDepth = 0;
            var targetBlock = null;
            var currentRouterPath = this.currentRouterPath;
            for (var i = startDepth, len = currentRouterPath.length; i < len; i++) {
                var router = currentRouterPath[i];
                var blocks = router.getBlocks();
                util.lang.arrayForEach(blocks, function (block, depth) {
                    if (block.getName() === blockName) {
                        pathDepth = depth;
                        targetBlock = block;
                    }
                });
            }
            return {
                depth: pathDepth,
                block: targetBlock
            };
        };
        /**
         * Get the block which is need to render by router path
         * @param rootBlock
         * @param depth
         * @returns {Block}
         */
        RouterMatcher.prototype.matchBlockTree = function (rootBlock, depth) {
            if (depth === void 0) { depth = 1; }
            var _this = this;
            var coverInfo = _this.findBlockByName(rootBlock.getName(), depth);
            var block = coverInfo.block;
            var pathDepth = coverInfo.depth || depth;
            if (block) {
                rootBlock.mergeOtherBlock(block);
            }
            var childrenBlocks = rootBlock.getChildrenBlocks();
            util.lang.arrayForEach(childrenBlocks, function (childBlock) {
                _this.matchBlockTree(childBlock, pathDepth);
            });
            return rootBlock;
        };
        /**
         * Matching url
         * @param url
         * @returns {Promise}
         */
        RouterMatcher.prototype.match = function (url) {
            var deferred = win.wow.promise.defer();
            var _this = this;
            var blockTreeRoots = [];
            _this.routerMatch(url).done(function () {
                var currentRouterPath = _this.currentRouterPath;
                if (!currentRouterPath.length) {
                    //do not find out the router matched
                    deferred.reject(ErrorController.getError(404 /* PAGE_NOT_FOUND */));
                }
                else {
                    blockTreeRoots = currentRouterPath[0].getBlocks();
                    util.lang.arrayForEach(blockTreeRoots, function (block, index) {
                        blockTreeRoots[index] = _this.matchBlockTree(block);
                    });
                    deferred.resolve(blockTreeRoots);
                }
            });
            return deferred.promise;
        };
        /**
         * get params from router matching
         * @returns {Object}
         */
        RouterMatcher.prototype.getRouterParams = function () {
            return this.routerParams;
        };
        /**
         * get page's title which is in router's config
         * @returns {string}
         */
        RouterMatcher.prototype.getRouterTitle = function () {
            var _this = this;
            var title = document.title;
            util.lang.arrayForEach(_this.currentRouterPath, function (router) {
                var routerTitle = router.getTitle();
                if (routerTitle) {
                    title = routerTitle;
                }
            });
            return title;
        };
        return RouterMatcher;
    })();
    return RouterMatcher;
});
