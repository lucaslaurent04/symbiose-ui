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
    private objects: any[];


    // total objects matching the current domain on the back-end
    private total: number;

    private loaded_promise: any;
    private has_changed: boolean;
    
    // Collecitons do not deal with lang: it is used in ApiService set in the environment var
    
    constructor(view:View) {
        this.view = view;

        this.loaded_promise = $.Deferred();
        this.has_changed = false;
        
        this.objects = [];
        this.total = 0;
    }
    

    public async init() {
        
        try {            
            await this.refresh();
        }
        catch(err) {
            console.log('Something went wrong ', err);
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
        let fields: any[] = <[]>Object.keys(this.view.getViewFields());
        let schema = this.view.getModelFields();

        // append `name` subfield for relational fields, using the dot notation
        for(let i in fields) {
            let field = fields[i];
            if(['many2one', 'one2many', 'many2many'].indexOf(schema[field]['type']) > -1) {
                fields[i] = field + '.name';
            }
        }


        try {
            this.objects = await ApiService.collect(this.view.getEntity(), this.view.getDomain(), fields, this.view.getOrder(), this.view.getSort(), this.view.getStart(), this.view.getLimit(), this.view.getLang());
            
            this.loaded_promise.resolve();
            this.total = ApiService.getLastCount();

            // trigger model change handler in the parent View (in order to update the layout)
            await this.view.onchangeModel();
        }
        catch(err) {
            console.log('Unable to fetch Collection from server', err);
        }        
        
    }
    
    /**
     * React to external request of Model change (one ore more objects in the collection have been updated through the Layout)
     */
    public change(ids: Array<any>, values: any) {
        for (let object of this.objects) {
            for (let id of ids) {
                if(object.hasOwnProperty('id') && object.id == id) {
                    for (let field in values) {
                        if(object.hasOwnProperty(field)) {
                            object[field] = values[field];
                            this.has_changed = true;
                        }
                    }    
                }
            }
        }
    }
    
    public ids() {
        return this.objects.map( (object:any) => object['id'] );
    }

    /**
     * Return the entire Collection
     *
     */
    public get(ids:any[] = []) {
        let promise = $.Deferred();
        
        this.loaded_promise.
        then( () => {
            // return the full collection
            if(ids.length == 0) {
                promise.resolve(this.objects);
            }
            else {
                // create a custom collection by filtering objects on their ids
                promise.resolve( this.objects.filter( (object:any) => ids.indexOf(object['id']) > -1 ) );
            }            
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