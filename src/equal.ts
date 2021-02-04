import { $ } from "jquery-lib";
import { Model, View } from "equal-lib";
import { WidgetInput } from "equal-widgets";


class eQ {
        
    
    constructor(entity:string) {
        // we need to actually use the dependencies in this file in order to have them loaded in webpack
        
        new Model(entity);

    }
    
    
    public static test() {
        console.log($());
        $("#test").dialog();
        $( "#datepicker" ).datepicker();
        console.log("static method test");
        console.log(new WidgetInput());
    }


    public static Collection(entity:string) {
        return new Model(entity);
    }

}

module.exports = eQ;