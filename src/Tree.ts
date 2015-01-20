/**
 * Created by lujintan on 11/27/14.
 */
import util = require('./utils');
import TreeNode = require('./TreeNode');
import decl = require('./declare');

var win: any = decl.win;
/**
 * A tree structure
 */
class Tree{
    private rootNode: TreeNode;

    constructor(rootNode: TreeNode){
        this.rootNode = rootNode;
    }

    private dfTraversalNode(node: TreeNode, callback: Function): any{
        var deferred = win.wow.promise.defer(),
            execResult: any = callback(node),
            _this: Tree = this;

        if (execResult === false){
            //stop traversal
            deferred.resolve();
        }
        else if (execResult === true){
            //continue
            deferred.resolve();
        }
        else{
            var fnThen: any = execResult;
            if (!fnThen.then){
                fnThen = util.lang.fnThenEmpty();
            }

            fnThen.then(function(){
                var childrenNodes: any[] = node.getChildrenNods();

                var nodeLen: number = childrenNodes.length;
                if (!childrenNodes || !nodeLen){
                    //do not have any children
                    deferred.resolve();
                }
                else{
                    var compLen: number = 1;
                    util.lang.arrayForEach(childrenNodes, function(childNode, index){
                        _this.dfTraversalNode(childNode, callback).then(function(){
                            if (++compLen > nodeLen){
                                //children nodes are all done
                                deferred.resolve();
                            }
                        });
                    });
                }
            });
        }

        return deferred.promise;
    }

    public traversal(callback: Function): any{
        return this.dfTraversalNode(this.rootNode, callback);
    }
}

export = Tree;