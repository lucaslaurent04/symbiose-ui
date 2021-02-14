import { $ } from "jquery-lib";
import { ApiService } from "equal-services";

import View from "View";
import Layout from "Layout";

/**
 * Class for Model intercations
 * Acts like server-side Collection.class.php
 */
export class Model {

    private view: View;
    
    // Collection (map) of objects: objects ids mapping related objects
    private objects: any;

    // entity (package\Class) to be loaded: should be set only once (depend on the related view)
    private entity: string;
    // fields to be loaded: should be set only once (depend on the related view)
    private fields: array;
    
    private schema: object;
    
    
    // Collection domain: may vary, is empty by default, and is always merged with the one of the parent View
    private domain: array;
    
    // Collection holds its own default values for search requests
    private order: string;
    private sort: string;    
    private start: interger;
    private limit: interger;
    
    // Collecitons do not deal with lang: it is used in ApiService set in the environment var
    
    constructor(view:View, schema: object, fields: array) {
        this.view = view;

        // schema holds additional info (type, contrainsts, ...)
        this.schema = schema;
        this.fields = fields;
        
        this.objects = {};
        
        // start with an empty domain
        this.domain = [];
        
        this.order = 'id';
        this.sort = 'asc';
        this.start = 0;
        this.limit = 25;
        
        this.init();    
    }


    // in 
    // change of the domain or params (order, sort, start, limit)
    
    // out
    // provide view with Collection
    

    private async init() {
        
        try {            
            this.refresh();
        }
        catch(err) {
            console.log('something went wrong ', err);
        }        
        
    }
    
    private mergeDomains(domainA: array, domainB: array) {
        // domains are disjunctions of conjunctions
        //
        var result;
        return result;
    }
    
    public async refresh() {
        console.log('Model::refresh');
        let domain = this.mergeDomains(this.view.domain, this.domain);
        try {
            this.objects = await ApiService.collect(this.view.entity, domain, this.fields, this.order, this.sort, this.start, this.limit);

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
    public update(ids: array, values: object) {
        for (let id of ids) {
            if(this.objects.hasOwnProperty(id)) {
                for (let field in values) {                    
                    if(this.objects[id].hasOwnProperty(field)) {
                        this.objects[id].[field] = values[field];
                    }
                }
            }
        }
    }
    
    public ids() {
        return Object.keys(this.objects);
    }

    /**
     * >Return the entire Collectiono
     *
     */
    public get() {
        return this.objects;
    }
    
}

module.exports = Model;