import { $ } from "jquery-lib";
import { ApiService } from "equal-services";

import Layout from "Layout";
import Model from "Model";


export class View {

    public context: object;
    public entity: string;
    public type: string; 
    public name: string;
    public domain: array;


    private layout: Layout;
    private model: Model;

    public $headerContainer;    
    public $layoutContainer;
    
    constructor(context: object, entity: string, type: string, name: string, domain: array) {
        this.context = context;
        this.entity = entity;
        this.type = type; 
        this.name = name;
        this.domain = domain;
        
        this.init();
    }
    
    public async init() {
        console.log('View::init');
        this.$headerContainer = $('<div />');
        this.$layoutContainer = $('<div />');
        // inject View in parent Context object
        this.context.$container.append(this.$headerContainer).append(this.$layoutContainer);

        try {
            var view_schema = await ApiService.getView(this.entity, this.type + '.' + this.name);
            var model_schema = await ApiService.getSchema(this.entity);
            var model_fields = await this.getFields(view_schema);
            this.layout = new Layout(this, view_schema);
            this.model = new Model(this, model_schema, model_fields);
        }
        catch(err) {
            console.log('Unable to init view ('+this.entity+'.'+this.type+'.'+this.name+')', err);
        }
    }
    
    public getModel() {
        return this.model;
    }
    
    public getLayout() {
        return this.layout;
    }

    /**
     * Returns a list holding all fields that are present in a given view (as items objects)
     * @return array    List of fields names (related to entity of the view)
     */
	private async getFields(view_schema: object) {
        console.log('View::getFields', view_schema);
        var result = [];
        var stack = [];
        // view is valid
        if(view_schema.hasOwnProperty('layout')) {    
            stack.push(view_schema['layout']);
            var path = ['containers', 'sections', 'rows', 'columns'];
            
            while(stack.length) {
                var elem = stack.pop();
                
                if(elem.hasOwnProperty('items')) {
                    for (let item of elem['items']) { 
                        if(item.type == 'field' && item.hasOwnProperty('value')){
                            result.push(item.value);
                        }
                    }
                }
                else {
                    for (let step of path) { 
                        if(elem.hasOwnProperty(step)) {
                            for (let obj of elem[step]) { 
                                stack.push(obj);
                            }
                        }
                    }
                }
            }
        }
        console.log(result);
        return result;        
    }


    
    // handle actions
    
/*    
//1) mode edit
modifications des champs (a rpriori un par un) : relayer les changementrs depuis les Widgets via le layout => adapter la Collection (object_id, values)

//2) modification du domaine / filtres : au niveau de la vue 
 


*/
  
    /**
     * Callback for requesting a Model update
     * Requested from layout when a change occured in the widgets.
     * 
     * @param ids       array   one or more objecft identifiers
     * @param values    object   map of fields names and their related values
     */
    public onchangeViewModel(ids: array, values: object) {
        this.model.update(ids, value);
    }
    
    /**
     * Callback for requesting a Layout update
     * Requested from Model when a change occured in the Collection (as consequence of domain or params update)
     */
    public onchangeModel() {
        this.layout.refresh();
    }
    
    /**
     *
     *
     * Requested either from view: domain has been updated
     * or from layout: conttext has been updated (sort column, sorting order, limit, page, ...)
     */
    public onchangeView() {
        this.model.refresh();
    }
}

module.exports = View;