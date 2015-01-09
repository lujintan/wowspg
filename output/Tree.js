define(["require", "exports", './utils', './declare'], function (require, exports, util, decl) {
    var win = decl.win;
    /**
     * A tree structure
     */
    var Tree = (function () {
        function Tree(rootNode) {
            this.rootNode = rootNode;
        }
        Tree.prototype.dfTraversalNode = function (node, callback) {
            var deferred = win.wow.promise.defer(), execResult = callback(node), _this = this;
            if (execResult === false) {
                //stop traversal
                deferred.resolve();
            }
            else if (execResult === true) {
                //continue
                deferred.resolve();
            }
            else {
                var fnThen = execResult;
                if (!fnThen.then) {
                    fnThen = util.lang.fnThenEmpty();
                }
                fnThen.then(function () {
                    var childrenNodes = node.getChildrenNods();
                    var nodeLen = childrenNodes.length;
                    if (!childrenNodes || !nodeLen) {
                        //do not have any children
                        deferred.resolve();
                    }
                    else {
                        var compLen = 1;
                        util.lang.arrayForEach(childrenNodes, function (childNode, index) {
                            _this.dfTraversalNode(childNode, callback).done(function () {
                                if (++compLen > nodeLen) {
                                    //children nodes are all done
                                    deferred.resolve();
                                }
                            });
                        });
                    }
                });
            }
            return deferred.promise;
        };
        Tree.prototype.traversal = function (callback) {
            return this.dfTraversalNode(this.rootNode, callback);
        };
        return Tree;
    })();
    return Tree;
});
