/**
 * Created by lujintan on 11/26/14.
 */
import util = require('./utils');

/**
 * Enumerate error's code
 */
export enum ErrorType{
    CONFIG_ERROR = 101,
    ROUTER_MATCHING_STOPPED = 102,
    TIMEOUT_ERROR = 202,
    BLOCK_ERROR = 303,
    BLOCK_SELECTOR_IS_EMPTY = 310,
    BLOCK_DEPENDS_BLOCK_NOT_READY = 311,
    BLOCK_CONTAINER_NOT_EXIST = 311,
    PAGE_NOT_FOUND = 404,
    RUNTIME_ERROR = 505,
    RUNTIME_ERROR_RESOURCE_UNREADY = 506,
    RESOURCE_LOAD_ERROR = 606,
    RESOURCE_DATASOURCE_LOAD_FAIL = 610
}

/**
 * Describe the Error information
 */
export class ErrorInfo{
    private code: number;   //error code
    private message: string;    //error description

    constructor(code: number, message: string){
        this.code = code;
        this.message = message;
    }

    public getCode(): number{
        return this.code;
    }

    public getMessage(): string{
        return this.message;
    }
}

/**
 * An Error Controller to throw errors and maintain the default error list
 */
export class ErrorController{

    /**
     * Error List, contains error's describe and error's code
     * @type {any[]}
     */
    private static ErrorList: ErrorInfo[] = [
        new ErrorInfo(ErrorType.CONFIG_ERROR,                       'Config is error!'),
        new ErrorInfo(ErrorType.ROUTER_MATCHING_STOPPED,            'Router matching has stopped!'),
        new ErrorInfo(ErrorType.TIMEOUT_ERROR,                      'Page load timeout!'),
        new ErrorInfo(ErrorType.BLOCK_ERROR,                        'Block render error!'),
        new ErrorInfo(ErrorType.BLOCK_SELECTOR_IS_EMPTY,            'Block\'s selector is empty!'),
        new ErrorInfo(ErrorType.BLOCK_DEPENDS_BLOCK_NOT_READY,      'The blocks depend on is not rendered!'),
        new ErrorInfo(ErrorType.BLOCK_CONTAINER_NOT_EXIST,          'The block\'s container is not exist!'),
        new ErrorInfo(ErrorType.PAGE_NOT_FOUND,                     'Page is not found!'),
        new ErrorInfo(ErrorType.RUNTIME_ERROR,                      'Error found in page code!'),
        new ErrorInfo(ErrorType.RUNTIME_ERROR_RESOURCE_UNREADY,     'Data source or first loaded resources unready!'),
        new ErrorInfo(ErrorType.RESOURCE_LOAD_ERROR,                'Resouce load unsuccessful!'),
        new ErrorInfo(ErrorType.RESOURCE_DATASOURCE_LOAD_FAIL,      'Data source load unsuccessful!')
    ];

    /**
     * get error by error's type
     * @param err
     * @returns {ErrorInfo}
     */
    public static getError(err: ErrorType): ErrorInfo{
        var errorInfo: ErrorInfo;
        util.lang.arrayForEach(this.ErrorList, function(item, index){
            if (item.code === err){
                errorInfo = item;
                return false;
            }
        });
        return errorInfo;
    }

    /**
     * Throw a error which contains the error's message
     * @param err error's type
     */
    public static trigger(err: ErrorType): void{
        util.lang.arrayForEach(this.ErrorList, function(item, index){
            if (item.code === err){
                throw new Error(item.message);
                return false;
            }
        });
    }
}