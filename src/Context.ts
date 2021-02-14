import { $ } from "jquery-lib";

import View from "View";

export class Context {
    
    private $container: object;
    
    private view: View;
    
    constructor(entity: string, type: string, name: string, domain: array) {
        this.$container = $('<div />');
        this.view = new View(this, entity, type, name, domain);
    }
    
    
    public getContainer() {
        return this.$container;
    }
    
    
}

module.exports = Context;