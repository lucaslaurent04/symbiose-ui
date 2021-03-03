import { $ } from "./jquery-lib";

import View from "./View";
import { environment } from "./environment";
export class Context {
    
    public $container: any;
    
    private view: View;

/*

Contexts are created for a purpose.
This purpose influences the need for available actions (buttons in the header).
The purpose can be displayed to user as an indication of the currently expected action.

LIST
    (purpose = view)
    * View a list of existing objects : only possible action should be available ('create')
    (purpose = select)
    * Select a value for a field : the displayed list purpose is to select an item (other actions should not be available)
    (purpose = add)
    * Add one or more objects to a x2many fields

FORM 
    VIEW 
    (purpose = view)
    * View a single object : only available actions should be 'edit'
    EDIT 
    (purpose = create)
    * Create a new object : only available actions should be 'save' and 'cancel'
    (purpose = update)
    * Update an existing object : only available actions should be 'save' and 'cancel'

 */
 

    constructor(entity: string, type: string, name: string, domain: any[], mode: string = 'view', purpose: string = 'view', lang: string = environment.lang) {
        this.$container = $('<div />').addClass('sb-context');
        this.view = new View(entity, type, name, domain, mode, purpose, lang);
        // inject View in parent Context object
        this.$container.append(this.view.getContainer())
    }    

    public hasChanged() {
        return this.view.hasChanged();
    }

    public getEntity() {
        return this.view.entity;
    }

    public getMode() {
        return this.view.mode;
    }

    public getType() {
        return this.view.type;
    }

    public getPurpose() {
        return this.view.purpose;
    }

    public getContainer() {
        return this.$container;
    }

    public getView() {
        return this.view;
    }
    
    /**
     * Calling this method means that we need to update the model : values displayed by the context have to be re-fetched from server
     */
    public async refresh() {
        // refresh the model
        await this.view.onchangeView();
        // refresh the layout
        this.view.onchangeModel();
    }
}

export default Context;