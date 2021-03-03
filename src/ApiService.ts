import { $ } from "./jquery-lib";
import { environment } from "./environment";

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
     * These are Map objects for storing promises of requests
     */
    private views: any;
    private translations: any;
    private schemas: any;

    private last_count: number; 


    constructor() {        

        $.ajaxSetup({
            cache:false,
            beforeSend: (xhr) => {
                let access_token = this.getCookie('access_token');
                if(access_token) {
                    xhr.setRequestHeader('Authorization', "Basic " + access_token); 
                }
                else {
                    console.log('_ApiService: no access token found')
                }
            }
        });
        
        this.views = {};
        this.translations = {};
        this.schemas = {};

        this.last_count = 0;
    }

    private setCookie(key: string, value: any) {
        var expires = new Date();
        expires.setTime(expires.getTime() + 31536000000); //1 year  
        document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
    }

    private getCookie(key: string) {
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
        var package_name = this.getPackageName(entity);
        var class_name = this.getClassName(entity);
        
        if(typeof(this.schemas[package_name]) == 'undefined' 
        || typeof(this.schemas[package_name][class_name]) == 'undefined') {
            if(typeof(this.schemas[package_name]) == 'undefined') {
                this.schemas[package_name] = {};
            }
            this.schemas[package_name][class_name] = $.Deferred();
            $.get({
                url: environment.backend_url+'/?get=model_schema&entity='+entity
            })
            .then( (json_data) => {
                this.schemas[package_name][class_name].resolve(json_data);
            })
            .catch( (response:any) => {
                console.log('ApiService::loadSchema error', response.responseJSON);
                this.schemas[package_name][class_name].resolve({});
            });            
        }
       return this.schemas[package_name][class_name];
    }

    // the view_id matches the following convention : view_type.view_name
    private loadView(entity:string, view_id:string) {
        var package_name = this.getPackageName(entity);
        var class_name = this.getClassName(entity);

        if(typeof(this.views[package_name]) == 'undefined' 
        || typeof(this.views[package_name][class_name]) == 'undefined' 
        || typeof(this.views[package_name][class_name][view_id]) == 'undefined') {
            if(typeof(this.views[package_name]) == 'undefined') {
                this.views[package_name] = {};
            }
            if(typeof(this.views[package_name][class_name]) == 'undefined') {
                this.views[package_name][class_name] = {};
            }
            this.views[package_name][class_name][view_id] = $.Deferred();
            $.get({
                url: environment.backend_url+'/?get=model_view&entity='+entity+'&view_id='+view_id
            })
            .then( (json_data) => {                
                this.views[package_name][class_name][view_id].resolve(json_data);
            })
            .catch( (response:any) => {
                console.log('ApiService::loadView error', response.responseJSON);
                this.views[package_name][class_name][view_id].resolve({});
            });
        }
        return this.views[package_name][class_name][view_id];
    }

    private loadTranslation(entity:string, lang:string) {
        var package_name = this.getPackageName(entity);
        var class_name = this.getClassName(entity);

        if(typeof(this.translations[package_name]) == 'undefined' 
        || typeof(this.translations[package_name][class_name]) == 'undefined' 
        || typeof(this.translations[package_name][class_name][lang]) == 'undefined') {
            console.log('loadtranslation promise not found: requesting', entity, lang, this.translations);
            if(typeof(this.translations[package_name]) == 'undefined') {
                this.translations[package_name] = {};
            }
            if(typeof(this.translations[package_name][class_name]) == 'undefined') {
                this.translations[package_name][class_name] = {};
            }
            this.translations[package_name][class_name][lang] = $.Deferred();
            $.get({
                url: environment.backend_url+'/?get=config_i18n&entity='+entity+'&lang='+lang
            })
            .then( (json_data) => {                
                this.translations[package_name][class_name][lang].resolve(json_data);
            })
            .catch( (response:any) => {
                console.log('ApiService::loadTranslation error', response.responseJSON);
                this.translations[package_name][class_name][lang].resolve({});
            });            
        }
        // stored object is a promise, that might or might not be resolved, 
        // with either translation object or empty object if no translation was found
        return this.translations[package_name][class_name][lang];
    }
        
        
    public getLastCount() {
        return this.last_count;
    }
    
    public async getTranslation(entity:string, lang:string) {
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

    public async create(entity:string) {
        let result: any;
        try {
            let params = {
                entity: entity,
                lang: environment.lang
            };
            const response = await $.get({
                url: environment.backend_url+'/?do=model_create',
                dataType: 'json',
                data: params,
                contentType: 'application/x-www-form-urlencoded; charset=utf-8'
            });
            result = response;
        }
        catch(err) {
            console.log('Error ApiService::create', err);
        }
        return result;
    }
    
    public async read(entity:string, ids:[], fields:[]) {
        let result: any;
        try {
            let params = {
                entity: entity,
                ids: ids,
                fields: fields,
                lang: environment.lang
            };
            const response = await $.get({
                url: environment.backend_url+'/?get=model_read',
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

    public async update(entity:string, ids:Array<number>, fields:Array<any>) {
        console.log('ApiService::update', entity, ids, fields);
        let result: any;
        try {
            let params = {
                entity: entity,
                ids: ids,
                fields: fields,
                lang: environment.lang
            };
            const response = await $.post({
                url: environment.backend_url+'/?do=model_update',
                dataType: 'json',
                data: params,
                contentType: 'application/x-www-form-urlencoded; charset=utf-8'
            });
            result = response;
        }
        catch(err) {
            console.log('Error ApiService::update', err);
        }
        return result;
    }

    public async collect(entity:string, domain:any[], fields:[], order:string, sort:string, start:number, limit:number, lang:string) {
        console.log('ApiService::collect', entity, domain, fields, order, sort, start, limit, lang);
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
                url: environment.backend_url+'/?get=model_collect',
                dataType: 'json',
                data: params,
                contentType: 'application/x-www-form-urlencoded; charset=utf-8'
            }).done((event, textStatus, jqXHR) => {
                this.last_count = parseInt( <any>jqXHR.getResponseHeader('X-Total-Count') );
            } );
            result = response;
        }
        catch(err) {
            console.log('Error ApiService::collect', err);
        }
        return result;
    }

    public async search(entity:string, domain:[], order:string, sort:string, start:number, limit:number) {
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
                url: environment.backend_url+'/?get=model_search',
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



export default _ApiService;