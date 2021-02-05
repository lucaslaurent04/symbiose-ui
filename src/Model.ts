import * as $ from "jquery";
import { ApiService } from "equal-services";
import { environment } from "environment";

export class Model {
    
    private objects:any;
    private entity:string;
    
    constructor(private entity:string) {
        this.entity = entity;
        this.objects = {};
        console.log(environment);
            console.log(ApiService);
    }


    public ids(ids?:[]) {
        if (ids !== undefined) {
            // init keys of 'objects' member (resulting in a map with no values)
            for (var i = 0, n = ids.length; i < n; i++) {
                this.objects[ids[i]] = {};
            }
            return this;
        }
        else {
            return Object.keys(this.objects);
        }
    }


/*
search: get a collection matching given criteria
create: 
read: get one object
update: 
delete: remove an object by its ID


*/

    public async search(domain:[], params:any, lang:string) {

        const schema = await ApiService.getSchema('core\\User');
        const view = await ApiService.getView('symbiose\\inventory\\asset\\Product', 'create');
        const translation = await ApiService.getTranslation('qinoa\\User', 'en');
        
        
        console.log(schema);
        console.log(view);
        console.log(translation);
        
    }
    
}

module.exports = Model;