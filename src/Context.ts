import { $ } from "./jquery-lib";

import View from "./View";
import { environment } from "./environment";
export class Context {
    
    public $container: any;
    
    private view: View;
    
    constructor(entity: string, type: string, name: string, domain: any[], mode: string = 'view', lang: string = environment.lang) {
        this.$container = $('<div />').addClass('sb-view');
        this.view = new View(this, entity, type, name, domain, mode, lang);
    }    
    
    public getContainer() {
        return this.$container;
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