/*
*   TreeComponents types defitions.
*/

export interface TreeComponentInterface {
    /** 
     * Update instance with raw objet.
     * A tree component is in charge of updating itself (and sub-components, if necessary).
     */ 
    update(values: any): void;
    /** 
     * Return instance identifier.
     */ 
    getId(): number;
    /**
     * Model instance of the tree node.
     */     
    instance: any;
}

export interface RootTreeComponent extends TreeComponentInterface {
    /**
     * Load the instance of the node, according to the Type of the TreeComponent.
     * @param id 
     */
    load(id: number): void;
}

interface ComponentsMap<T> {
    // index signature
    [key: string]: any;
};

export class TreeComponent<I, T> implements TreeComponentInterface {
    // map for associating relational Model fields with their components
    protected componentsMap: ComponentsMap<T>;
    // root object of the tree Model
    public instance: any;
    // expose instance id to children components
    public getId(): number { return this.instance.id }

    constructor(instance: I) {
        this.instance = instance;
    }

    /**
     * Update local-model from raw object, and relay to sub-components, if any.
     */
    public update(values:any) {
        for(let field of Object.keys(this.instance)) {
            if(values.hasOwnProperty(field) && values[field] !== null) {
                // update local-model for simple fields
                if(!Array.isArray(values[field])) {
                    // handle dates
                    if(this.instance[field] instanceof Date) {
                        this.instance[field] = new Date(values[field]);
                    }
                    else {
                        this.instance[field] = values[field];
                    }
                }
                // update sub-objects of relational fields and relay to children
                else {
                    // pass-1 - remove items not present anymore
                    // check items in local-model against server-model
                    if(this.instance[field].length) {
                        for(let i = this.instance[field].length-1; i >= 0; --i) {
                            let line = this.instance[field][i];
                            const found = values[field].find( (item:any) => item.id == line.id);
                            // line not in server-model
                            if(!found) {
                                // remove line from local-model
                                this.instance[field].splice(i, 1);
                            }
                        }
                    }
                    // pass-2 - add missing items
                    // check items in server-model against local-model
                    for(let i = 0; i < values[field].length; ++i) {
                        let value = values[field][i];
                        const found = this.instance[field].find( (item:any) => item.id == value.id);
                        // item not in local-model
                        if(!found) {
                            // add item to local-model
                            this.instance[field].splice(i, 0, value);
                        }
                        // item is already in local-model: relay sub-object
                        else if(this.componentsMap.hasOwnProperty(field)) {
                            const subitem:any = this.componentsMap[field].find( (item:any) => item.getId() == found.id);
                            if(subitem) {
                                subitem.update(value);
                            }
                        }
                    }
                }
            }
        }
    }
}