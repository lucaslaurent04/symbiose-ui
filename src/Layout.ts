import { $ } from "jquery-lib";
import { ApiService } from "equal-services";

import View from "View";
import Model from "Model";

/*
    There are two main braches of Layouts depending on what is to be displayed:
        - 1 single object : Form 
        - several objects : List (grid, kanban, graph)
        
    Forms can be displayed in two modes : 'view' or 'edit'
    Lists can be editable on a Cell basis (using Widgets)
*/

export class Layout {

    private schema: object;

    private view: View;             // parent view the layout belongs to
    
    constructor(view:View, schema: object) {
        this.view = view;
        this.schema = schema;

    }

    public async init() {
        try {
            this.refresh();    
        }
        catch(err) {
            console.log('something went wrong ', err);
        }        
    }

    // refresh layout
    public refresh() {
        console.log('Layout::refresh');
        var html = '';
        html = JSON.stringify(this.view.model.get());

        this.view.$layoutContainer.empty().append($('<div />').html(html));
    }
    
}

module.exports = Layout;