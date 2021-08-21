import { $ } from "./jquery-lib";
import { Frame } from "./equal-lib";

import { environment } from "./environment";
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
        this.$sbEvents.on('_openContext', (event:any, config:any) => {
            console.log('eQ: received _openContext', config);

            // extend default params with received config
            config = {...{
                entity:     '', 
                type:       'list', 
                name:       'default', 
                domain:     [], 
                mode:       'view',             // view, edit
                purpose:    'view',             // view, select, add
                lang:       environment.lang,
                callback:   null,
                target:     '#sb-container'
            }, ...config};

            if(!this.frames.hasOwnProperty(config.target)) {
                this.frames[config.target] = new Frame(config.target);
            }

            this.frames[config.target].openContext(config);
        });

        /**
         * 
         * Event handler for request for closing current context
         * When closing, a context might transmit some value (its the case, for instance, when selecting one or more records for m2m or o2m fields)
         */
        this.$sbEvents.on('_closeContext', (event:any, params:any = {}) => {
            // close context non-silently with relayed data
            params = {...{
                target: '#sb-container',
                data:   {}
            }, ...params};

            if(this.frames.hasOwnProperty(params.target)) {
                this.frames[params.target].closeContext(params.data);    
            }
        });

        this.$sbEvents.on('_closeAll', (event:any, params:any = {}) => {
            // close all contexts silently
            params = {...{
                target: '#sb-container',
                silent: true
            }, ...params};

            if(this.frames.hasOwnProperty(params.target)) {
                this.frames[params.target].closeContext(params.silent);
            }
        });

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