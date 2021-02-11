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
    private fields: object;
    
    constructor() {
                
        $.ajaxSetup({
            cache:false,
            beforeSend: (xhr) => { 
                let access_token = this.getCookie('access_token');
                if(access_token) {
                    xhr.setRequestHeader('Authorization', "Basic " + access_token); 
                }
            }
        });
        
        this.views = {};
        this.translations = {};
        this.schemas = {};
        this.fields = {};
    }

    private setCookie(key, value) {
        var expires = new Date();
        expires.setTime(expires.getTime() + 31536000000); //1 year  
        document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
    }

    private getCookie(key) {
        var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
        return keyValue ? keyValue[2] : null;
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
                url: environment.backend_url+'/index.php?get=model_schema&entity='+entity
            })
            .then( (json_data) => {
                if(typeof(this.schemas[package_name]) == 'undefined') {
                    this.schemas[package_name] = {};
                }
                this.schemas[package_name][class_name] = json_data;
                promise.resolve(this.schemas[package_name][class_name]);
            })
            .catch( (response) => {
                promise.reject(response.responseJSON);
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
                url: environment.backend_url+'/index.php?get=model_view&entity='+entity+'&view_id='+view_id
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
            })
            .catch( (response) => {
                promise.reject(response.responseJSON);
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
                url: environment.backend_url+'/index.php?get=config_i18n&entity='+entity+'&lang='+lang
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
            })
            .catch( (response) => {
                promise.reject(response.responseJSON);
            });            
        }
       return promise;
    }
        
        
    private loadFields(entity:string, view_id:string) {
        var promise = $.Deferred();
        var package_name = this.getPackageName(entity);
        var class_name = this.getClassName(entity);

        if(typeof(this.fields[package_name]) != 'undefined' && typeof(this.fields[package_name][class_name]) != 'undefined' && typeof(this.fields[package_name][class_name][view_id]) != 'undefined') {
            promise.resolve(this.fields[package_name][class_name][view_id]);
        }
        else {
            this.loadView(entity, view_id)
            .then( (view) => {
                var result = [];
                var stack = [];
                // view is valid
                if(view.hasOwnProperty('layout')) {    
                    stack.push(view['layout']);
                    var path = ['containers', 'sections', 'rows', 'columns'];
                    
                    while(stack.length) {
                        var elem = stack.pop();
                        
                        if(elem.hasOwnProperty('items')) {
                            for (let item of elem['items']) { 
                                if(item.type == 'field' && item.hasOwnProperty('id')){
                                    result.push(item);
                                }
                            }
                        }
                        else {
                            for (let step of path) { 
                                if(elem.hasOwnProperty(step)) {
                                    for (let obj of elem[step]) { 
                                        stack.push(obj);
                                    }
                                }
                            }
                        }
                    }
                }
                if(typeof(this.fields[package_name]) == 'undefined') {
                    this.fields[package_name] = {};
                }
                if(typeof(this.fields[package_name][class_name]) == 'undefined') {
                    this.fields[package_name][class_name] = {};
                }                
                this.fields[package_name][class_name][view_id] = result;
                promise.resolve(this.fields[package_name][class_name][view_id]);                
            })
            .catch( (err) => {
                promise.reject(err);
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
        return view;        
    }

    /**
     * Returns a list holding all fields that are present in a given view (as items objects)
     */
	public async getFields(entity:string, view_id:string) {
        const view = await this.loadFields(entity, view_id);
        return view;        
    }
    
    public async read(entity:string, ids:array, fields:array, lang:string) {
        try {
            let params = {
                entity: entity,
                ids: ids,
                fields: fields,
                lang: lang
            };
            const response = await $.get({
                url: environment.backend_url+'/index.php?get=model_read',
                dataType: 'json',
                data: params,
                contentType: 'application/x-www-form-urlencoded; charset=utf-8'
            });
            result = response;
        }
        catch(err) {
            console.log('Error ApiService::read', err);
        }
        return result;         
    }
    
    public async collect(entity:string, domain:array, fields:array, lang:string, order:string, sort:string, start:integer, limit:integer) {
        var result = [];
        try {
            let params = {
                entity: entity,
                domain: domain,
                fields: fields,
                lang: lang,
                order: order,
                sort: sort,
                start: start,
                limit: limit
            };
            const response = await $.get({
                url: environment.backend_url+'/index.php?get=model_collect',
                dataType: 'json',
                data: params,
                contentType: 'application/x-www-form-urlencoded; charset=utf-8'
            });
            result = response;
        }
        catch(err) {
            console.log('Error ApiService::collect', err);
        }
        return result;
    }

    public async search(entity:string, domain:array, order:string, sort:string, start:integer, limit:integer) {
        var ids = [];
        try {
            let params = {
                entity: entity,
                domain: domain,
                order: order,
                sort: sort,
                start: start,
                limit: limit
            };
            const response = await $.get({
                url: environment.backend_url+'/index.php?get=model_search',
                dataType: 'json',
                data: params,
                contentType: 'application/x-www-form-urlencoded; charset=utf-8'
            });
            ids = response;
        }
        catch(err) {
            console.log('Error ApiService::search', err);
        }
        return ids;
    }
    
}



module.exports = _ApiService;