import { $ } from "./jquery-lib";
import { Context, Model, View, Layout } from "./equal-lib";

// We use MDC (material design components)
// @see https://github.com/material-components/material-components-web/blob/master/docs/getting-started.md

class eQ {
    
    // jquery object for components communication
    private $sbEvents:any;
    
    // the main container in which the Context views are injected
    private $container: any;
    
    // stack of Context (only current context is visible)
    private stack: Array<Context>;

    // current context
    private context:Context;
    
    constructor(entity:string) {
        // we need to actually use the dependencies in this file in order to have them loaded in webpack
        this.$sbEvents = $();
        
        // `#sb-container` is a convention and must be present in the DOM
        this.$container = $('#sb-container');
        this.context = <Context>{};
        this.stack = [];
        this.init();
    }
    
    
    private init() {
        // $sbEvents is a jQuery object used to communicate: it allows an both internal services and external lib to connect with eQ-UI
        // $('#sb-events').trigger(event, data);
        this.$sbEvents = $('<div/>').attr('id', 'sb-events').css('display','none').appendTo('body');

        /*
            A new contexte can be requested by ngx (menu or app) or by opening a sub-objet
        */        
        this.$sbEvents.on('_openContext', (event:any, context:Context) => {
            console.log('eQ: received _openContext', context);
            this.openContext(context);
        });

        this.$sbEvents.on('_closeContext', (event:any) => {
            console.log('eQ: received _closeContext');
            this.closeContext();
        });
        
    }
    
    private async openContext(context: Context) {
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
    }
    
    private async closeContext() {
        if(this.stack.length) {
            // destroy current context
            this.context.$container.remove();
            // restore previous context
            this.context = <Context>this.stack.pop();
            await this.context.refresh();
            this.context.$container.show();
        }        
    }
    
    public test() {
        console.log("eQ::test");
        $("#test").dialog();
        $( "#datepicker" ).daterangepicker();

        // console.log(new WidgetInput());
        
        this.$sbEvents.trigger('_openContext', new Context('core\\User', 'form', 'default', []));
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