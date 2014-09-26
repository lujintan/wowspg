/**
 * 获取路由相关
 */
wow.router = (function() {
    var _conf = null;
    var _getConf = function(conf) {
        var confList = conf,
            len = 0;
        for (var rKey in conf) {
            if (conf.hasOwnProperty(rKey)) {
                var rItem = conf[rKey];
                if (rItem && (rItem.block || rItem.router)) {
                    len++;
                }
            }
        }
        if (len) {
            return confList;
        } else {
            return false;
        }
    };

    /**
     * 通过url找到对应路由信息
     */
    var _map = function(url, conf) {
        var df = $.Deferred(),
            routerConfig = conf ? _getConf(conf) : _conf,
            routerInfo = null,
            params = {},
            keys = [],
            renderObj = {},
            url = url;

        for (var rItem in routerConfig) {
            if (routerConfig.hasOwnProperty(rItem)) {
                var reg = new RegExp(rItem);
                if (rItem == '/') {
                    reg = /^\/(\?[^#]*)?$/;
                } else {
                    var regString = '';
                    if (/^\//.test(rItem)) {
                        regString = '^' + regString;
                    }
                    if (/\/$/.test(rItem)) {
                        regString += rItem.replace(/\/$/,
                            '/?(\\?[^#]*)?$');
                    } else {
                        regString += rItem;
                    }
                    regString = regString.replace(/\(:([^\)]+)\)/g,
                        function(str, key) {
                            keys.push(key);
                            return '([^\\)/?#]+)';
                        });
                    reg = new RegExp(regString);
                }
                var regResult = reg.exec(url);
                if (regResult && typeof regResult[0] != 'undefined') {
                    for (var i = 0, len = keys.length; i < len; i++) {
                        params[keys[i]] = regResult[i + 1];
                    }

                    routerInfo = {
                        conf: routerConfig[rItem]
                    };
                }
            }
        }

        if (routerInfo) {
            var childRouter = routerInfo.conf.router;
            if (childRouter) {

                if (typeof childRouter == 'string') {
                    require([childRouter], function(childRouterConf) {
                        _map(url, childRouterConf)
                            .done(function(childRouterInfo,
                                childParams) {
                                routerInfo.router =
                                    childRouterInfo;
                                params = $.extend(params,
                                    childParams);
                                df.resolve(routerInfo, params);
                            })
                            .fail(function(info) {
                                df.reject(info);
                            });
                    });
                } else {
                    _map(url, childRouter)
                        .done(function(childRouterInfo, childParams) {
                            routerInfo.router = childRouterInfo;
                            params = $.extend(params, childParams);
                            df.resolve(routerInfo, params);
                        })
                        .fail(function(info) {
                            df.reject(info);
                        });
                }
            } else {
                df.resolve(routerInfo, params);
            }
        } else {
            df.reject({
                code: 404,
                msg: 'Url not found!'
            });
        }

        return df.promise();
    };

    /**
     * 通过url获取参数信息
     */
    var getSerchParams = function(url) {
        if (!/\?/.test(url)) {
            return {};
        }
        var url = url.replace(/[^?]*\?/, ''),
            querys = url.split('&'),
            params = {};
        for (var i = 0, len = querys.length; i < len; i++) {
            var query = querys[i],
                keyVal = query.split('=');
            if (keyVal.length == 2) {
                params[keyVal[0]] = keyVal[1];
            }
        }
        return params;
    };

    /**
     * 通过map得到的路由，找到需要rende的block信息
     */
    var _getRenderTree = function(url, conf) {
        var url = /^\//.test(url) ? url : '/' + url;

        return _map(url, conf)
            .then(function(routerMap, params) {
                var roots = [],
                    renderBlocks = {},
                    flagRoot = true,
                    renPars = $.extend(params, getSerchParams(
                        url));

                var _rendRouterConf = function(routerMap) {
                    if (routerMap.conf && routerMap.conf.block) {
                        var blocks = routerMap.conf.block;
                        for (var name in blocks) {
                            if (blocks.hasOwnProperty(name)) {
                                if (name != 'ds' &&
                                    name != 'dt' &&
                                    name != 'handler') {

                                    var block = blocks[name];

                                    renderBlocks[name] =
                                        renderBlocks[name] || {};
                                    renderBlocks[name].ds =
                                        block.ds || blocks.ds;
                                    renderBlocks[name].title =
                                        block.title || blocks.title;

                                    if (renderBlocks[name].ds &&
                                        typeof renderBlocks[
                                            name].ds ==
                                        'string') {
                                        renderBlocks[name].ds =
                                            renderBlocks[name].ds
                                            .
                                        replace(
                                            /\{([^\{\}]+)\}/g,
                                            function(str, key) {
                                                var keyVal =
                                                    key.split(
                                                        '|'),
                                                    myKey =
                                                    keyVal[0],
                                                    myVal =
                                                    keyVal[1],
                                                    reVal =
                                                    renPars[
                                                        myKey] ||
                                                    myVal || '';
                                                if (!reVal) {
                                                    reVal = wow
                                                        .data(
                                                            myKey,
                                                            'g'
                                                    ) || '';
                                                }
                                                return reVal;
                                            });
                                    }

                                    renderBlocks[name].dt =
                                        block.dt || blocks.dt;
                                    renderBlocks[name].handler =
                                        block.handler || blocks
                                        .handler;
                                    renderBlocks[name].css =
                                        block.css || blocks.css;
                                    renderBlocks[name].deps =
                                        renderBlocks[name].deps ||
                                        block.deps;
                                    renderBlocks[name].selector =
                                        renderBlocks[name].selector ||
                                        block.selector;
                                    renderBlocks[name].tpl =
                                        typeof block.tpl ==
                                        'undefined' ?
                                        renderBlocks[name].tpl :
                                        block.tpl;
                                    renderBlocks[name].fillType =
                                        block.fillType ||
                                        'fill';
                                    renderBlocks[name].option =
                                        renderBlocks[name].option || {};
                                    if (block.option) {
                                        renderBlocks[name].option =
                                            $.extend(
                                                renderBlocks[
                                                    name].option,
                                                block.option);
                                    }
                                    if (block.deps) {
                                        var deps = [].concat(
                                            block.deps);

                                        for (var i = 0, len =
                                                deps.length; i <
                                            len; i++) {
                                            var dep = deps[i];
                                            if (!blocks.hasOwnProperty(
                                                dep)) {
                                                continue;
                                            }
                                            renderBlocks[dep] =
                                                renderBlocks[
                                                    dep] || {};
                                            renderBlocks[dep].follows =
                                                renderBlocks[
                                                    dep].follows || [];
                                            renderBlocks[dep].follows
                                                .push(name);
                                        }
                                    } else {
                                        if (flagRoot) {
                                            roots.push(name);
                                        }
                                    }

                                    var childBlocks = block.block;
                                    if (childBlocks) {
                                        for (var childName in
                                            childBlocks) {
                                            if (childBlocks.hasOwnProperty(
                                                childName)) {
                                                var childBlock =
                                                    childBlocks[
                                                        childName
                                                    ];
                                                if (childBlocks
                                                    .hasOwnProperty(
                                                        childName
                                                    )) {
                                                    renderBlocks[
                                                        childName
                                                    ] =
                                                        renderBlocks[
                                                            childName
                                                    ] || {};
                                                    renderBlocks[
                                                        childName
                                                    ].selector =
                                                        renderBlocks[
                                                            childName
                                                    ].selector ||
                                                        childBlock
                                                        .selector;
                                                    renderBlocks[
                                                        name].follows =
                                                        renderBlocks[
                                                            name
                                                    ].follows || [];
                                                    renderBlocks[
                                                        name].follows
                                                        .
                                                    push(
                                                        childName
                                                    );
                                                    renderBlocks[
                                                        name].children =
                                                        renderBlocks[
                                                            name
                                                    ].children || [];
                                                    renderBlocks[
                                                        name].children
                                                        .
                                                    push(
                                                        childName
                                                    );
                                                }
                                            }
                                        }

                                    }
                                }
                            }
                        }
                        flagRoot = false;
                    }

                    if (routerMap.router) {
                        _rendRouterConf(routerMap.router);
                    }
                };

                _rendRouterConf(routerMap);

                return {
                    root: roots,
                    tree: renderBlocks,
                    params: renPars
                };
            });
    }

    var _init = function(conf) {
        var df = $.Deferred();
        _conf = _getConf(conf);

        if (_conf) {
            df.resolve(_conf);
        } else {
            df.reject({
                code: 1001,
                msg: 'Router\'s config does not have any correct item!'
            });
        }
        return df.promise();
    };
    return {
        init: _init,
        map: _map,
        getRenderTree: _getRenderTree,
        config: _conf
    };
}());
