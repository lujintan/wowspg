/**
 * Created by lujintan on 12/1/14.
 */

import util = require('./utils');
import decl = require('./declare');

var win: any = decl.win;

/**
 * Ajax Creator
 */
class Ajax{
    private url: string;    //the data source's url
    private sendTime: number;   //the time of request sending
    private xhr: any;   //xhr object

    constructor(url: string){
        this.url = url;
    }

    /**
     * get XMLHttpRequest Object
     * @returns {any}
     */
    private getXhr(): any{
        if (this.xhr){
            return this.xhr;
        }
        try {
            if (win.ActiveXObject){
                return this.xhr = new win.ActiveXObject('Microsoft.XMLHTTP');
            } else {
                return this.xhr = new win.XMLHttpRequest();
            }
        } catch(e){}
    }

    /**
     * the base callback of the ajax
     * @returns {Promise}
     */
    private callback(): any {
        var defered: any = win.wow.promise.defer();

        if (DSGetter.cancelTime > this.sendTime){
            return defered.promise;
        }

        var xhr: any = this.xhr;
        try{
            if (xhr.readyState === 4) {
                var status: number = xhr.status,
                    text: string  = xhr.responseText;

                if (!status){
                    status = text ? 200 : 404;
                } else if (status === 1223){
                    status = 204;
                }

                if (status >= 200 && status < 300){
                    var data: Object = util.lang.parseJson(text);
                    defered.resolve(data);
                } else{
                    defered.reject(xhr);
                }
            }
            else{
                defered.reject(xhr);
            }
        } catch(e){
            defered.reject(xhr);
        }

        return defered.promise;
    }

    /**
     * send request
     * @returns {Promise}
     */
    public send(): any {
        var defered: any = win.wow.promise.defer(),
            _this = this,
            xhr = _this.getXhr(),
            callback = _this.callback;

        _this.sendTime = new Date().getTime();

        if (_this.sendTime < DSGetter.cancelTime){
            defered.reject();
            return defered.promise;
        }

        xhr.open('GET', _this.url, true);
        xhr.send();

        if (xhr.readyState === 4){
            setTimeout(function(){
                _this.callback().done(function(data){
                    defered.resolve(data);
                });
            } , 0);
        } else {
            xhr.onreadystatechange = function(){
                _this.callback().done(function(data){
                    defered.resolve(data);
                });
            };
        }
        return defered.promise;
    }
}

/**
 * To get data source from server
 * The default DSGetter is based on ajax
 */
class DSGetter{
    public static cancelTime: number = 0;   //last time of cancel request

    public static get(url: string): any {      //send request who's method is GET
        var ajax: Ajax = new Ajax(url);
        return ajax.send();
    }

    public static cancelAll(): void {       //stop sending all request
        DSGetter.cancelTime = new Date().getTime();
    }
}

export = DSGetter;