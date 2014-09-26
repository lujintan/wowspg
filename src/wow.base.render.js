/**
 * 页面render
 */
wow.render = (function() {
    var _renderedList = {},
        _isSupportPushstate = !!history.pushState,
        _currentUrl = '';

    /**
     * 判断某一节点是否已经rended
     */
    var _isRended = function(nodeName, nodeTpl, nodeDs) {
        if (_renderedList[nodeName] &&
            _renderedList[nodeName].tpl == nodeTpl) {
            var _renderDs = _renderedList[nodeName].ds;
            if (typeof nodeDs == 'string' && nodeDs == _renderDs) {
                return true;
            } else if (typeof nodeDs == 'object' && typeof _renderDs ==
                'object') {
                for (var name in nodeDs) {
                    if (nodeDs.hasOwnProperty(name)) {
                        if (_renderDs[name] != nodeDs[name]) {
                            return false;
                        }
                    }
                }

                for (var name in _renderDs) {
                    if (!nodeDs.hasOwnProperty(name)) {
                        return false;
                    }
                }
                return true;
            }

            if (!nodeDs && !_renderDs) {
                return true;
            }
        }
        return false;
    };
    /**
     * 记录rended状态
     */
    var _addRenderedList = function(nodeName, nodeTpl, ds, handler,
        children) {
        var chr = [];
        if (children && children.length) {
            for (var i = 0, len = children.length; i < len; i++) {
                chr.push(children[i]);
            }
        }
        _renderedList[nodeName] = {
            tpl: nodeTpl,
            handler: handler,
            ds: ds,
            children: chr
        };
    };

    //执行某一节点下的所有destroy方法
    var _execDestoryFn = function(renHandler) {
        if (renHandler) {
            var handlers = [];
            if (renHandler.start) {
                handlers = handlers.concat(renHandler.start);
            }
            if (renHandler.ready) {
                handlers = handlers.concat(renHandler.ready);
            }
            if (renHandler.usable) {
                handlers = handlers.concat(renHandler.usable);
            }
            for (var j = 0, lenJ = handlers.length; j <
                lenJ; j++) {
                if (handlers[j] && handlers[j].destroy) {
                    handlers[j].destroy();
                }
            }
        }
    };
    /**
     * 清空某一节点下地所有子节点rendered 状态
     */
    var _clearRendedChild = function(nodeName) {
        var node = _renderedList[nodeName];

        if (node && node.handler) {
            _execDestoryFn(node.handler);
        }

        if (node && node.children) {
            for (var i = 0, len = node.children.length; i < len; i++) {
                var child = node.children[i];
                if (_renderedList[child]) {
                    _clearRendedChild(child);
                }
            }
        }

        delete _renderedList[nodeName];
    };

    /**
     * 封装 requirejs
     * return promise
     */
    var _require = function(urls) {
        var df = $.Deferred();
        var urls = [].concat(urls);
        require(urls, function() {
            var modules = [];
            for (var i = 0, len = arguments.length; i < len; i++) {
                modules.push(arguments[i]);
            }
            df.resolve(modules);
        }, function(err) {
            df.reject(err);
        });
        return df.promise();
    };

    /**
     * dust render
     * return promise
     */
    var _dustRender = function(tplRender, data, handler) {
        var df = $.Deferred(),
            _renderData = $.extend({
                wow: {
                    url: _currentUrl,
                    title: document.title
                },
                location: location
            }, data);
        tplRender(_renderData, function(err, out) {
            if (err) {
                df.reject(err);
            } else {
                df.resolve(out, handler);
            }
        });
        return df.promise();
    };

    /**
     * loading render 渲染过渡页
     */
    var _loadingRender = function($wrap) {
        var df = $.Deferred();

        if (wow.config.handler.loading) {
            var promise = wow.config.handler.loading($wrap);
            if (promise && promise.done) {
                return promise;
            } else {
                df.resolve();
            }
        } else {
            df.resolve();
        }

        return df.promise();
    };

    /**
     * render root节点
     */
    var _render = function(nodeName, tree, opt) {
        var df = $.Deferred(),
            opt = opt || {},
            $par = opt.$parent || $(document),
            node = tree[nodeName],
            $wrapper = null,
            timerTimeout = timerTimeout || null,
            params = opt.params,
            blockData = opt.rd || {};

        if (!node.selector) {
            df.resolve(blockData);
            return df.promise();
        } else {
            $wrapper = $par.find(node.selector);
            if (!$wrapper || !$wrapper[0]) {
                df.resolve(blockData);
                return df.promise();
            }
        }
        //判断block是否依赖其他block
        if (node.deps) {
            for (var i = 0, len = node.deps.length; i < len; i++) {
                var depNodeName = node.deps[i],
                    depNode = tree[depNodeName];
                if (!_isRended(depNodeName, depNode.tpl, depNode.ds)) {
                    df.resolve(blockData);
                    return df.promise();
                }
            }
        }

        var flagFollowRenderNow = false;
        //已经render过的节点，不再进行render
        if (_isRended(nodeName, node.tpl, node.ds)) {
            flagFollowRenderNow = true;
        } else {
            if (node.tpl) {
                var requireList = [node.tpl],
                    flagDsReady = false,
                    flagHReady = false,
                    renderData = {},
                    eventName = 'wow.ds.dataready.' + new Date()
                    .getTime();

                //有历史记录，直接从历史记录中获取数据
                if (blockData[nodeName] || !node.ds) {
                    flagDsReady = true;
                    renderData = blockData[nodeName] || {};
                } else {
                    if (typeof node.ds == 'string') {
                        $.ajax({
                            cache: false,
                            dataType: 'json',
                            url: node.ds.replace(/\{([^\{\}]+)\}/g,
                                function(str, key) {
                                    return params[key] || '';
                                })
                        })
                            .then(function(data) {
                                flagDsReady = true;
                                renderData = data;

                                $(window)
                                    .trigger(eventName);
                            })
                            .fail(function(xhr, status, errorInfo) {
                                df.reject({
                                    code: 504,
                                    msg: 'Data source "' +
                                        node.ds +
                                        '" load error!',
                                    data: {
                                        block: node
                                    }
                                });
                                return df.promise();
                            });
                    } else {
                        flagDsReady = true;
                        renderData = node.ds;
                    }
                }

                if (node.dt) {
                    requireList.push(node.dt);
                }
                if (node.handler &&
                    node.handler.start &&
                    node.handler.start.length) {
                    requireList = requireList.concat(node.handler.start)
                }
                if (node.css) {
                    for (var i = 0, len = node.css.length; i < len; i++) {
                        requireList.push('css!' + node.css[i]);
                    }
                }
                var renderHandler = {};

                _clearRendedChild(nodeName);
                if (node.title && node.title != document.title) {
                    document.title = node.title;
                }
                _loadingRender($wrapper)
                    .done(function() {
                        //并行异步取页面数据 + start handler + tpl + dt + css
                        _require(requireList)
                            .then(function(modules) {
                                //render页面
                                var dfStart = new $.Deferred(),
                                    dt = null,
                                    hses = [],
                                    argIndex = 0,
                                    tplRender = modules[argIndex++];

                                if (node.dt) {
                                    dt = modules[argIndex++];
                                }
                                if (node.handler &&
                                    node.handler.start &&
                                    node.handler.start.length) {
                                    for (var len = modules.length; argIndex <
                                        len; argIndex++) {
                                        hses.push(modules[
                                            argIndex]);
                                    }
                                    renderHandler.start = hses;
                                }

                                flagHReady = true;
                                if (flagDsReady) {
                                    if (dt && typeof dt ==
                                        'function') {
                                        renderData = dt(
                                            renderData);
                                    }
                                    blockData[nodeName] =
                                        renderData;
                                    var renderParams = $.extend(
                                        renderData, node.option
                                    );
                                    renderParams.params =
                                        params;
                                    _dustRender(tplRender,
                                        renderParams,
                                        renderHandler)
                                        .then(function(out) {
                                            dfStart.resolve(
                                                out);
                                        })
                                        .fail(function() {
                                            var errorInfo = {
                                                code: 505,
                                                msg: 'Tpl "' +
                                                    node
                                                    .tpl +
                                                    '" renter error!',
                                                data: {
                                                    block: node
                                                }
                                            };
                                            df.reject(
                                                errorInfo);
                                            dfStart.reject(
                                                errorInfo);
                                        });
                                } else {
                                    $(window)
                                        .one(eventName,
                                            function() {
                                                if (dt &&
                                                    typeof dt ==
                                                    'function') {
                                                    renderData =
                                                        dt(
                                                            renderData
                                                    );
                                                }
                                                blockData[
                                                    nodeName] =
                                                    renderData;
                                                var renderParams =
                                                    $.extend(
                                                        renderData,
                                                        node.option
                                                    );
                                                renderParams.params =
                                                    params;
                                                _dustRender(
                                                    tplRender,
                                                    renderParams,
                                                    renderHandler
                                                )
                                                    .then(
                                                        function(
                                                            out
                                                        ) {

                                                            dfStart
                                                                .resolve(
                                                                    out
                                                            );
                                                        })
                                                    .fail(
                                                        function() {
                                                            var
                                                                errorInfo = {
                                                                    code: 505,
                                                                    msg: 'Tpl "' +
                                                                        node
                                                                        .tpl +
                                                                        '" renter error!',
                                                                    data: {
                                                                        block: node
                                                                    }
                                                                };
                                                            df.reject(
                                                                errorInfo
                                                            );
                                                            dfStart
                                                                .reject(
                                                                    errorInfo
                                                            );
                                                        });
                                            });
                                }
                                return dfStart.promise();
                            })
                            .then(function(out) {
                                df.resolve(blockData);
                                var hses = renderHandler.start;
                                //设置已render的list
                                _addRenderedList(nodeName, node
                                    .tpl, node.ds,
                                    renderHandler, node.children
                                );

                                switch (node.fillType) {
                                    case 'fill':
                                        $wrapper.html(out);
                                        break;
                                    case 'append':
                                        $wrapper.append(out);
                                        break;
                                    case 'prepend':
                                        $wrapper.prepend(out);
                                        break;
                                }
                                if (hses) {
                                    for (var i = 0, len = hses.length; i <
                                        len; i++) {
                                        var hs = hses[i];
                                        if (hs && hs.init) {
                                            hs.init($wrapper,
                                                renderData,
                                                params);
                                        }
                                    }
                                }

                                var dfRequireReady = null;
                                // 加载ready handler
                                if (node.handler &&
                                    node.handler.ready &&
                                    node.handler.ready.length) {
                                    dfRequireReady = _require(
                                        node.handler.ready)
                                        .then(function(modules) {
                                            renderHandler.ready =
                                                modules;
                                            for (var i = 0,
                                                    len =
                                                    modules
                                                    .length; i <
                                                len; i++) {
                                                var handler =
                                                    modules[
                                                        i]
                                                if (handler &&
                                                    handler
                                                    .init) {
                                                    handler
                                                        .init(
                                                            $wrapper,
                                                            renderData,
                                                            params
                                                    );
                                                }
                                            }
                                        });
                                }
                                //render 后续节点
                                if (node.follows) {
                                    var renderCount = 0;
                                    for (var i = 0, len = node.follows
                                            .length; i <
                                        len; i++) {
                                        var followNode = node.follows[
                                            i];
                                        if (tree[followNode]) {
                                            var $parent = null;
                                            if (tree.children &&
                                                $.inArray(
                                                    followNode,
                                                    tree.children
                                                ) > -1
                                            ) {
                                                $parent =
                                                    $wrapper;
                                            }

                                            _render(followNode,
                                                tree, {
                                                    $parent: $parent,
                                                    rd: blockData,
                                                    params: params
                                                })
                                                .then(function(
                                                    data) {
                                                    renderCount++;
                                                    if (
                                                        renderCount >=
                                                        node
                                                        .follows
                                                        .length
                                                    ) {
                                                        df.resolve(
                                                            blockData
                                                        );
                                                    }
                                                });
                                        }
                                    }
                                }
                                return dfRequireReady;
                            })
                            .then(function() {
                                df.resolve(blockData);
                                // 加载usable handler
                                if (node.handler &&
                                    node.handler.usable &&
                                    node.handler.usable.length) {
                                    return _require(node.handler
                                            .usable)
                                        .then(function(modules) {
                                            renderHandler.usable =
                                                modules;
                                            for (var i = 0,
                                                    len =
                                                    modules
                                                    .length; i <
                                                len; i++) {
                                                var handler =
                                                    modules[
                                                        i];
                                                if (handler &&
                                                    handler
                                                    .init) {
                                                    handler
                                                        .init(
                                                            $wrapper,
                                                            renderData,
                                                            params
                                                    );
                                                }
                                            }
                                        });
                                } else {
                                    return;
                                }
                            })
                            .fail(function(err) {
                                df.reject({
                                    code: 1002,
                                    msg: 'Resource load fail!',
                                    block: node
                                });
                            });
                    });
            } else {
                _addRenderedList(nodeName, node.tpl, node.ds, null,
                    node.children);
                flagFollowRenderNow = true;
            }
        }

        if (flagFollowRenderNow) {
            if (node.follows) {
                var renderCount = 0;
                for (var i = 0, len = node.follows.length; i < len; i++) {
                    var followNode = node.follows[i];
                    if (tree[followNode]) {
                        _render(followNode, tree, {
                            rd: blockData,
                            params: params
                        })
                            .then(function(data) {
                                renderCount++;
                                if (renderCount >= node.follows.length) {
                                    df.resolve(blockData);
                                }
                            });
                    }
                }
            } else {
                df.resolve(blockData);
            }
        }

        if (!timerTimeout) {
            timerTimeout = setTimeout(function() {
                df.reject({
                    code: 503,
                    msg: 'Render Time out!'
                });
            }, timerTimeout);
        }

        return df.promise();
    };

    return function(url, conf, opt) {
        var opt = opt || {};
        // 获取需要render的tree
        return wow.router.getRenderTree(url, conf)
            .then(function(renderInfo) {
                var roots = renderInfo.root,
                    tree = renderInfo.tree,
                    params = renderInfo.params,
                    renderData = {};

                if (!opt.isInHistory && !wow.config.isForbidHistory) {
                    wow.history.push(renderData,
                        opt.title,
                        url || '/');
                }
                $(window)
                    .trigger('wow.pagechange', wow.history.getCurrentInfo());
                _currentUrl = url;
                if (opt.title) {
                    document.title = opt.title;
                }
                if (opt.isInHistory) {
                    renderData = wow.history.getCurrentInfo();
                }
                for (var i = 0, len = roots.length; i < len; i++) {
                    var root = roots[i];
                    _render(root, tree, {
                        rd: renderData,
                        params: params
                    })
                        .then(function(data) {})
                        .fail(function(error) {
                            $(window)
                                .trigger('wow.loadfail', error);
                        });
                }
            });
    };
})();
