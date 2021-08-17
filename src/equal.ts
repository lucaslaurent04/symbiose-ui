import { $ } from "./jquery-lib";
import { Domain, Frame } from "./equal-lib";

import { environment } from "./environment";
import { ApiService, TranslationService } from "./equal-services";
import moment from 'moment/moment.js';

require('../datepicker-improved.js');
require('../timepicker.js');

require("../css/material-basics.css");
require("../css/equal.css");

// This project uses MDC library (material design components)
// @see https://github.com/material-components/material-components-web/blob/master/docs/getting-started.md


/**
 * eQ is a factory facade for relaying event to the Frames they relate to.
 * 
 */
class eQ {
    
    // jquery object for components communication (Views and Widgets)
    private $sbEvents:any;
    
    // map of Frames : mapping DOM selectors with Frame instances
    private frames: any;

    constructor() {
        this.frames = {};
        this.init();
    }
    
    
    private async init() {
        // init locale
        moment.locale(environment.locale);
        
        // $sbEvents is a jQuery object used to communicate: it allows an both internal services and external lib to connect with eQ-UI
        // $('#sb-events').trigger(event, data);
        this.$sbEvents = $('<div/>').attr('id', 'sb-events').css('display','none').appendTo('body');
        
        /**
         * 
         * A new context can be requested by ngx (menu or app) or by opening a sub-object
         */
        this.$sbEvents.on('_openContext', async (event:any, config:any) => {
            console.log('eQ: received _openContext', config);

            let params = {
                entity:     '', 
                type:       'list', 
                name:       'default', 
                domain:     [], 
                mode:       'view',             // view, edit
                purpose:    'view',             // view, select, add
                lang:       environment.lang,
                callback:   null,
                domContainerSelector: '#sb-container'
            };
            // extend default params with received config
            config = {...params, ...config};
            // create a draft object if required: Edition is based on asynchronous creation: a draft is created (or recylcled) and is turned into an instance if 'update' action is triggered.
            if(config.purpose == 'create') {
                console.log('requesting dratf object');
                let defaults    = await this.getNewObjectDefaults(config.entity, config.domain);
                let object      = await ApiService.create(config.entity, defaults);
                config.domain   = [['id', '=', object.id], ['state', '=', 'draft']];    
            }

            if(!this.frames.hasOwnProperty(config.domContainerSelector)) {
                this.frames[config.domContainerSelector] = new Frame(config.domContainerSelector);
            }

            this.frames[config.domContainerSelector].openContext(config);
        });

        /**
         * 
         * Event handler for request for closing current context
         * When closing, a context might transmit some value (its the case, for instance, when selecting one or more records for m2m or o2m fields)
         */
        this.$sbEvents.on('_closeContext', (event:any, params:any = {}) => {
            // close context non-silently with relayed data
            params = {...{
                domContainerSelector: '#sb-container',
                data: {}
            }, ...params};

            if(this.frames.hasOwnProperty(params.domContainerSelector)) {
                this.frames[params.domContainerSelector].closeContext(params.data);    
            }
        });

        this.$sbEvents.on('_closeAll', (event:any, params:any = {}) => {
            // close all contexts silently
            params = {...{
                domContainerSelector: '#sb-container',
                silent: true
            }, ...params};

            if(this.frames.hasOwnProperty(params.domContainerSelector)) {
                this.frames[params.domContainerSelector].closeContext(params.silent);
            }
        });

    }




    /**
     * Generate an object mapping fields of current entity with default values, based on current domain.
     * 
     * @returns Object  A map of fields with their related default values
     */
     private async getNewObjectDefaults(entity:string, domain:[] = []) {
        // create a new object as draft
        let fields:any = {state: 'draft'};
        // retrieve fields definition
        let model_schema = await ApiService.getSchema(entity);
        let model_fields = model_schema.fields;
        // use View domain for setting default values  
        let tmpDomain = new Domain(domain);
        for(let clause of tmpDomain.getClauses()) {
            for(let condition of clause.getConditions()) {
                let field  = condition.getOperand();
                if(field == 'id') continue;
                if(['ilike', 'like', '=', 'is'].includes(condition.getOperator()) && model_fields.hasOwnProperty(field)) {
                    fields[field] = condition.getValue();
                }
            }
        }
        return fields;
    }   

    /**
     * Interface method for integration with external tools.
     * @param context 
     */
    public open(context: any) {
        console.log("eQ::open");
        this.$sbEvents.trigger('_openContext', context);
    }    
    
}

module.exports = eQ;