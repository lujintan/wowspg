/**
 * Created by lujintan on 12/03/14.
 */
define(["require", "exports", './utils', './Error', './declare'], function (require, exports, util, err, decl) {
    var win = decl.win;
    var ErrorType = err.ErrorType;
    var ErrorController = err.ErrorController;
    /**
     * For page render
     */
    var Render = (function () {
        function Render() {
        }
        /**
         * destroy a block and all its children blocks
         * @param rootBlock
         */
        Render.destroyBlock = function (rootBlock) {
            rootBlock.destroy();
            var childrenBlocks = rootBlock.getChildrenBlocks();
            util.lang.arrayForEach(childrenBlocks, function (childBlock) {
                Render.destroyBlock(childBlock);
            });
        };
        /**
         * render a block and all its children blocks
         * @param rootBlock
         * @param wrapper
         * @param routerParams
         * @returns {Promise}
         */
        Render.renderBlock = function (rootBlock, wrapper, routerParams) {
            var defered = win.wow.promise.defer();
            var renderResult;
            var lastEqualNameBlock = null;
            var rootBlockName = rootBlock.getName();
            util.lang.arrayForEach(Render.lastRenderBlocks, function (block) {
                if (rootBlockName === block.getName()) {
                    lastEqualNameBlock = block;
                    if (rootBlock.equal(block)) {
                        renderResult = util.lang.fnThenEmpty();
                        rootBlock.setRendered(true);
                        return false;
                    }
                }
            });
            if (!renderResult || !renderResult.then) {
                renderResult = rootBlock.render(wrapper, routerParams);
                if (lastEqualNameBlock && lastEqualNameBlock.isRendered()) {
                    Render.destroyBlock(lastEqualNameBlock);
                }
            }
            //render root block
            renderResult.then(function () {
                //add to current rendered block list
                Render.currentRenderBlocks.push(rootBlock);
                //render the children blocks
                var childrenBlocks = rootBlock.getChildrenBlocks();
                var childrenLen = childrenBlocks.length;
                var renderedNum = 1;
                var failChildrenName = [];
                util.lang.arrayForEach(childrenBlocks, function (childBlock) {
                    Render.renderBlock(childBlock, rootBlock.getConteiner(), routerParams).then(function () {
                        if (++renderedNum > childrenLen) {
                            if (!failChildrenName.length) {
                                defered.resolve();
                            }
                            else {
                                defered.reject(ErrorController.getError(303 /* BLOCK_ERROR */), failChildrenName);
                            }
                        }
                    }, function () {
                        failChildrenName.push(childBlock.getName());
                        if (++renderedNum > childrenLen) {
                            defered.reject(ErrorController.getError(303 /* BLOCK_ERROR */), failChildrenName);
                        }
                    });
                });
                if (!childrenBlocks.length) {
                    defered.resolve();
                }
                //render blocks which depends on this block
                var nextBlocks = rootBlock.getNextBlocks();
                util.lang.arrayForEach(nextBlocks, function (nextBlock) {
                    Render.renderBlock(nextBlock, wrapper, routerParams);
                });
            }, function (error) {
                defered.reject(error);
            });
            return defered.promise;
        };
        /**
         * To render page's all blocks
         * @param rootBlocks
         * @param routerParams
         * @returns {Promise}
         */
        Render.page = function (rootBlocks, routerParams) {
            var defered = win.wow.promise.defer();
            var renderedNum = 1;
            var rootBlockLen = rootBlocks.length;
            var failRenderedName = [];
            Render.lastRenderBlocks = Render.currentRenderBlocks;
            Render.currentRenderBlocks = [];
            //render all root blocks
            util.lang.arrayForEach(rootBlocks, function (rootBlock) {
                Render.renderBlock(rootBlock, document.body, routerParams).then(function () {
                    if (++renderedNum > rootBlockLen) {
                        if (!failRenderedName.length) {
                            defered.resolve();
                        }
                        else {
                            defered.reject(ErrorController.getError(303 /* BLOCK_ERROR */), failRenderedName);
                        }
                    }
                }, function () {
                    failRenderedName.push(rootBlock.getName());
                    if (++renderedNum > rootBlockLen) {
                        defered.reject(ErrorController.getError(303 /* BLOCK_ERROR */), failRenderedName);
                    }
                });
            });
            return defered.promise;
        };
        Render.lastRenderBlocks = [];
        Render.currentRenderBlocks = [];
        return Render;
    })();
    return Render;
});
