import { $ } from "./jquery-lib";
import { Context } from "./equal-lib";
import { environment } from "./environment";
import { ApiService, TranslationService } from "./equal-services";
import moment from 'moment/moment.js';

// We use MDC (material design components)
// @see https://github.com/material-components/material-components-web/blob/master/docs/getting-started.md

class eQ {
    
    // jquery object for components communication
    private $sbEvents:any;
    
    // the main container in which the Context views are injected
    private $container: any;

    private $headerContainer: any;

    // stack of Context (only current context is visible)
    private stack: Array<Context>;

    // current context
    private context:Context;
    
    constructor(entity:string) {
        // we need to actually use the dependencies in this file in order to have them loaded in webpack
        this.$sbEvents = $();
        
        // `#sb-container` is a convention and must be present in the DOM
        this.$container = $('#sb-container');
        this.$headerContainer = $('<div/>').addClass('sb-container-header').appendTo(this.$container);
        this.context = <Context>{};
        this.stack = [];
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
            let params = {
                entity:     '', 
                type:       'list', 
                name:       'default', 
                domain:     [], 
                mode:       'view', 
                purpose:    'view', 
                lang:       environment.lang,
                callback:   null
            };
            // extend default params with received config
            config = {...params, ...config};

            let context: Context = new Context(config.entity, config.type, config.name, config.domain, config.mode, config.purpose, config.lang, config.callback);

            this.openContext(context);
        });

        /**
         * 
         * Event handler for request for closing current context
         * When closing, a context might transmit some value (its the case, for instance, when selecting one or more records for m2m or o2m fields)
         */
        this.$sbEvents.on('_closeContext', (event:any, data:any = null) => {
            // close context non-silently with relayed data
            this.closeContext(false, data);
        });
        
    }

    private async getPurposeString(context:Context) {
        let result: string = '';

        let entity = context.getEntity();
        let type = context.getType();
        let purpose = context.getPurpose();    

        let translation = await ApiService.getTranslation(entity, environment.lang);

        if(translation.hasOwnProperty('name')) {
            entity = translation['name'];    
        }
        else {
            let parts = entity.split('\\');
            entity = <string>parts.pop();    
            // set the first letter uppercase
            entity = entity.charAt(0).toUpperCase() + entity.slice(1);
        }

        if(purpose == 'view') {
            result = entity;
            
            if(type == 'list') {
                if(translation.hasOwnProperty('plural')) {
                    result = translation['plural'];    
                }
                else {
                    result += 's';
                }                
            }
        }
        else {
            // i18n: look in config translation file
            let purpose_const: string = '';
            switch(purpose) {
                case 'create':  purpose_const = 'SB_PURPOSE_CREATE'; break;
                case 'update':  purpose_const = 'SB_PURPOSE_UPDATE'; break;
                case 'select':  purpose_const = 'SB_PURPOSE_SELECT'; break;
                case 'add':     purpose_const = 'SB_PURPOSE_ADD'; break;
            }
            let translation = await TranslationService.translate(purpose_const);
            if(translation.length) {
                result = translation + ' ' + entity;
            }
            else {
                result = purpose.charAt(0).toUpperCase() + purpose.slice(1) + ' ' + entity;
            }
        }
        // when context relates to a single object, append object identifier to the breadcrumb
        if(type == 'form') {
            let objects = await context.getView().getModel().get();
            if(objects.length) {
                let object = objects[0];
                // by convention, collections should always request the `name` field
                if(object.hasOwnProperty('name')) {
                    result += ' ['+object['name']+']';
                }    
            }
        }

        return result;
    }

    private async updateHeader() {
        let $elem = $('<h3 />');

        this.$headerContainer.empty().append($elem);

        // use all contexts in stack...
        for(let context of this.stack) {
            if(context.hasOwnProperty('$container')) {

                $('<a />').text(await this.getPurposeString(context)).appendTo($elem)
                .on('click', () => {
                    
                    // 2) close all contexts after the one clicked
                    console.log('clicked', this.stack.length, this.stack)
                    for(let i = this.stack.length-1; i > 0; --i) {
                        // unstack contexts silently (except for the last one), and ask for validation at each step
                        if(this.stack[i] == context) {
                            let validation = true;
                            if(this.context.hasChanged()) {
                                validation = confirm(TranslationService.instant('SB_ACTIONS_MESSAGE_ABANDON_CHANGE'));
                            }
                            if(!validation) return;        
                            this.closeContext();
                            break;
                        }
                        else {
                            let validation = true;
                            if(this.context.hasChanged()) {
                                validation = confirm(TranslationService.instant('SB_ACTIONS_MESSAGE_ABANDON_CHANGE'));
                            }
                            if(!validation) return;        
                            this.closeContext(true);
                        }                        
                    }
                });

                $('<span> › </span>').appendTo($elem);
            }
        }
        // + the active context
        if(this.context.hasOwnProperty('$container')) {
            $('<span />').text(await this.getPurposeString(this.context)).appendTo($elem)
        }
        
    }

    private openContext(context: Context) {
        // stack received context
        if(this.context) {
            this.stack.push(this.context);
            if(this.context.hasOwnProperty('$container')) {
                // conainers are hidden and not detached in order to maintain the listeners
                this.context.$container.hide();
            }
        }
        this.context = context;
        this.$container.append(this.context.getContainer());
        this.updateHeader();
    }

    /**
     * 
     * @param silent do not show the pop-ed context and do not refresh the header 
     */
    private async closeContext(silent: boolean = false, data:any = null) {
        console.log('closeContext', silent, data);
        if(this.stack.length) {
            let has_changed:boolean = this.context.hasChanged();
            
            // destroy current context and run callback, if any
            this.context.close(data);
console.log('suite');
            // restore previous context
            this.context = <Context>this.stack.pop();
            if(!silent) {                
                if(has_changed && this.context.getMode() == 'view') {
                    await this.context.refresh();
                }    
                this.context.$container.show();
                this.updateHeader();
            }
        }
    }
    
    public test() {
        console.log("eQ::test");
        $("#test").dialog();
        $( "#datepicker" ).daterangepicker();

        
        this.$sbEvents.trigger('_openContext', {entity: 'core\\User', type: 'list'} );
        /*
        setTimeout( () => {
            console.log('timeout1');
            this.$sbEvents.trigger('_openContext', new Context('core\\Group', 'list', 'default', []));
            setTimeout( () => {
                console.log('timeout2');
                this.$sbEvents.trigger('_closeContext');
            }, 2000);
            
        }, 2000);
*/


    }

}

module.exports = eQ;