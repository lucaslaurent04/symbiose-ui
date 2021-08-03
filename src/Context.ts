import { $ } from "./jquery-lib";

import { View } from "./View";
import { environment } from "./environment";

export class Context {
    
    public $container: any;
    
    private view: View;

    // callback to be called when the context closes
    private callback: (data:any) => void;

/*

Contexts have a type and a mode, and are created for a purpose.
The purpose influences the need for available actions (buttons in the header),
and can be displayed to user as an indication of the expected action.

{type = list} (toggleable mode)
    * {purpose = view}: View a list of existing objects : only possible action should be available ('create')    
    * {purpose = select}: Select a value for a field : the displayed list purpose is to select an item (other actions should not be available)    
    * {purpose = add}: Add one or more objects to a x2many fields

{type = form}
    * {mode = view}
        * {purpose = view}: View a single object : only available actions should be 'edit'
    * {mode = edit}    
        * {purpose = create}: Create a new object : only available actions should be 'save' and 'cancel'    
        * {purpose = update}: Update an existing object : only available actions should be 'save' and 'cancel'

 */
 

    constructor(entity: string, type: string, name: string, domain: any[], mode: string = 'view', purpose: string = 'view', lang: string = environment.lang, callback: (data:any) => void = (data:any=null) => {}, config: any = null) {
        this.$container = $('<div />').addClass('sb-context');

        this.callback = callback;

        this.view = new View(entity, type, name, domain, mode, purpose, lang, config);
        // inject View in parent Context object
        this.$container.append(this.view.getContainer())
    }    

    public close(data:any) {
        console.log('close', data);
        this.$container.remove();

        // callbacks are used to relay events across contexts (select, add, ...)
        if( ({}).toString.call(this.callback) === '[object Function]' ) {
            this.callback(data);
        }
        
    }

    /**
     * 
     * @returns Promise A promise that resolves when the View will be fully rendered
     */
    public isReady() {
        return this.view.isReady();
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
    
    public getName() {
        return this.view.name;
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
    }
}

export default Context;