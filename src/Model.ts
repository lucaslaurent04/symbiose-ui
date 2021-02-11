import { $ } from "jquery-lib";
import { ApiService } from "equal-services";

import Layout from "Layout";

/**
 * Class for Model intercations
 * Acts like server-side Collection.class.php
 */
export class Model {
    
    private objects: any;
    private entity: string;
    
    private domain: array;   
    private order: string;
    private sort: string;    
    private start: interger;
    private limit: interger;
    
    private lang: string;
    
    constructor(entity:string) {        
        this.entity = entity;

        this.objects = {};
        
        this.domain = [];
        this.order = 'id';
        this.sort = 'asc';    
        this.start = 0;
        this.limit = 25;
        this.lang = 'fr';
        
        this.load();
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

    public async read(fields:[], lang:string) {
        
    }
       
    private async load() {            
        try {            
            const values = await ApiService.collect(this.entity, this.domain, this.fields, this.lang, this.order, this.sort, this.start, this.limit);
            this.objects = { ...values };
            console.log(this.objects);
        }
        catch(err) {
            console.log('something went wrong ', err);
        }        
    }
    
}

module.exports = Model;