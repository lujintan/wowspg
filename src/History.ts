/**
 * Created by lujintan on 11/26/14.
 */

/**
 * The site's history information
 */
class History{
    //history id(history's primary key)
    private _id: string;
    //page data
    private data: Object;
    //page title
    private title: string;
    //page url
    private url: string;

    constructor(_id: string, url: string, title: string, data: Object){
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
    public addBlockData(name: string, data: Object): void {
        this.data[name] = data;
    }


    public getId(): string{
        return this._id;
    }
    public getData(): Object{
        return this.data;
    }
    public getTitle(): string{
        return this.title;
    }
    public getUrl(): string{
        return this.url;
    }
}

export = History;