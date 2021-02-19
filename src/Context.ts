import { $ } from "./jquery-lib";

import View from "./View";
import { environment } from "./environment";
export class Context {
    
    public $container: any;
    
    private view: View;
    
    constructor(entity: string, type: string, name: string, domain: any[], lang: string = environment.lang) {
        this.$container = $('<div />');
        this.view = new View(this, entity, type, name, domain, lang);
    }    
    
    public getContainer() {
        return this.$container;
    }
    
    
}

export default Context;