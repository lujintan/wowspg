/**
 * Created by lujintan on 11/26/14.
 */
define(["require", "exports", './utils', './HistoryStack', './DSGetter', './Error', './declare'], function (require, exports, util, HistoryStack, DSGetter, err, decl) {
    var win = decl.win;
    var ErrorType = err.ErrorType;
    var ErrorController = err.ErrorController;
    /**
     * Block is pagelet of a page
     * A block can belongs to another as a child block
     * It also can depends on other blocks
     * A page is form out of a series of blocks with tree structure
     */
    var Block = (function () {
        function Block(name, selector, sync, tpl, ds, dt, css, startHandlers, readyHandlers, usableHandlers, childrenBlocks, depsBlocks) {
            if (selector === void 0) { selector = null; }
            if (sync === void 0) { sync = 'no'; }
            if (tpl === void 0) { tpl = null; }
            if (ds === void 0) { ds = null; }
            if (dt === void 0) { dt = ''; }
            if (css === void 0) { css = []; }
            if (startHandlers === void 0) { startHandlers = []; }
            if (readyHandlers === void 0) { readyHandlers = []; }
            if (usableHandlers === void 0) { usableHandlers = []; }
            if (childrenBlocks === void 0) { childrenBlocks = []; }
            if (depsBlocks === void 0) { depsBlocks = []; }
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
        Block.prototype.initBlockHandlers = function (handlers) {
            var _this = this;
            util.lang.arrayForEach(handlers, function (handler) {
                var blockWrap = win.wow.selector('.wow-wrap-container', _this.container);
                handler.init && handler.init(blockWrap && blockWrap[0] ? blockWrap[0] : _this.container, _this.renderData);
            });
        };
        /**
         * start to render template and trigger the start handler's init functino
         * @param modules
         * @param routerParams
         * @returns {Promise}
         */
        Block.prototype.renderStart = function (modules, routerParams, isHistoryData) {
            if (routerParams === void 0) { routerParams = {}; }
            var defered = win.wow.promise.defer();
            var _this = this;
            var historyNow = HistoryStack.getCurrentHistory();
            var url = historyNow.getUrl();
            //when data source, data transfer and start handlers are all loaded
            if (!_this.dsReady || (!modules.length && _this.sync !== 'sync')) {
                defered.reject(ErrorController.getError(506 /* RUNTIME_ERROR_RESOURCE_UNREADY */));
                return defered.promise;
            }
            //start handlers
            var hses = [];
            //modules index
            var modIndex = 0;
            //template render
            var tplRender = _this.sync === 'sync' ? function () {
                return _this.container.innerHTML;
            } : modules[modIndex++];
            //data transfer
            var dt;
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
            var isRenderNow = true;
            if (dt && !isHistoryData) {
                if (typeof dt === 'function') {
                    var dtRes = dt(_this.ds, _this.renderData);
                    if (dtRes.then) {
                        isRenderNow = false;
                        dtRes.then(function (data) {
                            _this.ds = data;
                            _this.renderData.data = _this.ds;
                            var htmlStr = tplRender(_this.renderData);
                            if (_this.sync !== 'sync') {
                                //fill template in the block's container
                                _this.container.innerHTML = htmlStr;
                            }
                            //trigger the handler's init function
                            _this.initBlockHandlers(hses);
                            defered.resolve();
                        }, function () {
                            defered.reject();
                        });
                    }
                    else {
                        //Transferring data
                        _this.ds = dtRes;
                        _this.renderData.data = _this.ds;
                    }
                }
            }
            if (isRenderNow) {
                var htmlStr = tplRender(_this.renderData);
                if (_this.sync !== 'sync') {
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
        };
        Block.prototype.requireResource = function (requireList, routerParams, defered) {
            var _this = this;
            if (_this.requireIng) {
                return;
            }
            _this.requireIng = true;
            //require start resources
            util.lang._require(requireList).then(function (mods) {
                _this.requireIng = false;
                //init start handlers
                return _this.renderStart(mods, routerParams).then(function () {
                    _this.rendered = true;
                    defered.resolve();
                });
            }).then(function (mods) {
                //require ready resources
                return util.lang._require(_this.readyHandlers);
            }).then(function (mods) {
                //init ready handlers
                _this.initBlockHandlers(mods);
                defered.resolve();
            }).then(function (mods) {
                //require usable resources
                return util.lang._require(_this.usableHandlers);
            }).then(function (mods) {
                //init usable handlers
                _this.initBlockHandlers(mods);
                defered.resolve();
            }, function (err) {
                if (err.code !== 506 /* RUNTIME_ERROR_RESOURCE_UNREADY */) {
                    defered.reject(err);
                }
            });
        };
        /**
         * Render block
         * @param wrapper   the block's wrapper HTMLElement
         * @param routerParams  the parameters which are matched from RouterMatcher
         * @returns {Promise}
         */
        Block.prototype.render = function (wrapper, routerParams) {
            var defered = win.wow.promise.defer();
            var _this = this;
            var _blockName = _this.name;
            var historyNow = HistoryStack.getCurrentHistory();
            var historyData = historyNow.getData();
            _this.wrapper = wrapper;
            //if selector is undefined then stop rendering block
            if (!_this.selector) {
                defered.reject(ErrorController.getError(310 /* BLOCK_SELECTOR_IS_EMPTY */));
            }
            else {
                var containers = win.wow.selector(_this.selector, _this.wrapper);
                //if container element exist
                if (containers && containers[0]) {
                    _this.container = containers[0];
                    var flagBreak = false;
                    //if block is depends on other blocks then judging whether blocks are all rendered or not
                    if (_this.depsBlocks.length) {
                        util.lang.arrayForEach(_this.depsBlocks, function (depsBlock, index) {
                            if (!depsBlock.isRendered()) {
                                defered.reject(ErrorController.getError(311 /* BLOCK_DEPENDS_BLOCK_NOT_READY */));
                                flagBreak = true;
                                return false;
                            }
                        });
                    }
                    if (!flagBreak && (_this.tpl || _this.tpl === '')) {
                        var modules = [];
                        var requireList = _this.sync === 'sync' ? [] : [_this.tpl];
                        //add resource string to require list
                        if (_this.dt) {
                            requireList.push(_this.dt);
                        }
                        requireList = requireList.concat(_this.startHandlers);
                        if (_this.css) {
                            util.lang.arrayForEach(_this.css, function (cssSource, index) {
                                requireList.push('css!' + cssSource);
                            });
                        }
                        //if the block's data has already exist in history then getting it from history
                        if (historyData && historyData[_blockName]) {
                            _this.ds = historyData[_blockName];
                            _this.dsReady = true;
                            _this.requireResource(requireList, routerParams, defered);
                        }
                        else {
                            if (typeof _this.ds === 'string') {
                                _this.ds = _this.ds.replace(/\{([^\{\}]+)\}/g, function (str, key) {
                                    if (routerParams && routerParams[key]) {
                                        return routerParams[key];
                                    }
                                    var url = historyNow.getUrl();
                                    var urlParams = util.cus.getUrlParams(url);
                                    if (url && urlParams && urlParams[key]) {
                                        return urlParams[key];
                                    }
                                    if (win.wow.data && win.wow.data[key]) {
                                        return win.wow.data[key];
                                    }
                                    return '';
                                });
                                //load data from server
                                DSGetter.get(_this.ds).then(function (data) {
                                    _this.ds = data;
                                    _this.dsReady = true;
                                    _this.requireResource(requireList, routerParams, defered);
                                }, function () {
                                    defered.reject(ErrorController.getError(610 /* RESOURCE_DATASOURCE_LOAD_FAIL */));
                                });
                            }
                            else {
                                _this.dsReady = true;
                            }
                        }
                        _this.requireResource(requireList, routerParams, defered);
                    }
                    else {
                        defered.resolve();
                        _this.rendered = true;
                    }
                }
                else {
                    defered.reject(ErrorController.getError(311 /* BLOCK_CONTAINER_NOT_EXIST */));
                }
            }
            return defered.promise;
        };
        /**
         * Judging this block is equal to the other one
         * @param block  the target block
         * @returns {boolean}
         */
        Block.prototype.equal = function (block) {
            var _thisDs = this.ds, _blockDs = block.ds, _isEqual = false;
            if (this.tpl === block.tpl) {
                if (typeof _blockDs === 'string' && _blockDs === _thisDs) {
                    _isEqual = true;
                }
                else if (!_blockDs && !_thisDs) {
                    _isEqual = true;
                }
                else if (_blockDs && typeof _blockDs === 'object' && _thisDs && typeof _thisDs === 'object') {
                    _isEqual = true;
                    util.lang.objForIn(_blockDs, function (blockInfo, blockKey) {
                        if (blockInfo != _thisDs[name]) {
                            _isEqual = false;
                            return false;
                        }
                    });
                    util.lang.objForIn(_thisDs, function (blockInfo, blockKey) {
                        if (blockInfo != _blockDs[name]) {
                            _isEqual = false;
                            return false;
                        }
                    });
                }
            }
            return _isEqual;
        };
        Block.prototype.destroy = function () {
            var defered = win.wow.promise.defer();
            this.rendered = false;
            this.dsReady = false;
            return defered.promise;
        };
        Block.prototype.setDepsBlocks = function (depsBlocks) {
            this.depsBlocks = depsBlocks;
        };
        Block.prototype.setNextBlocks = function (nextBlocks) {
            this.nextBlocks = nextBlocks;
        };
        Block.prototype.setChildrenBlocks = function (childrenBlocks) {
            this.childrenBlocks = childrenBlocks;
        };
        Block.prototype.setRendered = function (rendered) {
            this.rendered = rendered;
        };
        Block.prototype.mergeOtherBlock = function (block) {
            if (this.name !== block.getName()) {
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
        };
        Block.prototype.getName = function () {
            return this.name;
        };
        Block.prototype.getSelector = function () {
            return this.selector;
        };
        Block.prototype.getSync = function () {
            return this.sync;
        };
        Block.prototype.getTpl = function () {
            return this.tpl;
        };
        Block.prototype.getDs = function () {
            return this.ds;
        };
        Block.prototype.getDt = function () {
            return this.dt;
        };
        Block.prototype.getCss = function () {
            return this.css;
        };
        Block.prototype.getStartHandlers = function () {
            return this.startHandlers;
        };
        Block.prototype.getReadyHandlers = function () {
            return this.readyHandlers;
        };
        Block.prototype.getUsableHandlers = function () {
            return this.usableHandlers;
        };
        Block.prototype.getChildrenBlocks = function () {
            return this.childrenBlocks;
        };
        Block.prototype.getDepsBlocks = function () {
            return this.depsBlocks;
        };
        Block.prototype.getNextBlocks = function () {
            return this.nextBlocks;
        };
        Block.prototype.getConteiner = function () {
            return this.container;
        };
        Block.prototype.isRendered = function () {
            return this.rendered;
        };
        return Block;
    })();
    return Block;
});
