import { $ } from "./jquery-lib";
import { Context } from "./equal-lib";
import { environment } from "./environment";
import { UIHelper } from './material-lib';
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

    // temporary var for computing width of rendered strings
    private $canvas: any;

    // stack of Context (only current context is visible)
    private stack: Array<Context>;

    // current context
    private context:Context;
    
    constructor(entity:string) {
        // we need to actually use the dependencies in this file in order to have them loaded in webpack
        this.$sbEvents = $();
        
        // `#sb-container` is a convention and must be present in the DOM
        this.$container = $('#sb-container');
        // #sb-container-header is managed automatically and shows the breadcrumb of the stack
        this.$headerContainer = $('<div/>').addClass('sb-container-header').appendTo(this.$container);
        
        this.context = <Context>{};
        this.stack = [];
        this.init();
    }
    
    
    private async init() {
        // init locale
        moment.locale(environment.locale);
        
        // trigger header re-draw when available horizontal space changes
        var resize_debounce:any;
        $(window).on( 'resize', () => { 
            clearTimeout(resize_debounce);
            resize_debounce = setTimeout( async () => this.updateHeader(), 100);             
        });

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

        this.$sbEvents.on('_closeAll', (event:any) => {
            // close all contexts silently
            while(this.stack.length) {
                this.closeContext(true);
            }
        });

    }

    private getTextWidth(text:string, font:string) {
        var result = 0;
        // re-use canvas object for better performance
        let canvas = this.$canvas || (this.$canvas = document.createElement("canvas"));
        let context:any = canvas.getContext("2d");
        context.font = font;
        let metrics = context.measureText(text);
        result = metrics.width;
        return result;
    }

    private async getPurposeString(context:Context) {
        let result: string = '';

        let entity = context.getEntity();
        let type = context.getType();
        let name = context.getName();
        let purpose = context.getPurpose();    

        let view_schema = await ApiService.getView(entity, type+'.'+name);
        let translation = await ApiService.getTranslation(entity, environment.lang);

        if(translation.hasOwnProperty('name')) {
            entity = translation['name'];
        }
        else if(view_schema.hasOwnProperty('name')) {
            entity = view_schema['name'];
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
            let translated_purpose = await TranslationService.translate(purpose_const);
            if(translated_purpose.length) {
                result = translated_purpose + ' ' + entity;
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
                if(object.hasOwnProperty('name') && purpose != 'create') {
                    result += ' <small>['+object['name']+']</small>';
                }    
            }
        }

        return result;
    }

    private async updateHeader() {
        console.log('update header');
        let $elem = $('<h3 />').css({display: 'flex'});

        // add temporary, invisible header for font size computations
        let $temp = $('<h3 />').css({visibility: 'hidden'}).appendTo(this.$headerContainer);

        let current_purpose_string = await this.getPurposeString(this.context);

        let available_width = this.$headerContainer[0].clientWidth * 0.8;

        let font = $temp.css( "font-weight" ) + ' ' +$temp.css( "font-size" ) + ' ' + $temp.css( "font-family");
        let total_text_width = this.getTextWidth(current_purpose_string, font);

        let prepend_contexts_count = 0;

        if(total_text_width > available_width) {
            let char_width = total_text_width / current_purpose_string.length;
            let max_chars = available_width / char_width;
            current_purpose_string = current_purpose_string.substr(0, max_chars-1)+'...';
        }
        else {
            // use all contexts in stack (loop in reverse order)
            for(let i = this.stack.length-1; i >= 0; --i) {
                let context = this.stack[i];
                if(context.hasOwnProperty('$container')) {                
                    let context_purpose_string = await this.getPurposeString(context);
                    
                    let text_width = this.getTextWidth(context_purpose_string + ' > ', font);
                    let overflow = false;
                    if(text_width+total_text_width >= available_width) {
                        overflow = true;
                        context_purpose_string = '...';
                        text_width = this.getTextWidth(context_purpose_string + ' > ', font);
                        if(text_width+total_text_width >= available_width) {
                            break;
                        }
                    }
                    total_text_width += text_width;
                    prepend_contexts_count++;


                    $('<a>'+context_purpose_string+'</a>').prependTo($elem)
                    .on('click', async () => {                    
                        // close all contexts after the one clicked
                        for(let j = this.stack.length-1; j > i; --j) {
                            // unstack contexts silently (except for the targeted one), and ask for validation at each step
                            if(this.context.hasChanged()) {
                                let validation = confirm(TranslationService.instant('SB_ACTIONS_MESSAGE_ABANDON_CHANGE'));
                                if(!validation) return;        
                                this.closeContext(true);
                            }
                            else {
                                this.closeContext(true);
                            }
                        }
                        this.closeContext();
                    });
                    
                    if(overflow) {
                        break;
                    }

                    if(i > 1) {
                        $('<span> › </span>').css({'margin': '0 10px'}).prependTo($elem);
                    }

                }
            }

        }

        // ... plus the active context
        if(this.context.hasOwnProperty('$container')) {
            if(prepend_contexts_count > 0) {
                $('<span> › </span>').css({'margin': '0 10px'}).appendTo($elem);
            }            
            $('<span>'+current_purpose_string+'</span>').appendTo($elem);
            if(this.stack.length > 1) {
                UIHelper.createButton('context-close', '', 'mini-fab', 'close').css({'transform': 'scale(0.5)', 'margin-top': '3px', 'background': '#bababa', 'box-shadow': 'none'}).appendTo($elem)
                .on('click', () => {                    
                    let validation = true;
                    if(this.context.hasChanged()) {
                        validation = confirm(TranslationService.instant('SB_ACTIONS_MESSAGE_ABANDON_CHANGE'));
                    }
                    if(!validation) return;
                    this.closeContext();
                });                
            }
            this.$headerContainer.show().empty().append($elem);
        }
        else {
            console.log(this.stack.length);
            // hide header if there is no context
            if( this.stack.length == 0) {
                this.$headerContainer.hide();
            }
        }
        
    }

    private openContext(context: Context) {
        let prev_context = this.context;
        // stack received context        
        if(this.context) {
            this.stack.push(this.context);
        }
        this.context = context;

        this.context.isReady().then( () => {
            if(prev_context && prev_context.hasOwnProperty('$container')) {
                // conainers are hidden and not detached in order to maintain the listeners
                prev_context.$container.hide();
            }
            this.$container.append(this.context.getContainer());
        });
        
        
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

            // restore previous context
            this.context = <Context>this.stack.pop();

            if(!silent) {
                console.log(this.context);
                if( this.context != undefined && this.context.hasOwnProperty('$container') ) {
                    if(has_changed && this.context.getMode() == 'view') {
                        await this.context.refresh();
                    }    
                    this.context.$container.show();
                }
                this.updateHeader();
            }
        }
    }


    /**
     * Generates a menu to be displayed inside the #sb-emnu container.
     * Items of the menu trigger _openContext calls, independantly from any existing listener
     * 
     * @param menu Menu object (JSON structure) describing the entries of each section.
     */
    public loadMenu(menu: any) {
        // generate a menu
        for(var i = 0; i < menu.length; ++i) {
            var item = menu[i];

            let $link = $('<div/>').addClass('sb-menu-button mdc-menu-surface--anchor')
            .append( UIHelper.createButton('view-filters', item.name, 'text') )
            .appendTo($('#sb-menu'));
    
            // create floating menu for filters selection
            let $menu = UIHelper.createMenu('nav-menu').addClass('sb-view-header-list-filters-menu').css({"margin-top": '48px'}).appendTo($link);
            let $list = UIHelper.createList('nav-list').appendTo($menu);

            for(var j = 0; j < menu[i].children.length; ++j) {
                var item = menu[i].children[j];

                UIHelper.createListItem(item.name + ' ' + item.entity)
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
                    $('#sb-events').trigger('_closeAll');
                    setTimeout(() => {
                        $('#sb-events').trigger('_openContext', {entity: item.entity, type: type, name: name, domain: item.domain} );
                    });
                });
            }

            UIHelper.decorateMenu($menu);
            $link.find('button').on('click', () => $menu.trigger('_toggle') );
        }



    
    }
    
}

module.exports = eQ;