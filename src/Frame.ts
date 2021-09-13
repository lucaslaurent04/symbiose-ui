import { $ } from "./jquery-lib";

import { Context, Domain } from "./equal-lib";
import { ApiService, TranslationService } from "./equal-services";

import { UIHelper } from './material-lib';

import { environment } from "./environment";


/**
 * Frames handle a stack of contexts. They're in charge of their header.
 * 
 */
export class Frame {
    
    private eq: any;

    private $headerContainer: any;

    // temporary var for computing width of rendered strings
    private $canvas: any;

    // stack of Context (only current context is visible)
    private stack: Array<Context>;

    // root context
    private context:Context;

    // DOM selector of the element to which current Frame relates
    private domContainerSelector:string;

    constructor(eq:any, domContainerSelector:string='#sb-container') {        
        this.eq = eq;
        this.context = <Context>{};
        this.stack = [];
        // As a convention, DOM element referenced by given selector must be present in the document.
        this.domContainerSelector = domContainerSelector;
        this.init();
    }
        
    private async init() {        
        // trigger header re-draw when available horizontal space changes
        var resize_debounce:any;
        $(window).on('resize', () => { 
            clearTimeout(resize_debounce);
            resize_debounce = setTimeout( async () => this.updateHeader(), 100);             
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

    /**
     * Refresh the header breadcrumb, according to available space.
     * .sb-container-header is managed automatically and shows the breadcrumb of the stack
     * 
     * @returns 
     */
    private async updateHeader() {
        console.log('update header');        

        if($(this.domContainerSelector).find('.sb-container-header').length == 0) {            
            this.$headerContainer = $('<div/>').addClass('sb-container-header').prependTo($(this.domContainerSelector));
        }

        if( this.stack.length == 0 || !this.context.hasOwnProperty('$container')) {
            // hide header if there is no context
            this.$headerContainer.empty().hide();
            return;
        }

        // make sure header is visible
        this.$headerContainer.show();

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
        if(prepend_contexts_count > 0) {
            $('<span> › </span>').css({'margin': '0 10px'}).appendTo($elem);
        }            
        $('<span>'+current_purpose_string+'</span>').appendTo($elem);
        // if(this.stack.length > 1) {
        // for integration, we need to let user close any context
        if(true) {
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
     * This method can be called by any child or sub-child (view, layout, widgets)
     * 
     * @param config 
     */
    public async openContext(config: any) {
        config.target = this.domContainerSelector;
        this.eq.open(config);
    }

    /**
     * Instanciate a new context and push it on the contexts stack.
     * Only eQ object should call this method.
     * 
     * @param config 
     */
    public async _openContext(config: any) {
        console.log('Frame: received _openContext', config);
        // extend default params with received config
        config = {...{
            entity:     '', 
            type:       'list', 
            name:       'default', 
            domain:     [], 
            mode:       'view',             // view, edit
            purpose:    'view',             // view, select, add, create
            lang:       environment.lang,
            callback:   null
        }, ...config};

        // create a draft object if required: Edition is based on asynchronous creation: a draft is created (or recylcled) and is turned into an instance if 'update' action is triggered.
        if(config.purpose == 'create') {
            console.log('requesting dratf object');
            let defaults    = await this.getNewObjectDefaults(config.entity, config.domain);
            let object      = await ApiService.create(config.entity, defaults);
            config.domain   = [['id', '=', object.id], ['state', '=', 'draft']];    
        }

        let context: Context = new Context(this, config.entity, config.type, config.name, config.domain, config.mode, config.purpose, config.lang, config.callback, config);

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
            $(this.domContainerSelector).append(this.context.getContainer());
            // relay event to the outside
            $(this.domContainerSelector).show().trigger('_open', [{context: config}]);
            this.updateHeader();            
        });

    }


    public closeAll() {
        // close all contexts silently
        while(this.stack.length) {
            this.closeContext(true);
        }
    };

    /**
     * Handler for request for closing current context (top of stack).
     * When closing, a context might transmit some value (its the case, for instance, when selecting one or more records for m2m or o2m fields).
     * 
     * @param silent do not show the pop-ed context and do not refresh the header 
     */
    public async closeContext(data:any = null, silent: boolean = false) {

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

            // if we closed the lastest Context from the stack, relay data to the outside
            if(!this.stack.length) {
                console.log('stack empty: closing');
                $(this.domContainerSelector).hide().trigger('_close', [ data ]);
            }
        }
    }
    
}

export default Frame;