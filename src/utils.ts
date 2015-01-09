declare var require;

import decl = require('./declare');

var win: any = decl.win;

export module lang {
    /**
     * add event listener to a dom
     * @param elem
     * @param type
     * @param evenHandle
     */
    export function addEventListener(elem: any, type: string, evenHandle: any): void{
        if (elem.addEventListener) {
            elem.addEventListener(type, evenHandle, false);
        } else if (elem.attachEvent) {
            elem.attachEvent('on' + type, evenHandle);
        }
    }

    /**
     * prevent the default action
     * @param even
     */
    export function eventPreventDefault(even: any){
        if (even && even.preventDefault){
            even.preventDefault();
        }
        else{
            window.event.returnValue = false;
        }
    }

    /**
     * array for each
     * @param arr
     * @param callback
     */
    export function arrayForEach(arr: any[], callback: Function){
        for (var i = 0, len = arr.length ; i < len ; i++){
            if (callback(arr[i], i) === false) {
                break;
            }
        }
    }

    /**
     * object for in
     * @param obj
     * @param callback
     */
    export function objForIn(obj: any, callback: Function){
        for (var key in obj){
            if (obj.hasOwnProperty(key)){
                if (callback(obj[key], key) === false) {
                    break;
                }
            }
        }
    }

    /**
     * an empty function
     */
    export function fnEmpty(): void{}

    /**
     * an empty function which return a Promise
     * @returns {Promise}
     */
    export function fnThenEmpty(): any{
        var deferred: any = win.wow.promise.defer();
        deferred.resolve();
        return deferred.promise;
    }

    /**
     * json parse
     * @param data
     * @returns {*}
     */
    export function parseJson(data): Object{
        if(!data || typeof data !== 'string'){
            return null;
        }

        if (win.JSON && win.JSON.parse ) {
            return win.JSON.parse(data);
        }
        if ( /^[\],:{}\s]*$/.test( data.replace( /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g , "@" )
                .replace( /"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g, ']')
                .replace( /(?:^|:|,)(?:\s*\[)+/g, ''))) {

            return ( new Function( 'return ' + data ) )();
        }
        throw new Error( "Invalid JSON: " + data );

        return ;
    }

    /**
     * extend a object's properties by anther
     * @param objs
     * @returns {Object}
     */
    export function objExtend(...objs: any[]): any{
        var toObj: Object = {};

        arrayForEach(objs, function(obj){
            if (typeof obj === 'object') {
                objForIn(obj, function(item, key){
                    toObj[key] = item;
                });
            }
        });

        return toObj;
    }

    /**
     * _require resource from server
     * @param modules
     * @returns {Promise}
     * @private
     */
    export function _require(modules: any[]): any{
        var defered = win.wow.promise.defer();
        require(modules, function(...mods: any[]) {
            defered.resolve(mods);
        }, function(err) {
            defered.reject(err);
        });
        return defered.promise;
    }

    /**
     * generate a random id
     * @param prevStr
     * @returns {string}
     */
    export function generateRandomId(prevStr: string = ''){
        return 'wowId' + prevStr + new Date().getTime();
    }

    /**
     * path join
     * @param base
     * @param rel
     */
    export function mergePath(base: string, rel: string): string{
        var baseInfo: string[] = base.split('?');
        var relInfo: string[] = rel.split('?');
        var base: string = baseInfo[0].replace(/\/$/, '');
        var baseParam: string = baseInfo[1];
        if (!baseParam){
            baseParam = '';
        } else {
            baseParam = '?' + baseParam;
        }

        var rel: string = relInfo[0];
        var relParam: string = relInfo[1];
        if (relParam){
            baseParam = '?' + relParam;
        }

        if (/^\.\./.test(rel)) {
            base += '/';
        }


        if (rel[0] === '#'){
            return rel;
        }

        var base_path: string[] = base.split(/\/+/);
        var rel_path: string[]  = rel.split(/\/+/);

        if(base_path[base_path.length-1] === '..'){
            base_path.push('');
        }

        var i: number;
        while ((i = base_path.indexOf('..')) + 1){
            base_path = base_path.slice(i - 1, 2);
        }
        if (!base_path.length){
            base_path = [''];
        } else {
            base_path.pop();
        }

        if (rel_path[rel_path.length-1] === '.' || rel_path[rel_path.length-1] === '..'){
            rel_path.push('');
        }

        var old_rel_path: string[] = rel_path;
        rel_path = [];
        for(var i=0,l=old_rel_path.length;i<l;i++){
            if(old_rel_path[i]!='.'){
                rel_path.push(old_rel_path[i]);
            }
        }

        var tmp: string[] = [];
        for(var i=0,l=rel_path.length;i<l;i++){
            var x: string = rel_path[i];
            if ( x == '..' && !(tmp.length == 0 || tmp[tmp.length-1]=='..')){
                tmp.pop();
            } else{
                tmp.push(x);
            }
        }

        var add_trailer_slash: boolean = true;
        var x: string;
        while (x = tmp.shift()){
            if (x === '..' && base_path.length > 1){
                base_path.pop();
            }else{
                base_path.push(x);

                for(var i: number = 0, l: number = tmp.length ; i < l ; i++){
                    var t: string = tmp[i];
                    base_path.push(t);
                }

                add_trailer_slash = false;
                break;
            }
        }

        if (add_trailer_slash){
            base_path.push('');
        }

        return base_path.join('/') + baseParam;
    }
}

export module cus {
    /**
     * get the render url
     * @param href
     * @param baseUrl
     * @returns {string}
     */
    export function getRenderUrl(href: string, baseUrl: string): any{
        var _renderUrl: string;
        if (href.indexOf(baseUrl) > -1) {
            _renderUrl = href.replace(baseUrl, '');
        } else if (!/^(http|https|ftp):\/\//.test(href) && !/^#/.test(href) &&
            !/javascript:/.test(href)) {
            _renderUrl = href;
        }

        if (!/^\//.test(_renderUrl) && typeof _renderUrl !== 'undefined' ){
            var base: string = getRenderUrl(location.href, baseUrl);
            _renderUrl = lang.mergePath(base, _renderUrl);
        }
        return _renderUrl;
    }

    /**
     * get real regexp by the router key
     * @param regStr
     * @returns {RegExp}
     */
    export function getRenderReg(regStr: string): RegExp{
        var reg = new RegExp(regStr),
            keys: string[] = [];
        if (regStr === '/') {
            reg = /^\/(\?[^#]*)?$/;
        } else {
            var regString = '';
            if (/^\//.test(regStr)) {
                regString = '^' + regString;
            }
            if (/\/$/.test(regStr)) {
                regString += regStr.replace(/\/$/,
                    '/?(\\?[^#]*)?$');
            } else {
                regString += regStr;
            }
            regString = regString.replace(/\(:([^\)]+)\)/g,
                function(str, key) {
                    keys.push(key);
                    return '([^\\)/?#]+)';
                });
            reg = new RegExp(regString);
        }
        return reg;
    }

    /**
     * get url params
     * @param url
     * @returns {*}
     */
    export function getUrlParams(url: string): Object{
        if (!/\?/.test(url)) {
            return {};
        }
        var url: string = url.replace(/[^?]*\?/, ''),
            queries: string[] = url.split('&'),
            params: Object = {};

        lang.arrayForEach(queries, function(query, i){
            var keyVal: string[] = query.split('=');
            if (keyVal.length === 2) {
                params[keyVal[0]] = keyVal[1];
            }
        })

        return params;
    }
}

/**
 * some flags for
 */
export module flag {
    /**
     * detect weather the browser support the history api
     * @type {boolean}
     */
    export var supportHistory: boolean = !!history.pushState;

}