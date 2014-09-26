/**
 * 单页面应用初始化入口
 */
wow.init = function(conf, options) {
    if (!conf) {
        throw new Error('Wow.init need a router config');
    }
    var options = options || {},
        _isSupportPushstate = !!history.pushState,
        _type = options.type || 'all',
        _isRenderHash = !(_type != 'hash' && _isSupportPushstate),
        _baseUrl = typeof options.baseUrl == 'undefined' ?
        location.protocol + '//' + location.hostname +
        (location.port ? ':' + location.port : '') : options.baseUrl,
        _timeout = options.timeout || 30,
        _url = options.url,
        _isForbidHistory = options.forbidHistory,
        _commonHandler = options.handler || {};

    //初始化config
    wow.config = {
        type: _type,
        baseUrl: _baseUrl,
        isRenderHash: _isRenderHash,
        isForbidHistory: _isForbidHistory,
        timeout: _timeout,
        handler: {
            loading: _commonHandler.loading
        }
    };

    //初始化router
    wow.router.init(conf);
    var hash = location.hash.replace(/#/g, '');

    var _renderAsUrl = function() {
        var renderUrl = _url || location.href.replace(_baseUrl, '') || '/';
        return wow.render(
                renderUrl.replace(/^#|#.*/, ''), conf)
            .fail(function(errorInfo) {});
    };

    //当页面有hash的时候优先render hash
    if (hash && hash !== '' && hash != '#') {
        wow.render(_url || hash, conf)
            .done(function() {
                if (_isSupportPushstate && options.type != 'hash') {
                    location.hash = '';
                }
            })
            .fail(function() {
                _renderAsUrl();
            });
    } else {
        _renderAsUrl();
    }

    //初始化单页面监听，如果不需要单页面监听，这里关掉
    if (_isSupportPushstate &&
        location.href.indexOf('zhida.baidu.com') < 0 &&
        location.href.indexOf('/appworks') < 0) {
        wow.listener.init();
    }
};
