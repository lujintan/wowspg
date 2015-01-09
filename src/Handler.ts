/**
 * Created by lujintan on 11/26/14.
 */

/**
 * Describe a handler
 */
interface Handler{
    /**
     * Will execute when block render
     * @param elem the container of the block
     * @param data : {
     *          data        //data which is used to render block
     *          urlKeys     //matched from router "(:xxx)"
     *          params      //the url parameter
     *          location    //the Window's location object
     *          title       //the page's title
     *      }
     */
    init(elem: Element, data: Object): void;

    /**
     * Will execute when page re-render
     * @param elem
     * @param data
     */
    repaint(elem: Element, data: Object): void;

    /**
     * Will execute when page destroy
     * @param elem
     * @param data
     */
    destroy(elem: Element, data: Object): void;
}
export = Handler;
