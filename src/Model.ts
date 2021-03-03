import { $ } from "./jquery-lib";
import { ApiService } from "./equal-services";

import View from "./View";
import Layout from "./Layout";

/**
 * Class for Model intercations
 * Acts like server-side Collection.class.php
 */
export class Model {

    private view: View;
    
    // Collection (map) of objects: objects ids mapping related objects
    private objects: any;


    // total objects matching the current domain on the back-end
    private total: number;

    private loaded_promise: any;
    private has_changed: boolean;
    
    // Collecitons do not deal with lang: it is used in ApiService set in the environment var
    
    constructor(view:View) {
        this.view = view;

        this.loaded_promise = $.Deferred();
        this.has_changed = false;
        
        this.objects = {};
        this.total = 0;
    }
    

    public async init() {
        
        try {            
            this.refresh();
        }
        catch(err) {
            console.log('something went wrong ', err);
        }        
        
    }
        
    public hasChanged() {
        return this.has_changed;
    }

    /** 
     * Update model by requesting data from server using parent View parameters
    */
    public async refresh() {
        console.log('Model::refresh');

        // fetch fields that are present in the parent View 
        let fields: [] = <[]>Object.keys(this.view.getViewFields());

        try {
            console.log(this.view.getDomain());
            this.objects = await ApiService.collect(this.view.getEntity(), this.view.getDomain(), fields, this.view.getOrder(), this.view.getSort(), this.view.getStart(), this.view.getLimit(), this.view.getLang());
            
            this.loaded_promise.resolve();
            this.total = ApiService.getLastCount();

            console.log(this.objects);
            // trigger model change handler in the parent View (in order to update the layout)
            this.view.onchangeModel();
        }
        catch(err) {
            console.log('Unable to fetch Collection from server', err);
        }        
        
    }
    
    /**
     * React to external request of Model change (one ore more objects in the collection have been updated through the Layout)
     */
    public change(ids: Array<any>, values: any) {
        for (let id of ids) {
            if(this.objects.hasOwnProperty(id)) {
                for (let field in values) {                    
                    if(this.objects[id].hasOwnProperty(field)) {
                        this.objects[id][field] = values[field];
                        this.has_changed = true;
                    }
                }
            }
        }
    }
    
    public ids() {
        return this.objects.map( (object:any) => object['id']);
    }

    /**
     * Return the entire Collection
     *
     */
    public get() {
        let promise = $.Deferred();
        
        this.loaded_promise.
        then( () => {
            promise.resolve(this.objects);
        })
        .catch( () => {
            promise.resolve({});
        })
        
        return promise;
    }
    
    public getTotal() {
        return this.total;
    }
}

export default Model;