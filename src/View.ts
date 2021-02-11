import * as $ from "jquery";

export class View {

    public entity: string;
    public type: string;
    public name: string;
    
    public domain: array;
    
    constructor(entity: string, type: string, name: string, domain: array) {
        this.domain = domain;
        this.entity = entity;
        this.type = type;
        this.name = name;
    }
}

module.exports = View;