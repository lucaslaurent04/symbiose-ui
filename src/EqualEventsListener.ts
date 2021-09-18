import { $ } from "./jquery-lib";
import { Frame } from "./equal-lib";
import { UIHelper } from './material-lib';

import { environment } from "./environment";
import moment from 'moment/moment.js';

require('../datepicker-improved.js');
require('../timepicker.js');

require("../css/material-basics.css");
require("../css/equal.css");

// This project uses MDC library (material design components)
// @see https://github.com/material-components/material-components-web/blob/master/docs/getting-started.md

declare global {
    interface Window { context: any; }
}

/**
 * EqualEventsListener is the root entity for requesting display of View contexts.
 * It acts as a factory facade for relaying event to the Frames they relate to.
 * 
 */
class EqualEventsListener {
    
    // jquery object for components communication (Views and Widgets)
    private $sbEvents:any;
    
    // map of Frames : mapping DOM selectors with Frame instances
    private frames: any;

    constructor(domListenerId: string = '') {
        this.frames = {};

        // $sbEvents is a jQuery object used to communicate: it allows an both internal services and external lib to connect with eQ-UI

        // if no name was given, use the default one
        if(domListenerId.length == 0) {
            domListenerId = 'eq-events';
        }
        this.$sbEvents = $('#'+domListenerId);
        // if DOM element by given name cannot be found, create it
        if(!this.$sbEvents.length) {
            this.$sbEvents = $('<div/>').attr('id', domListenerId).css('display','none').appendTo('body');
        }

        this.init();
    }
    
    
    private async init() {
        // init locale
        moment.locale(environment.locale);
                
        // main entry point : click events are read as input/output for external tools
        // can be used 
        // by emitters to request a context change
        // by listeners to be notified about any context change (whatever the frame)
        this.$sbEvents.on('click', (event: any, context:any, reset: boolean = false) => {
            if(!context) {
                context = window.context;
            }

            // extend default params with received config
            context = {...{
                entity:     '', 
                type:       'list', 
                name:       'default', 
                domain:     [], 
                mode:       'view',             // view, edit
                purpose:    'view',             // view, select, add
                lang:       environment.lang,
                callback:   null,
                target:     '#sb-container'
            }, ...context};

            // ContextService uses 'window' global object to store the arguments (context parameters)
            this.$sbEvents.trigger('_openContext', [context, reset]);
        });

        /**
         * 
         * A new context can be requested by ngx (menu or app) or by opening a sub-object
         */
        this.$sbEvents.on('_openContext', async (event:any, config:any, reset: boolean = false) => {
            console.log('eQ: received _openContext', config);

            if(!this.frames.hasOwnProperty(config.target)) {
                this.frames[config.target] = new Frame(this, config.target);
            }
            else if(reset) {
                this.frames[config.target].closeAll();
            }

            await this.frames[config.target]._openContext(config);
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
        
        // extend default params with received config
        context = {...{
            entity:     '', 
            type:       'list', 
            name:       'default', 
            domain:     [], 
            mode:       'view',             // view, edit
            purpose:    'view',             // view, select, add
            lang:       environment.lang,
            callback:   null,
            target:     '#sb-container'
        }, ...context};

        
        // make context available to the outside
        window.context = context;
        this.$sbEvents.trigger('click', [context, context.hasOwnProperty('reset') && context.reset]);
    }    
 
    
    /**
     * Generates a menu to be displayed inside the #sb-emnu container.
     * Items of the menu trigger _openContext calls, independantly from any existing listener
     * 
     * @param menu Menu object (JSON structure) describing the entries of each section.
     */
    public loadMenu(menu: any) {
// #todo - this is meant for testing and should be deprecated    
    for(var i = 0; i < menu.length; ++i) {
        var item = menu[i];

        let $link = $('<div/>').addClass('sb-menu-button mdc-menu-surface--anchor')
        .append( UIHelper.createButton('menu-entry'+'-'+item.name+'-'+item.target, item.name, 'text', item.icon) )
        .appendTo($('#sb-menu'));

        // create floating menu for filters selection
        let $menu = UIHelper.createMenu('nav-menu').addClass('sb-view-header-list-filters-menu').css({"margin-top": '48px'}).appendTo($link);
        let $list = UIHelper.createList('nav-list').appendTo($menu);

        for(var j = 0; j < menu[i].children.length; ++j) {
            var item = menu[i].children[j];

            UIHelper.createListItem('menu_item-'+i+'-'+j, item.name + ' (' + item.entity + ')', item.icon)
            .data('item', item)
            .appendTo($list)
            .on('click', (event) => {
                let $this = $(event.currentTarget);
                let item = $this.data('item');
                if( !item.hasOwnProperty('domain') ) {
                    item.domain = [];
                }
                let type = 'list';
                let name = 'default';
                if( item.hasOwnProperty('target') ) {
                    let parts = item.target.split('.');
                    if(parts.length) type = <string>parts.shift();
                    if(parts.length) name = <string>parts.shift();
                }
                this.$sbEvents.trigger('_closeAll');
                setTimeout(() => {
                    this.$sbEvents.trigger('_openContext', {entity: item.entity, type: type, name: name, domain: item.domain} );
                });
            });
        }

        UIHelper.decorateMenu($menu);
        $link.find('button').on('click', () => $menu.trigger('_toggle') );
    }

}    
}

module.exports = EqualEventsListener;