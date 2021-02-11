import * as $ from "jquery";
import { ApiService } from "equal-services";

import View from "View";
import Model from "Model";


export class Layout {

    private domain: array;
    private layout: string;

    private fields: array;          // the list of the fields involved in the layout

    private view: View;             // parent view the layout belongs to
    private model: Model;           // collection of objects involved in the layout
    
    constructor(view:View) {
        this.view = view;
        this.model = new Model(this.view.entity);
        // this.domain = domain;
    }

    private async load() {
        try {
            this.layout = await ApiService.getView(this.view.entity, this.view.type + this.view.name);
            // load the list of fields that must be requested for the layout
            this.fields = await ApiService.getFields(this.view.entity, this.view.type + this.view.name);            
        }
        catch(err) {
            console.log('something went wrong ', err);
        }
        return layout;
    }
    
    private layout() {
    }
}

module.exports = Layout;