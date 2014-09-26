/**
 * 单页面点击监听
 */
wow.listener = (function() {
    var _isSupportPushstate = !!history.pushState;

    /**
     * 获取真实render的url
     * @params href 实际传入的url
     */
    var _getRenderUrl = function(href) {
        var _baseUrl = wow.config.baseUrl,
            _renderUrl = null;
        if (href.indexOf(_baseUrl) > -1) {
            _renderUrl = href.replace(_baseUrl, '');
        } else if (!/^(http|https|ftp):\/\//.test(href) && !/^#/.test(
            href) && !/javascript:/.test(href)) {
            _renderUrl = href;
        }
        return _renderUrl;
    };

    /**
     * 添加事件监听
     */
    var _addEventListener = function() {
        var router = wow.router.config;

        //添加a 链接的事件监听
        $(document)
            .on('click', 'a', function(e) {
                var $this = $(this),
                    attrTarget = $this.attr('target');
                if (attrTarget && attrTarget == '_blank') {
                    return;
                }

                var href = $this.attr('href');
                if (typeof href == 'undefined') {
                    return;
                }

                var renderUrl = _getRenderUrl(href),
                    title = $this.attr('title') || '';

                if (renderUrl !== null) {
                    e.preventDefault();
                    wow.render(renderUrl, router, {
                        title: title
                    })
                        .fail(function(errorInfo) {
                            if (errorInfo.code == 404) {
                                location.href = wow.config.baseUrl +
                                    renderUrl;
                            }
                        });
                }
            });
        if (_isSupportPushstate) {
            //当支持pushstate，绑定popstate事件
            $(window)
                .bind('popstate', function(e) {
                    var state = history.state;
                    if (!state || !state._id) {
                        return;
                    }
                    if (wow.history.setCurrentId) {
                        wow.history.setCurrentId(state._id);
                    }
                    var historyInfo = wow.history.getInfo(
                        state._id);

                    if (!historyInfo || !historyInfo.url || !
                        historyInfo.data) {
                        location.reload();
                    }

                    var renderUrl = _getRenderUrl(
                        historyInfo.url);

                    if (renderUrl !== null) {
                        wow.render(renderUrl, router, {
                            isInHistory: true
                        })
                            .fail(function(errorInfo) {
                                if (errorInfo.code == 404) {
                                    location.href = wow.config.baseUrl +
                                        renderUrl;
                                }
                            });
                    }
                });
        } else {
            //当不支持pushstate，绑定hashchange事件
            $(window)
                .bind('hashchange', function() {
                    wow.render(location.hash, router)
                        .done(function(o) {});
                });
        }

    };

    /**
     * 监听程序初始化
     */
    var _init = function() {
        var _renderType = wow.config.type;
        _addEventListener();
    };

    return {
        init: _init
    };
})();
