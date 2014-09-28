wow.go = function(href) {
    if (wow.config.isRenderHash) {
        location.href = href;
    } else {
        if (/^(http|https|ftp):\/\//.test(href) &&
            href.indexOf(_baseUrl) < 0) {
            location.href = href;
        } else {
            wow.render(href, wow.router.config);
        }
        var _baseUrl = wow.config.baseUrl || '';
    }
};