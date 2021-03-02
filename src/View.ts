import { $ } from "./jquery-lib";
import { UIHelper, MDCMenu } from './material-lib';

import { ApiService } from "./equal-services";

import Context from "./Context";
import Layout from "./Layout";
import Model from "./Model";



export class View {

    public entity: string;
    public type: string; 
    public name: string;

    // Mode under which the view is to be displayed ('View' [default], or 'edit')
    public mode;
    // Purpose for which the view is to be displayed (this impacts the action buttons in the header)
    public purpose;

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

    // Map of fields mapping their View definitions
    private view_fields: any;
    // Map of fields mapping their Model definitions
    private model_fields: any;

    // Arrray of available filters from View definition
    private filters: any;


    // List of currently selected filters from View definition (for filterable types)    
    private applied_filters_ids: any[];

    // When type is list, one or more objects might be selected
    private selected_ids: any[];

    public $container: any;
    
    public $headerContainer: any;
    public $layoutContainer: any;
    public $footerContainer: any;

    /**
     * 
     * @param context 
     * @param entity    entity (package\Class) to be loaded: should be set only once (depend on the related view)
     * @param type 
     * @param name 
     * @param domain 
     */    
    constructor(entity: string, type: string, name: string, domain: any[], mode: string, purpose:string, lang: string) {
        this.entity = entity;
        this.type = type; 
        this.name = name;

        this.mode = mode;
        this.purpose = purpose;

        this.domain = domain;        
        this.order = 'id';
        this.sort = 'asc';
        this.start = 0;
        this.limit = 25;
        this.lang = lang;

        this.selected_ids = [];

        this.$container = $('<div />').addClass('sb-view');

        this.$headerContainer = $('<div />').addClass('sb-view-header').appendTo(this.$container);
        this.$layoutContainer = $('<div />').addClass('sb-view-layout').appendTo(this.$container);
        this.$footerContainer = $('<div />').addClass('sb-view-footer').appendTo(this.$container);

        this.filters = {};
        this.applied_filters_ids = [];

        this.layout = new Layout(this);
        this.model = new Model(this);

        this.init();
    }

    public getContainer() {
        return this.$container;
    }
    
    public async init() {
        console.log('View::init');

        try {
            this.view_schema = await ApiService.getView(this.entity, this.type + '.' + this.name);
            this.model_schema = await ApiService.getSchema(this.entity);
            this.loadViewFields(this.view_schema);
            this.loadModelFields(this.model_schema);            
            if(this.view_schema.hasOwnProperty("filters")) {
                for(let filter of this.view_schema.filters) {
                    this.filters[filter.id] = filter;
                }
            }
            await this.layout.init();
            await this.model.init();

            if(['list', 'kanban'].indexOf(this.type) >= 0) {
                this.$layoutContainer.addClass('sb-view-layout-list');
                this.layoutListHeader();
                this.layoutListFooter();
            }
            if(['form'].indexOf(this.type) >= 0) {
                this.$layoutContainer.addClass('sb-view-form-layout');
                this.layoutFormHeader();
            }            
        }
        catch(err) {
            console.log('Unable to init view ('+this.entity+'.'+this.type+'.'+this.name+')', err);
        }
    }



    public setField(field: string, value: any) {
        this.view_fields[field] = value;
    }
    public getField(field: string) {
        return this.view_fields[field];
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

    /**
     * Applicable domain for the View corresponds to initial domain (from  parent Context) with additional filters currently applied on the View
     */
    public getDomain() {
        console.log('View::getDomain', this.domain, this.applied_filters_ids);
        let domain = [...this.domain];
        
        for(let filter_id of this.applied_filters_ids) {
            domain.push(this.filters[filter_id].clause);
        } 
        console.log('result', domain);
        return domain;
    }
    public getSort() {
        return this.sort;
    }
    public getOrder() {
        return this.order;
    }
    public getStart() {
        return +this.start;
    }
    public getLimit() {
        return +this.limit;
    }
    public getLang() {
        return this.lang;
    }
    public getTotal() {
        return +this.getModel().getTotal();
    }

    public getModel() {
        return this.model;
    }
    
    public getLayout() {
        return this.layout;
    }

    public getViewFields() {
        return this.view_fields;
    }

    public getModelFields() {
        return this.model_fields;
    }

    public setMode(mode: string) {
        this.mode = mode;
    }

    public getMode() {
        return this.mode;
    }


    /**
     * Generates a map holding all fields that are present in a given view (as items objects)
     * and stores it in the `view_fields` member
     */
	private loadViewFields(view_schema: any) {
        console.log('View::loadFields', view_schema);
        this.view_fields = {};
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
                            this.view_fields[item.value] = item;
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
    }

    /**
     * Generates a map holding all fields in the current model schema
     * and stores it in the `model_fields` member
     */
	private loadModelFields(model_schema: any) {
        console.log('View::loadVModelFields', model_schema);
        this.model_fields = model_schema.fields;
    }


    private layoutListFooter() {
        /*
        let $footer = UIHelper.createPagination().addClass('sb-view-header-list-pagination');

        $footer.find('.pagination-total')
        .append( $('<span class="sb-view-header-list-pagination-start"></span>') ).append( $('<span />').text('-') )
        .append( $('<span class="sb-view-header-list-pagination-end"></span>') ).append( $('<span />').text(' / ') )
        .append( $('<span class="sb-view-header-list-pagination-total"></span>') );

        $footer.find('.pagination-navigation')
        .append(
            UIHelper.createButton('', '', 'icon', 'first_page').addClass('sb-view-header-list-pagination-first_page') 
            .on('click', (event: any) => {
                this.setStart(0);
                this.onchangeView();
            })
        )
        .append(
            UIHelper.createButton('', '', 'icon', 'chevron_left').addClass('sb-view-header-list-pagination-prev_page')
            .on('click', (event: any) => {
                this.setStart( Math.max(0, this.getStart() - this.getLimit()) );
                this.onchangeView();
            })
        )
        .append(
            UIHelper.createButton('', '', 'icon', 'chevron_right').addClass('sb-view-header-list-pagination-next_page')
            .on('click', (event: any) => {
                let new_start:number = Math.min( this.getTotal()-1, this.getStart() + this.getLimit() );
                console.log('new start', new_start, this.getStart(), this.getLimit());
                this.setStart(new_start);
                this.onchangeView();
            })
        )
        .append(
            UIHelper.createButton('', '', 'icon', 'last_page').addClass('sb-view-header-list-pagination-last_page')
            .on('click', (event: any) => {
                let new_start:number = this.getTotal()-1;
                this.setStart(new_start);
                this.onchangeView();
            })
        );

        let $select = UIHelper.createPaginationSelect('', '', [1, 2, 5, 10, 20, 100], 10).addClass('sb-view-header-list-pagination-limit_select');
        
        $footer.find('.pagination-rows-per-page')
        .append(UIHelper.createIcon('list'))
        .append($select);

        $select.find('input').on('change', (event: any) => {
            let $this = $(event.currentTarget);
            this.setLimit(<number>$this.val());
            this.setStart(0);
            this.onchangeView();
        });

        this.$footerContainer.append( $footer );
        */
    }

    private layoutListHeader() {
        let $elem = $('<div />').addClass('sb-view-header-list');

        let $level1 = $('<div />').addClass('sb-view-header-list-actions').appendTo($elem);
        let $level2 = $('<div />').addClass('sb-view-header-list-navigation').appendTo($elem);


        let $actions_set = $('<div />').addClass('sb-view-header-list-actions-set').appendTo($level1);

        switch(this.purpose) {
            case 'view':
                $actions_set
                .append( 
                    UIHelper.createButton('action-edit', 'Créer', 'raised')
                    .on('click', () => {
                        $('#sb-events').trigger('_openContext', new Context(this.entity, 'form', 'default', [], 'edit', 'create'));
                    })
                );        
                break;
            case 'select':
                $actions_set
                .append( 
                    UIHelper.createButton('action-select', 'Sélectionner', 'raised', 'check')
                    .on('click', () => {
                        // $('#sb-events').trigger('_openContext', new Context(this.entity, this.type, 'default', this.domain, 'edit', 'update'));
                    })
                );        
                break;
            case 'add':
                $actions_set
                .append( 
                    UIHelper.createButton('action-add', 'Ajouter', 'raised', 'check')
                    .on('click', () => {
                        // $('#sb-events').trigger('_openContext', new Context(this.entity, this.type, 'default', this.domain, 'edit', 'update'));
                    })
                );
                break;        
        }




        // container for holding chips of currently applied filters
        let $filters_set = $('<div />').addClass('sb-view-header-list-filters-set mdc-chip-set').attr('role', 'grid');

        // floating menu for filters selection
        let $filters_menu = $('<ul/>').attr('role', 'menu').addClass('mdc-list');
        // button for displaying the filters menu
        let $filters_button = $('<div/>').addClass('sb-view-header-list-filters mdc-menu-surface--anchor')
        .append( UIHelper.createButton('view-filters', 'filtres', 'mini-fab', 'filter_list') )
        .append( $('<div/>').addClass('sb-view-header-list-filters-menu mdc-menu mdc-menu-surface').css({"margin-top": '48px'}).append($filters_menu) );
        
        for(let filter_id in this.filters) {
            let filter = this.filters[filter_id];

            UIHelper.createListItem(filter.description)
            .appendTo($filters_menu)
            .attr('id', filter_id)
            .on('click', (event) => {
                let $this = $(event.currentTarget);                
                $filters_set.append(
                    UIHelper.createChip(filter.description)
                    .attr('id', filter_id)
                    .on('click', (event) => {
                        let $this = $(event.currentTarget)
                        let index = this.applied_filters_ids.indexOf($this.attr('id'));
                        if (index > -1) {
                            this.applied_filters_ids.splice(index, 1);
                            this.setStart(0);
                            this.onchangeView();    
                        }        
                        $this.remove();
                    })
                );
                this.applied_filters_ids.push($this.attr('id'));
                this.setStart(0);
                this.onchangeView();
            });
        }
        let filters_menu = new MDCMenu($filters_button.find('.mdc-menu')[0]);        
        $filters_button.find('button').on('click', () => {
            filters_menu.open = !$filters_button.find('.mdc-menu').hasClass('mdc-menu-surface--open');
        });

// todo : create a createMenu helper
        // floating menu for fields selection
        let $fields_toggle_menu = $('<ul/>').attr('role', 'menu').addClass('mdc-list');


        // button for displaying the fields menu
        let $fields_toggle_button = $('<div/>').addClass('sb-view-header-list-fields_toggle mdc-menu-surface--anchor')        
        .append( UIHelper.createButton('view-filters', 'fields', 'mini-fab', 'more_vert') )
        .append( $('<div/>').addClass('sb-view-header-list-fields_toggle-menu mdc-menu mdc-menu-surface').append($fields_toggle_menu) );

        $.each(this.getViewSchema().layout.items, (i, item) => {            
            let label = (item.hasOwnProperty('label'))?item.label:item.value.charAt(0).toUpperCase() + item.value.slice(1);
            let visible = (item.hasOwnProperty('visible'))?item.visible:true;

            UIHelper.createListItemCheckbox('sb-fields-toggle-checkbox-'+item.value, label)
            .appendTo($fields_toggle_menu)
            .find('input')
            .on('change', (event) => {
                let $this = $(event.currentTarget);
                let def = this.getField(item.value);
                def.visible = $this.prop('checked');
                console.log(def);
                this.setField(item.value, def);
                this.onchangeModel(true);
            })
            .prop('checked', visible);

        });
        let fields_toggle_menu = new MDCMenu($fields_toggle_button.find('.mdc-menu')[0]);        
        $fields_toggle_button.find('button').on('click', () => {
            fields_toggle_menu.open = !$fields_toggle_button.find('.mdc-menu').hasClass('mdc-menu-surface--open');
        });    



        // pagination controls
        let $pagination = UIHelper.createPagination().addClass('sb-view-header-list-pagination');

        $pagination.find('.pagination-total')
        .append( $('<span class="sb-view-header-list-pagination-start"></span>') ).append( $('<span />').text('-') )
        .append( $('<span class="sb-view-header-list-pagination-end"></span>') ).append( $('<span />').text(' / ') )
        .append( $('<span class="sb-view-header-list-pagination-total"></span>') );

        $pagination.find('.pagination-navigation')
        .append(
            UIHelper.createButton('', '', 'icon', 'first_page').addClass('sb-view-header-list-pagination-first_page') 
            .on('click', (event: any) => {
                this.setStart(0);
                this.onchangeView();
            })
        )
        .append(
            UIHelper.createButton('', '', 'icon', 'chevron_left').addClass('sb-view-header-list-pagination-prev_page')
            .on('click', (event: any) => {
                this.setStart( Math.max(0, this.getStart() - this.getLimit()) );
                this.onchangeView();
            })
        )
        .append(
            UIHelper.createButton('', '', 'icon', 'chevron_right').addClass('sb-view-header-list-pagination-next_page')
            .on('click', (event: any) => {
                let new_start:number = Math.min( this.getTotal()-1, this.getStart() + this.getLimit() );
                console.log('new start', new_start, this.getStart(), this.getLimit());
                this.setStart(new_start);
                this.onchangeView();
            })
        )
        .append(
            UIHelper.createButton('', '', 'icon', 'last_page').addClass('sb-view-header-list-pagination-last_page')
            .on('click', (event: any) => {
                let new_start:number = this.getTotal()-1;
                this.setStart(new_start);
                this.onchangeView();
            })
        );

        let $select = UIHelper.createPaginationSelect('', '', [1, 2, 5, 10, 25, 50, 100], 10).addClass('sb-view-header-list-pagination-limit_select');
        
        $pagination.find('.pagination-rows-per-page')
        .append($select);

        $select.find('input').on('change', (event: any) => {
            let $this = $(event.currentTarget);
            this.setLimit(<number>$this.val());
            this.setStart(0);
            this.onchangeView();
        });

        


        // attach elements to header toolbar
        $level2.append( $filters_button );
        $level2.append( $filters_set );        
        $level2.append( $pagination );
        $level2.append( $fields_toggle_button );

        this.$headerContainer.append( $elem );
    }

    private layoutListRefresh(full: boolean = false) {
        // update footer indicators (total count)        
        let limit: number = this.getLimit();
        let total: number = this.getTotal();
        let start: number = this.getStart() + 1;
        let end: number = start + limit - 1;
        end = Math.min(end, start + this.model.ids().length - 1);
        console.log('res', total, start, end, limit);
        this.$container.find('.sb-view-header-list-pagination-total').html(total);
        this.$container.find('.sb-view-header-list-pagination-start').html(start);
        this.$container.find('.sb-view-header-list-pagination-end').html(end);

        this.$container.find('.sb-view-header-list-pagination-first_page').prop('disabled', !(start > limit));
        this.$container.find('.sb-view-header-list-pagination-prev_page').prop('disabled', !(start > limit));
        this.$container.find('.sb-view-header-list-pagination-next_page').prop('disabled', !(start <= total-limit));
        this.$container.find('.sb-view-header-list-pagination-last_page').prop('disabled', !(start <= total-limit));


        let $action_set = this.$container.find('.sb-view-header-list-actions-set');
        $action_set.find('.sb-view-header-list-actions-selected').remove();

        if(this.selected_ids.length > 0) {
            let count = this.selected_ids.length;        

            let $selected_menu = $('<ul/>').attr('role', 'menu').addClass('mdc-list');

            let $fields_toggle_button = $('<div/>').addClass('sb-view-header-list-actions-selected mdc-menu-surface--anchor')        
            .append( UIHelper.createButton('action-selected', count+' sélectionnés', 'outlined') )
            .append( $('<div/>').addClass('mdc-menu mdc-menu-surface').css({"margin-top": '48px', "width": "100%"}).append($selected_menu) );

            UIHelper.createListItem('Modifier', 'edit')
            .appendTo($selected_menu)
            .on('click', (event) => {
                let selected_id = this.selected_ids[0];
                $('#sb-events').trigger('_openContext', new Context(this.entity, 'form', 'default', ['id', '=', selected_id], 'edit', 'update'));
            });

            UIHelper.createListItem('Supprimer', 'delete')
            .appendTo($selected_menu)
            .on('click', (event) => {

            });

            let fields_toggle_menu = new MDCMenu($fields_toggle_button.find('.mdc-menu')[0]);        
            $fields_toggle_button.find('button').on('click', () => {
                fields_toggle_menu.open = !$fields_toggle_button.find('.mdc-menu').hasClass('mdc-menu-surface--open');
            });  

            $action_set.append($fields_toggle_button);
        }


    }

    private layoutFormHeader() {
        // container for holding chips of currently applied filters
        let $actions_set = $('<div />').addClass('sb-view-form-header-actions');

        switch(this.mode) {
            case 'view':
                $actions_set
                .append( 
                    UIHelper.createButton('action-edit', 'Modifier', 'raised')
                    .on('click', () => {
                        $('#sb-events').trigger('_openContext', new Context(this.entity, this.type, 'default', this.domain, 'edit', 'update'));
                    })
                )
                .append( 
                    UIHelper.createButton('action-create', 'Créer', 'text')
                    .on('click', async () => {
                        // create a new object
                        let object = await ApiService.create(this.entity);
                        // request a new Context for editing the new object
                        $('#sb-events').trigger('_openContext', new Context(this.entity, this.type, 'default', [['id', '=', object.id], ['state', '=', 'draft']], 'edit', 'create'));
                    })
                );
                break;
            case 'edit':
                $actions_set
                .append( 
                    UIHelper.createButton('action-create', 'Sauver', 'raised')
                    .on('click', async () => {
                        let objects = this.model.get();
                        let object = objects[0];
                        await ApiService.update(this.entity, [object['id']], object);
                        $('#sb-events').trigger('_closeContext', true);
                    })
                )
                .append( 
                    UIHelper.createButton('action-cancel', 'Annuler', 'outlined')
                    .on('click', async () => {
                        $('#sb-events').trigger('_closeContext');
                    })
                );
                break;
        }
    
        // attach elements to header toolbar
        this.$headerContainer.append( $actions_set );
    }


    private layoutRefresh(full: boolean = false) {
        this.layout.refresh(full);
        if(['list', 'kanban'].indexOf(this.type) >= 0) {
            this.layoutListRefresh();
        }
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
    public onchangeViewModel(ids: Array<any>, values: object) {
        this.model.change(ids, values);
        // model has changed : forms need to re-check the visibility attributes                
        this.onchangeModel();
    }
    
    /**
     * Callback for requesting a Layout update: the widgets in the layout need to be refreshed.
     * Requested from Model when a change occured in the Collection (as consequence of domain or params update)
     * If `full`is set to true, then the layout is re-generated
     */
    public onchangeModel(full: boolean = false) {
        console.log('View::onchangeModel', full, this.model.get());
        this.layoutRefresh(full);
    }
    
    /**
     * Callback for requesting a Model update
     * Requested either from view: domain has been updated
     * or from layout: context has been updated (sort column, sorting order, limit, page, ...)
     */
    public async onchangeView() {
        // reset selection
        this.onchangeSelection([]);
        await this.model.refresh();
    }

    public onchangeSelection(selection: Array<any>) {
        console.log('selection updated', selection);
        this.selected_ids = selection;
        this.layoutListRefresh();
    }
}

export default View;