/**
 * Created by lujintan on 11/26/14.
 */
define(["require", "exports"], function (require, exports) {
    /**
     * The site's history information
     */
    var History = (function () {
        function History(_id, url, title, data) {
            this._id = _id;
            this.url = url;
            this.title = title;
            this.data = data;
        }
        /**
         * add block's data to
         * @param name
         * @param data
         */
        History.prototype.addBlockData = function (name, data) {
            this.data[name] = data;
        };
        History.prototype.getId = function () {
            return this._id;
        };
        History.prototype.getData = function () {
            return this.data;
        };
        History.prototype.getTitle = function () {
            return this.title;
        };
        History.prototype.getUrl = function () {
            return this.url;
        };
        return History;
    })();
    return History;
});
