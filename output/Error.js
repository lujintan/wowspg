define(["require", "exports", './utils'], function (require, exports, util) {
    /**
     * Enumerate error's code
     */
    (function (ErrorType) {
        ErrorType[ErrorType["CONFIG_ERROR"] = 101] = "CONFIG_ERROR";
        ErrorType[ErrorType["ROUTER_MATCHING_STOPPED"] = 102] = "ROUTER_MATCHING_STOPPED";
        ErrorType[ErrorType["TIMEOUT_ERROR"] = 202] = "TIMEOUT_ERROR";
        ErrorType[ErrorType["BLOCK_ERROR"] = 303] = "BLOCK_ERROR";
        ErrorType[ErrorType["BLOCK_SELECTOR_IS_EMPTY"] = 310] = "BLOCK_SELECTOR_IS_EMPTY";
        ErrorType[ErrorType["BLOCK_DEPENDS_BLOCK_NOT_READY"] = 311] = "BLOCK_DEPENDS_BLOCK_NOT_READY";
        ErrorType[ErrorType["BLOCK_CONTAINER_NOT_EXIST"] = 311] = "BLOCK_CONTAINER_NOT_EXIST";
        ErrorType[ErrorType["PAGE_NOT_FOUND"] = 404] = "PAGE_NOT_FOUND";
        ErrorType[ErrorType["RUNTIME_ERROR"] = 505] = "RUNTIME_ERROR";
        ErrorType[ErrorType["RUNTIME_ERROR_RESOURCE_UNREADY"] = 506] = "RUNTIME_ERROR_RESOURCE_UNREADY";
        ErrorType[ErrorType["RESOURCE_LOAD_ERROR"] = 606] = "RESOURCE_LOAD_ERROR";
        ErrorType[ErrorType["RESOURCE_DATASOURCE_LOAD_FAIL"] = 610] = "RESOURCE_DATASOURCE_LOAD_FAIL";
    })(exports.ErrorType || (exports.ErrorType = {}));
    var ErrorType = exports.ErrorType;
    /**
     * Describe the Error information
     */
    var ErrorInfo = (function () {
        function ErrorInfo(code, message) {
            this.code = code;
            this.message = message;
        }
        ErrorInfo.prototype.getCode = function () {
            return this.code;
        };
        ErrorInfo.prototype.getMessage = function () {
            return this.message;
        };
        return ErrorInfo;
    })();
    exports.ErrorInfo = ErrorInfo;
    /**
     * An Error Controller to throw errors and maintain the default error list
     */
    var ErrorController = (function () {
        function ErrorController() {
        }
        /**
         * get error by error's type
         * @param err
         * @returns {ErrorInfo}
         */
        ErrorController.getError = function (err) {
            var errorInfo;
            util.lang.arrayForEach(this.ErrorList, function (item, index) {
                if (item.code === err) {
                    errorInfo = item;
                    return false;
                }
            });
            return errorInfo;
        };
        /**
         * Throw a error which contains the error's message
         * @param err error's type
         */
        ErrorController.trigger = function (err) {
            util.lang.arrayForEach(this.ErrorList, function (item, index) {
                if (item.code === err) {
                    throw new Error(item.message);
                    return false;
                }
            });
        };
        /**
         * Error List, contains error's describe and error's code
         * @type {any[]}
         */
        ErrorController.ErrorList = [
            new ErrorInfo(101 /* CONFIG_ERROR */, 'Config is error!'),
            new ErrorInfo(102 /* ROUTER_MATCHING_STOPPED */, 'Router matching has stopped!'),
            new ErrorInfo(202 /* TIMEOUT_ERROR */, 'Page load timeout!'),
            new ErrorInfo(303 /* BLOCK_ERROR */, 'Block render error!'),
            new ErrorInfo(310 /* BLOCK_SELECTOR_IS_EMPTY */, 'Block\'s selector is empty!'),
            new ErrorInfo(311 /* BLOCK_DEPENDS_BLOCK_NOT_READY */, 'The blocks depend on is not rendered!'),
            new ErrorInfo(311 /* BLOCK_CONTAINER_NOT_EXIST */, 'The block\'s container is not exist!'),
            new ErrorInfo(404 /* PAGE_NOT_FOUND */, 'Page is not found!'),
            new ErrorInfo(505 /* RUNTIME_ERROR */, 'Error found in page code!'),
            new ErrorInfo(506 /* RUNTIME_ERROR_RESOURCE_UNREADY */, 'Data source or first loaded resources unready!'),
            new ErrorInfo(606 /* RESOURCE_LOAD_ERROR */, 'Resouce load unsuccessful!'),
            new ErrorInfo(610 /* RESOURCE_DATASOURCE_LOAD_FAIL */, 'Data source load unsuccessful!')
        ];
        return ErrorController;
    })();
    exports.ErrorController = ErrorController;
});
