/**
 * Created by lujintan on 12/03/14.
 */

import util = require('./utils');
import Block = require('./Block');
import History = require('./History');
import err = require('./Error');
import decl = require('./declare');

var win: any = decl.win;

var ErrorType = err.ErrorType;
var ErrorController = err.ErrorController;

/**
 * For page render
 */
class Render{

    private static lastRenderBlocks: Block[] = [];
    private static currentRenderBlocks: Block[] = [];

    /**
     * destroy a block and all its children blocks
     * @param rootBlock
     */
    private static destroyBlock(rootBlock: Block){
        rootBlock.destroy();

        var childrenBlocks: Block[] = rootBlock.getChildrenBlocks();
        util.lang.arrayForEach(childrenBlocks, function(childBlock: Block){
            Render.destroyBlock(childBlock);
        });
    }

    /**
     * render a block and all its children blocks
     * @param rootBlock
     * @param wrapper
     * @param routerParams
     * @returns {Promise}
     */
    private static renderBlock(rootBlock: Block, wrapper: HTMLElement, routerParams: any): any{
        var defered = win.wow.promise.defer();
        var renderResult: any;
        var lastEqualNameBlock: Block = null;
        var rootBlockName: string = rootBlock.getName();
        util.lang.arrayForEach(Render.lastRenderBlocks, function(block: Block){
            if (rootBlockName === block.getName()){
                lastEqualNameBlock = block;
                if (rootBlock.equal(block)){
                    renderResult = util.lang.fnThenEmpty();
                    rootBlock.setRendered(true);
                    return false;
                }
            }
        });

        if (!renderResult || !renderResult.then){
            renderResult = rootBlock.render(wrapper, routerParams);
            if (lastEqualNameBlock && lastEqualNameBlock.isRendered()){
                Render.destroyBlock(lastEqualNameBlock);
            }
        }

        //render root block
        renderResult.then(function(){
            //add to current rendered block list
            Render.currentRenderBlocks.push(rootBlock);

            //render the children blocks
            var childrenBlocks: Block[] = rootBlock.getChildrenBlocks();
            var childrenLen: number = childrenBlocks.length;
            var renderedNum: number = 1;
            var failChildrenName: string[] = [];
            util.lang.arrayForEach(childrenBlocks, function(childBlock: Block){
                Render.renderBlock(childBlock, rootBlock.getConteiner(), routerParams).then(function(){
                    if (++renderedNum > childrenLen){
                        if (!failChildrenName.length){
                            defered.resolve();
                        } else{
                            defered.reject(ErrorController.getError(ErrorType.BLOCK_ERROR),
                                failChildrenName);
                        }
                    }
                }, function(){
                    failChildrenName.push(childBlock.getName());

                    if (++renderedNum > childrenLen){
                        defered.reject(ErrorController.getError(ErrorType.BLOCK_ERROR),
                            failChildrenName);
                    }
                });
            });

            if (!childrenBlocks.length){
                defered.resolve();
            }

            //render blocks which depends on this block
            var nextBlocks: Block[] = rootBlock.getNextBlocks();
            util.lang.arrayForEach(nextBlocks, function(nextBlock: Block){
                Render.renderBlock(nextBlock, wrapper, routerParams);
            });
        }, function(error: err.ErrorInfo){
            defered.reject(error);
        });

        return defered.promise;
    }

    /**
     * To render page's all blocks
     * @param rootBlocks
     * @param routerParams
     * @returns {Promise}
     */
    public static page(rootBlocks: Block[], routerParams: any): any{
        var defered: any = win.wow.promise.defer();
        var renderedNum: number = 1;
        var rootBlockLen: number = rootBlocks.length;
        var failRenderedName: string[] = [];

        Render.lastRenderBlocks = Render.currentRenderBlocks;
        Render.currentRenderBlocks = [];

        //render all root blocks
        util.lang.arrayForEach(rootBlocks, function(rootBlock: Block){
            Render.renderBlock(rootBlock, document.body, routerParams).then(function(){
                if (++renderedNum > rootBlockLen){
                    if (!failRenderedName.length){
                        defered.resolve();
                    } else{
                        defered.reject(ErrorController.getError(ErrorType.BLOCK_ERROR),
                            failRenderedName);
                    }
                }
            }, function(){
                failRenderedName.push(rootBlock.getName());
                if (++renderedNum > rootBlockLen){
                    defered.reject(ErrorController.getError(ErrorType.BLOCK_ERROR),
                        failRenderedName);
                }
            });
        });

        return defered.promise;
    }
}

export = Render;