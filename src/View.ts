import { $ } from "./jquery-lib";
import { ApiService } from "./equal-services"; /// <reference path="equal-services.ts" />

import Context from "./Context";
import Layout from "./Layout";
import Model from "./Model";



export class View {

    public context: any;
    public entity: string;
    public type: string; 
    public name: string;


    // View holds the params for search requests performed by Model
    public domain: any[];
    private order: string;
    private sort: string;    
    private start: number;
    private limit: number;
    private lang: string;

    private layout: Layout;
    private model: Model;

    private view_schema: any;
    private model_schema: any;

    // Map of fields mapping View definitions
    private fields: any;

    public $headerContainer: any;
    public $layoutContainer: any;

    /**
     * 
     * @param context 
     * @param entity    entity (package\Class) to be loaded: should be set only once (depend on the related view)
     * @param type 
     * @param name 
     * @param domain 
     */
    
    constructor(context: Context, entity: string, type: string, name: string, domain: any[], lang: string) {
        this.context = context;
        this.entity = entity;
        this.type = type; 
        this.name = name;

        this.domain = domain;        
        this.order = 'id';
        this.sort = 'asc';
        this.start = 0;
        this.limit = 25;
        this.lang = lang;

        this.$headerContainer = $('<div />');
        this.$layoutContainer = $('<div />');

        this.layout = new Layout(this);
        this.model = new Model(this);

        this.init();
    }
    
    public async init() {
        console.log('View::init');
        // inject View in parent Context object
        this.context.$container.append(this.$headerContainer).append(this.$layoutContainer);

        try {
            this.view_schema = await ApiService.getView(this.entity, this.type + '.' + this.name);
            this.model_schema = await ApiService.getSchema(this.entity);
            this.loadFields(this.view_schema);
            await this.layout.init();
            await this.model.init();


            let $form = $('<div/>')
            .append($('<form/>').append(
            $('<div/>').addClass('mdl-textfield mdl-js-textfield')
            .append($('<input type="text" />').attr('id', 'input1').addClass('mdl-textfield__input'))
            .append($('<label/>').attr('id', 'input1').addClass('mdl-textfield__label').text('Filtre'))
            ))
            .append(
                $('<button/>').addClass("mdl-button mdl-js-button").text('ok')
                .on('click', (event) => {
                    let $this = $(event.currentTarget);
                    let filter = $('#input1').val();
                    this.domain.push(['login', 'ilike', '%'+filter+'%']);
                    this.onchangeView();
                    this.layout.getSelected();
                })
            );


            this.$headerContainer.append( $form );
        }
        catch(err) {
            console.log('Unable to init view ('+this.entity+'.'+this.type+'.'+this.name+')', err);
        }
    }


    public setField(field: string, value: any) {
        this.fields[field] = value;
    }
    public getField(field: string) {
        return this.fields[field];
    }

    public setSort(sort: string) {
        this.sort = sort;
    }
    public setOrder(order: string) {
        this.order = order;
    }
    public setStart(start: number) {
        this.start = start;;
    }
    public setLimit(limit: number) {
        this.limit = limit;
    }

    public getEntity() {
        return this.entity;
    }
    public getViewSchema() {
        return this.view_schema;
    }
    public getModelSchema() {
        return this.model_schema;
    }

    public getDomain() {
        return this.domain;
    }
    public getSort() {
        return this.sort;
    }
    public getOrder() {
        return this.order;
    }
    public getStart() {
        return this.start;
    }
    public getLimit() {
        return this.limit;
    }
    public getLang() {
        return this.lang;
    }

    public getModel() {
        return this.model;
    }
    
    public getLayout() {
        return this.layout;
    }

    public getFields() {
        return this.fields;
    }



    /**
     * Generates a list holding all fields that are present in a given view (as items objects)
     * and stores it in the `fields` member
     */
	private loadFields(view_schema: any) {
        console.log('View::loadFields', view_schema);
        this.fields = {};
        var stack = [];
        // view is valid
        if(view_schema.hasOwnProperty('layout')) {    
            stack.push(view_schema['layout']);
            var path = ['groups', 'sections', 'rows', 'columns'];
            
            while(stack.length) {
                var elem = stack.pop();
                
                if(elem.hasOwnProperty('items')) {
                    for (let item of elem['items']) { 
                        if(item.type == 'field' && item.hasOwnProperty('value')){
                            this.fields[item.value] = item;
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
        console.log(this.fields);
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
    public onchangeViewModel(ids: [], values: object) {
        this.model.update(ids, values);
    }
    
    /**
     * Callback for requesting a Layout update
     * Requested from Model when a change occured in the Collection (as consequence of domain or params update)
     */
    public onchangeModel(full: boolean = false) {
        this.layout.refresh(full);
    }
    
    /**
     * Callback for requesting a Model update
     * Requested either from view: domain has been updated
     * or from layout: context has been updated (sort column, sorting order, limit, page, ...)
     */
    public onchangeView() {
        this.model.refresh();
    }
}

export default View;