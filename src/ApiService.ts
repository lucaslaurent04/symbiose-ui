import * as $ from "jquery";
import { environment } from "environment";

/**
 * This service acts as an interface between client and server and caches view objects to lower the traffic
 * Contents that can be cached are : 
 * - Views
 * - Menus
 * - Translations
 * - Schemas
 */
export class _ApiService {
        
    /**
     * Internal objects for cache management
     */
    private views: object;
    private translations: object;
    private schemas: object;
    
    constructor() {
        this.views = {};
        this.translations = {};
        this.schemas = {};
    }
    
    /**
     * ObjectManager methods
     */
    private getPackageName(entity:string) {
        return entity.substr(0, entity.indexOf('\\'));
    }
    
    private getClassName(entity:string) {
        return entity.substr(entity.indexOf('\\')+1);
    }

    
    /**
     * schemas methods
     */
    private loadSchema(entity:string) {
        var promise = $.Deferred();
        var package_name = this.getPackageName(entity);
        var class_name = this.getClassName(entity);
        
        if(typeof(this.schemas[package_name]) != 'undefined' && typeof(this.schemas[package_name][class_name]) != 'undefined') {
            promise.resolve(this.schemas[package_name][class_name]);
        }
        else {
            $.get({
                url: environment.backend_url+'/index.php?get=model_schema&entity='+entity,
                dataType: 'json',
                contentType: 'application/json; charset=utf-8'
            })
            .then( (json_data) => {
                if(typeof(this.schemas[package_name]) == 'undefined') {
                    this.schemas[package_name] = {};
                }
                this.schemas[package_name][class_name] = json_data;
                promise.resolve(this.schemas[package_name][class_name]);
            });
        }
       return promise;
    }



    // the view_id matches the following convention : view_type.view_name
    private loadView(entity:string, view_id:string) {
        var promise = $.Deferred();
        var package_name = this.getPackageName(entity);
        var class_name = this.getClassName(entity);

        if(typeof(this.views[package_name]) != 'undefined' && typeof(this.views[package_name][class_name]) != 'undefined' && typeof(this.views[package_name][class_name][view_id]) != 'undefined') {
            promise.resolve(this.views[package_name][class_name][view_id]);
        }
        else {
            $.get({
                url: environment.backend_url+'/packages/'+package_name+'/views/'+class_name.replace('\\', '/')+'.'+view_id+'.json',
                dataType: 'json',
                contentType: 'application/html; charset=utf-8'
            })
            .then( (json_data) => {
                if(typeof(this.views[package_name]) == 'undefined') {
                    this.views[package_name] = {};
                }
                if(typeof(this.views[package_name][class_name]) == 'undefined') {
                    this.views[package_name][class_name] = {};
                }
                this.views[package_name][class_name][view_id] = json_data;                
                promise.resolve(this.views[package_name][class_name][view_id]);
            });
        }
        return promise;
    }

    private loadTranslation(entity:string, lang:string) {
        var promise = $.Deferred();
        var package_name = this.getPackageName(entity);
        var class_name = this.getClassName(entity);

        if(typeof(this.translations[package_name]) != 'undefined' && typeof(this.translations[package_name][class_name]) != 'undefined' && typeof(this.translations[package_name][class_name][lang]) != 'undefined') {
            promise.resolve(this.translations[package_name][class_name][lang]);
        }
        else {
            $.get({
                //url: 'index.php?get=core_i18n_lang&package='+package_name+'&lang='+lang,
                url: environment.backend_url+'/packages/'+package_name+'/i18n/'+lang+'/'+class_name.replace('\\', '/')+'.json',
                dataType: 'json',
                contentType: 'application/json; charset=utf-8'
            })
            .then( (json_data) => {
                if(typeof(this.translations[package_name]) == 'undefined') {
                    this.translations[package_name] = {};
                }
                if(typeof(this.translations[package_name][class_name]) == 'undefined') {
                    this.translations[package_name][class_name] = {};
                }
                this.translations[package_name][class_name][lang] = json_data;                
                promise.resolve(this.translations[package_name][class_name][lang]);
            });            
        }
       return promise;
    }
        
    public async getTranslation(entity, lang) {
        const translation = await this.loadTranslation(entity, lang);
        return translation;
    }
        
        
    public async getSchema(entity:string) {
        const schema = await this.loadSchema(entity);
        return schema;
    }    

	public async getView(entity:string, view_id:string) {
        const view = await this.loadView(entity, view_id);
        return schema;        
    }
    
    
}



module.exports = _ApiService;