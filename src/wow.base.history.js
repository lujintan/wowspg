/**
 * 历史操作相关api
 */
wow.history = (function() {
    var _isSupportHistory = !!history.pushState,
        _list = {},
        _currentId = null,
        _currentObj = {},
        _nullFun = function() {};

    /**
     * 通过history id 获取历史信息
     */
    var _getInfo = function(_id) {
        if (!_id) {
            return {};
        }
        if (_list[_id]) {
            return _list[_id];
        }
        return {};
    };

    /**
     * 获取当前历史信息
     */
    var _getCurrentInfo = function() {
        return _getInfo(_currentId);
    }

    /**
     * 添加历史记录
     */
    var _push = function(data, title, url) {
        if (!_currentId) {
            _replace(data, title, url);
            return;
        }
        var _id = new Date()
            .getTime(),
            url = url.replace(/#/g, '');

        _list[_id] = {
            title: title || document.title,
            url: url,
            data: data
        };

        _currentId = _id;

        var pushUrl = wow.config.isRenderHash ? '#' + url : url;
        if (pushUrl == '#/') {
            pushUrl = '#';
        }

        history.pushState({
            _id: _id
        }, title, pushUrl);
        _currentId = _id;
    };

    /**
     * 替换当前历史记录
     */
    var _replace = function(data, title, url) {
        if (!_currentId) {
            _currentId = new Date()
                .getTime();
        }
        var url = url.replace(/#/g, '');

        _list[_currentId] = {
            title: title || document.title,
            url: url,
            data: data
        };

        var pushUrl = wow.config.isRenderHash ? '#' + url : url;
        if (pushUrl == '#/') {
            pushUrl = '#';
        }
        history.replaceState({
            _id: _currentId
        }, title, pushUrl);
    };

    var _setCurrentId = function(_id) {
        _currentId = _id;
    };

    /**
     * hash 追加历史记录
     */
    var _hashPush = function(data, title, url) {
        _currentObj = {
            title: title || document.title,
            url: url,
            data: data
        };
        var hash = url.replace(/#/g, '');
        if (hash == '/') {
            hash = '';
        }
        // location.hash = hash;
    };

    var _hashReplace = function() {};

    var _hashGetInfo = function() {
        return {};
    };

    var _hashGetCurrentInfo = function() {
        return _currentObj;
    };

    var _hashSetCurrentObj = function(obj) {
        _currentObj = obj;
    };

    if (_isSupportHistory) {
        return {
            setCurrentId: _setCurrentId,
            push: _push,
            replace: _replace,
            getInfo: _getInfo,
            getCurrentInfo: _getCurrentInfo
        };
    } else {
        return {
            setCurrentObj: _hashSetCurrentObj,
            push: _hashPush,
            replace: _hashReplace,
            getInfo: _hashGetInfo,
            getCurrentInfo: _hashGetCurrentInfo
        }
    }
})();
