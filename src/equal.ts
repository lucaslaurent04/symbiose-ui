import { $ } from "jquery-lib";
import { Model, View, Layout } from "equal-lib";
import { WidgetInput } from "equal-widgets";


class eQ {
    
    // jquery object for components communication
    private $sbEvents:object;
    
    constructor(entity:string) {
        // we need to actually use the dependencies in this file in order to have them loaded in webpack
        this.$sbEvents = $();

    }
    
    
    public static init() {
        // this allows an both internal services and external lib to connect with eQ-UI
        // $('#sb-events').trigger(event, data);
        this.$sbEvents = $('<div/>').attr('id', 'sb-events').css('display','none');
        $('body').append( this.$sbEvents );
        
        this.$sbEvents.on('_newContext', (event, data) => {
            console.log('eQ: received _newContext', data);
        });
        
    }
    
    public static test() {
        console.log($());
        $("#test").dialog();
        $( "#datepicker" ).datepicker();
        console.log("static method test");
        console.log(new WidgetInput());
        
        var view = new View('core\\User', 'form', 'default', []);
        var layout = new Layout(view);
    }

}

module.exports = eQ;