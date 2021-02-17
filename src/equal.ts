import { $ } from "jquery-lib";
import { Context, Model, View, Layout } from "equal-lib";
import { WidgetInput } from "equal-widgets";



class eQ {
    
    // jquery object for components communication
    private $sbEvents:object;
    
    // the main container in which the Context views are injected
    private $container: object;
    
    // stack of Context (only current context is visible)
    private stack: Array<Context>;

    // current context
    private context;
    
    constructor(entity:string) {
        // we need to actually use the dependencies in this file in order to have them loaded in webpack
        this.$sbEvents = $();
        
        // `#sb-container` is a convention and must be present in the DOM
        this.$container = $('#sb-container');
        this.stack = [];
        this.context = null;
        this.init();
    }
    
    
    private init() {
        // $sbEvents is a jQuery object used to communicate: it allows an both internal services and external lib to connect with eQ-UI
        // $('#sb-events').trigger(event, data);
        this.$sbEvents = $('<div/>').attr('id', 'sb-events').css('display','none').appendTo('body');

        /*
            A new contexte can be requested by ngx (menu or app) or by opening a sub-objet
        */        
        this.$sbEvents.on('_openContext', (event, context) => {
            console.log('eQ: received _openContext', context);
            this.openContext(context);
        });

        this.$sbEvents.on('_closeContext', (event) => {
            console.log('eQ: received _closeContext');
            this.closeContext();
        });
        
    }
    
    private openContext(context: Context) {
        // stack received context
        if(this.context) {
            this.stack.push(this.context);
        }
        this.context = context;
        this.$container.empty();
        this.$container.append(this.context.getContainer());
    }
    
    private closeContext() {
        if(this.stack.length) {
            this.context = this.stack.pop();
            this.$container.empty();
            this.$container.append(this.context.getContainer());
        }        
    }
    
    public test() {
        console.log("eQ::test");
        $("#test").dialog();
        $( "#datepicker" ).daterangepicker();

        console.log(new WidgetInput());
        
        this.$sbEvents.trigger('_openContext', new Context('core\\User', 'list', 'default', []));               
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