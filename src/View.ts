import { $ } from "./jquery-lib";
import { UIHelper } from './material-lib';
import { environment } from "./environment";

import { ApiService, TranslationService } from "./equal-services";

import Domain from "./Domain";

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

    private translation: any;
    private view_schema: any;
    private model_schema: any;

    // Map of fields mapping their View definitions
    private view_fields: any;
    // Map of fields mapping their Model definitions
    private model_fields: any;

    // Map of available filters from View definition mapping filters id with their definition
    private filters: any;

    // config object for setting display of list controls and action buttons
    private config: any;

    // List of currently selected filters from View definition (for filterable types)    
    private applied_filters_ids: any[];

    // When type is list, one or more objects might be selected
    private selected_ids: any[];

    private is_ready_promise: any;

    public $container: any;
    
    public $headerContainer: any;
    public $layoutContainer: any;
    public $footerContainer: any;



    /**
     * 
     * @param entity    entity (package\Class) to be loaded: should be set only once (depend on the related view)
     * @param type 
     * @param name 
     * @param domain 
     * @param mode
     * @param purpose
     * @param lang
     * @param config
     */    
    constructor(entity: string, type: string, name: string, domain: any[], mode: string, purpose: string, lang: string, config: any = null) {
        this.entity = entity;
        this.type = type; 
        this.name = name;
        this.is_ready_promise = $.Deferred();

        // default config
        this.config = {
            show_actions: true,
            show_filter: true,
            show_pagination: true,
            // list of actions available for applying to a selection (relational fields widgets define their own actions)
            selection_actions: [
                {
                    title: 'SB_ACTIONS_BUTTON_INLINE_UPDATE',
                    icon:  'dynamic_form',
                    handler: (event:any, selection:any) => this.actionListInlineEdit(event, selection)
                },
                {
                    title: 'SB_ACTIONS_BUTTON_UPDATE',
                    icon:  'edit',
                    handler: (event:any, selection:any) => {
                        let selected_id = selection[0];
                        $('#sb-events').trigger('_openContext', {entity: this.entity, type: 'form', name: 'default', domain: ['id', '=', selected_id], mode: 'edit', purpose: 'update'});
                    }
                },
                {
                    title: 'SB_ACTIONS_BUTTON_ARCHIVE',
                    icon:  'archive',
                    handler: (event:any, selection:any) => {
                        let selected_id = this.selected_ids[0];
// #todo
                    }
                },
                {
                    title: 'SB_ACTIONS_BUTTON_DELETE',
                    icon:  'delete',
                    handler: (event:any, selection:any) => {
                        let selected_id = this.selected_ids[0];
// #todo
                    }
                }
            ]     
        };

        this.setConfig(config);

        this.mode = mode;
        this.purpose = purpose;

        this.domain = domain;
        this.order = 'id';
        this.sort = 'asc';
        this.start = 0;
        this.limit = 25;
        this.lang = lang;

        this.selected_ids = [];


        this.filters = {};
        this.applied_filters_ids = [];

        this.$container = $('<div />').addClass('sb-view').hide();

        this.$headerContainer = $('<div />').addClass('sb-view-header').appendTo(this.$container);
        this.$layoutContainer = $('<div />').addClass('sb-view-layout').appendTo(this.$container);
        this.$footerContainer = $('<div />').addClass('sb-view-footer').appendTo(this.$container);



        this.layout = new Layout(this);
        this.model = new Model(this);

        this.init();
    }
   
    private async init() {
        console.log('View::init');
        try {
    
            this.translation = await ApiService.getTranslation(this.entity, environment.lang);
            this.view_schema = await ApiService.getView(this.entity, this.type + '.' + this.name);
            this.model_schema = await ApiService.getSchema(this.entity);
            this.loadViewFields(this.view_schema);
            this.loadModelFields(this.model_schema);

            if(this.view_schema.hasOwnProperty("filters")) {
                for(let filter of this.view_schema.filters) {
                    this.filters[filter.id] = filter;
                }
            }

            // if view schema specifies a domain, merge it with domain given in constructor
            if(this.view_schema.hasOwnProperty("domain")) {
                // domain attribute is either a string or an array 
                let domain = eval(this.view_schema.domain);                
                // merge domains
                let tmpDomain = new Domain(this.domain);
                tmpDomain.merge(new Domain(domain));
                this.domain = tmpDomain.toArray();
            }

            if(['list', 'kanban'].indexOf(this.type) >= 0) {
                this.$layoutContainer.addClass('sb-view-layout-list');
                this.layoutListHeader();
                this.layoutListFooter();
            }
            if(['form'].indexOf(this.type) >= 0) {
                this.$layoutContainer.addClass('sb-view-layout-form');
                this.layoutFormHeader();
            }

            await this.layout.init();
            await this.model.init();

        }
        catch(err) {
            console.log('Unable to init view ('+this.entity+'.'+this.type+'.'+this.name+')', err);
        }

        this.is_ready_promise.resolve();

        this.$container.show();
        console.log('View::init - end');
    }


    private deepCopy(obj:any):any {
        var copy:any;
    
        // Handle the 3 simple types, and null or undefined
        if (null == obj || "object" != typeof obj) return obj;
    
        // Handle Date
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }
    
        // Handle Array
        if (obj instanceof Array) {
            copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = this.deepCopy(obj[i]);
            }
            return copy;
        }
    
        // Handle Object
        if (obj instanceof Object) {
            copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = this.deepCopy(obj[attr]);
            }
            return copy;
        }
    
        throw new Error("Unable to copy obj! Its type isn't supported.");
    }

    public isReady() {
        return this.is_ready_promise;
    }

    public setConfig(config:any) {
        // override config options, if other are given
        if(config) {
            this.config = {...this.config, ...config};
        }
    }
    public setMode(mode: string) {
        this.mode = mode;
    }

    // either the model or the view itself can be marked as change (to control the parent context refresh)
    public hasChanged() {
        return this.model.hasChanged();
    }

    public getContainer() {
        return this.$container;
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

    public getType() {
        return this.type;
    }

    public getName() {
        return this.name;
    }

    public getTranslation() {
        return this.translation;
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

    public getMode() {
        return this.mode;
    }

    public getPurpose() {
        return this.purpose;
    }

    /**
     * Return a Map of layout fields items mapping names with their definition
     */
    public getViewFields() {
        return this.view_fields;
    }

    public getModelFields() {
        return this.model_fields;
    }



    /**
     * Generates a map holding all fields (as items objects) that are present in a given view 
     * and stores them in the `view_fields` map (does not maintain the field order)
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
        // it is best UX practice to avoid footer on lists
    }

    private layoutListHeader() {
        console.log('View::layoutListHeader');

        // apend header structure
        this.$headerContainer.append(' \
            <div class="sb-view-header-list"> \
                <div class="sb-view-header-list-actions"> \
                    <div class="sb-view-header-list-actions-set"></div> \
                </div> \
                <div class="sb-view-header-list-navigation"></div> \
            </div>'
        );
        
        let $elem = this.$headerContainer.find('.sb-view-header-list');

        let $level1 = $elem.find('.sb-view-header-list-actions');
        let $level2 = $elem.find('.sb-view-header-list-navigation');

        let $actions_set = $level1.find('.sb-view-header-list-actions-set');

        if(this.config.show_actions) {
            switch(this.purpose) {
                case 'view':
                    $actions_set
                    .append( 
                        UIHelper.createButton('action-edit', TranslationService.instant('SB_ACTIONS_BUTTON_CREATE'), 'raised')
                        .on('click', async () => {
                            try {
                                let object = await ApiService.create(this.entity, this.getCreationDefaults());
                                // request a new Context for editing the new object
                                $('#sb-events').trigger('_openContext', {entity: this.entity, type: 'form', name: 'default', domain: [['id', '=', object.id], ['state', '=', 'draft']], mode: 'edit', purpose: 'create'});
                            }
                            catch(response) {
                                this.displayErrorFeedback(response);
                            }
                        })
                    );
                    break;
                case 'select':
                    $actions_set
                    .append( 
                        UIHelper.createButton('action-select', TranslationService.instant('SB_ACTIONS_BUTTON_SELECT'), 'raised', 'check')
                        .on('click', async () => {
                            // close context and relay selection, if any (mark the view as changed to force parent context update)
                            // #todo : user should not be able to select more thant one id
                            let objects = await this.model.get(this.selected_ids);
                            $('#sb-events').trigger('_closeContext', {selection: this.selected_ids, objects: objects});
                        })
                    )
                    .append( 
                        UIHelper.createButton('action-create', TranslationService.instant('SB_ACTIONS_BUTTON_CREATE'), 'text')
                        .on('click', async () => {
                            try {
                                // create a new object
                                let object = await ApiService.create(this.entity, this.getCreationDefaults());
                                // request a new Context for editing the new object
                                $('#sb-events').trigger('_openContext', {entity: this.entity, type: 'form', name: 'default', domain: [['id', '=', object.id], ['state', '=', 'draft']], mode: 'edit', purpose: 'create'});
                            }
                            catch(response) {
                                this.displayErrorFeedback(response);
                            }
                        })
                    );                    
                    break;
                case 'add':
                    $actions_set
                    .append( 
                        UIHelper.createButton('action-add', TranslationService.instant('SB_ACTIONS_BUTTON_ADD'), 'raised', 'check')
                        .on('click', async () => {
                            // close context and relay selection, if any (mark the view as changed to force parent context update)
                            let objects = await this.model.get(this.selected_ids);
                            $('#sb-events').trigger('_closeContext', {selection: this.selected_ids, objects: objects});
                        })
                    )
                    .append( 
                        UIHelper.createButton('action-create', TranslationService.instant('SB_ACTIONS_BUTTON_CREATE'), 'text')
                        .on('click', async () => {
                            try {
                                // create a new object
                                let object = await ApiService.create(this.entity, this.getCreationDefaults());
                                // request a new Context for editing the new object
                                $('#sb-events').trigger('_openContext', {entity: this.entity, type: 'form', name: 'default', domain: [['id', '=', object.id], ['state', '=', 'draft']], mode: 'edit', purpose: 'create'});
                            }
                            catch(response) {
                                this.displayErrorFeedback(response);
                            }
                        })
                    );                    
                    break;
                case 'widget':
                default:
                    break;
            }
        }


        // container for holding chips of currently applied filters
        let $filters_set = $('<div />').addClass('sb-view-header-list-filters-set mdc-chip-set').attr('role', 'grid');


        // fields toggle menu : button for displaying the filters menu
        let $filters_button = 
        $('<div/>').addClass('sb-view-header-list-filters mdc-menu-surface--anchor')        
        .append( UIHelper.createButton('view-filters', 'filters', 'icon', 'filter_list') );

        // create floating menu for filters selection
        let $filters_menu = UIHelper.createMenu('filters-menu').addClass('sb-view-header-list-filters-menu').appendTo($filters_button);        
        let $filters_list = UIHelper.createList('filters-list').appendTo($filters_menu);

        // generate filters list
        for(let filter_id in this.filters) {
            let filter = this.filters[filter_id];

            UIHelper.createListItem(filter.description)
            .appendTo($filters_list)
            .attr('id', filter_id)
            .on('click', (event) => {
                this.applyFilter(filter_id);
            });
        }

        // append additional option for custom filter
        UIHelper.createListDivider().appendTo($filters_list);
        
        let $dialog = UIHelper.createDialog('add_custom_filter_dialog', TranslationService.instant('SB_FILTERS_ADD_CUSTOM_FILTER'));
        $dialog.appendTo(this.$container);
        // inject component as dialog content
        this.decorateCustomFilterDialog($dialog);

        UIHelper.createListItem(TranslationService.instant('SB_FILTERS_ADD_CUSTOM_FILTER'))
        .appendTo($filters_list)
        .on('click', (event) => $dialog.trigger('_open') );


        UIHelper.decorateMenu($filters_menu);
        $filters_button.find('button').on('click', () => $filters_menu.trigger('_toggle') );


      

        // fields toggle menu : button for displaying the fields menu
        let $fields_toggle_button = 
        $('<div/>').addClass('sb-view-header-list-fields_toggle mdc-menu-surface--anchor')        
        .append( UIHelper.createButton('view-filters', 'fields', 'icon', 'more_vert') );

        // create floating menu for fields selection
        let $fields_toggle_menu = UIHelper.createMenu('fields-menu').addClass('sb-view-header-list-fields_toggle-menu').appendTo($fields_toggle_button);
        let $fields_toggle_list = UIHelper.createList('fields-list').appendTo($fields_toggle_menu);

// #todo : translate fields names
        for(let item of this.getViewSchema().layout.items ) {
            let label = (item.hasOwnProperty('label'))?item.label:item.value.charAt(0).toUpperCase() + item.value.slice(1);
            let visible = (item.hasOwnProperty('visible'))?item.visible:true;

            UIHelper.createListItemCheckbox('sb-fields-toggle-checkbox-'+item.value, label)
            .appendTo($fields_toggle_list)
            .find('input')
            .on('change', (event) => {
                let $this = $(event.currentTarget);
                let def = this.getField(item.value);
                def.visible = $this.prop('checked');
                this.setField(item.value, def);
                this.onchangeModel(true);
            })
            .prop('checked', visible);
        }

        UIHelper.decorateMenu($fields_toggle_menu);
        $fields_toggle_button.find('button').on('click', () => $fields_toggle_menu.trigger('_toggle') );


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
    /**
     * Re-draw the list layout.
     * This method is triggered by a model change @see layoutRefresh() or a selection change @see onChangeSelection().
     * 
     * @param full 
     */
    private layoutListRefresh(full: boolean = false) {
        console.log('View::layoutListRefresh');
        // update footer indicators (total count)        
        let limit: number = this.getLimit();
        let total: number = this.getTotal();
        let start: number = this.getStart() + 1;
        let end: number = start + limit - 1;
        end = Math.min(end, start + this.model.ids().length - 1);

        console.log(limit, total, start, end);


        this.$container.find('.sb-view-header-list-pagination-total').html(total);
        this.$container.find('.sb-view-header-list-pagination-start').html(start);
        this.$container.find('.sb-view-header-list-pagination-end').html(end);

        this.$container.find('.sb-view-header-list-pagination-first_page').prop('disabled', !(start > limit));
        this.$container.find('.sb-view-header-list-pagination-prev_page').prop('disabled', !(start > limit));
        this.$container.find('.sb-view-header-list-pagination-next_page').prop('disabled', !(start <= total-limit));
        this.$container.find('.sb-view-header-list-pagination-last_page').prop('disabled', !(start <= total-limit));


        let $action_set = this.$container.find('.sb-view-header-list-actions-set');
        $action_set.find('.sb-view-header-list-actions-selected').remove();

        // do not show the actions menu for 'add' and 'select' purposes
        if(this.selected_ids.length > 0 && ['view', 'widget'].indexOf(this.purpose) > -1) {
            let count = this.selected_ids.length;

            let $fields_toggle_button = $('<div/>').addClass('sb-view-header-list-actions-selected mdc-menu-surface--anchor')        
            .append( UIHelper.createButton('action-selected', count+' '+TranslationService.instant('SB_ACTIONS_BUTTON_SELECTED'), 'outlined') );

            let $list = UIHelper.createList('fields-list');        
            let $menu = UIHelper.createMenu('fields-menu').addClass('sb-view-header-list-fields_toggle-menu');
            
            $menu.append($list);
            $fields_toggle_button.append($menu);

            // add actions defined in view
            for(let item of this.config.selection_actions) {
                UIHelper.createListItem(TranslationService.instant(item.title), item.icon)
                .on( 'click', (event:any) => item.handler(event, this.selected_ids) )
                .appendTo($list);                
            }

            UIHelper.decorateMenu($menu);

            $fields_toggle_button.find('button').on('click', () => {
                $menu.trigger('_toggle');
            });    
    
            $action_set.append($fields_toggle_button);
        }
    }

    private layoutFormHeader() {
        let $elem = $('<div />').addClass('sb-view-header-form');

        // container for holding chips of currently applied filters
        let $actions_set = $('<div />').addClass('sb-view-header-form-actions').appendTo($elem);

        switch(this.mode) {
            case 'view':
                $actions_set
                .append( 
                    UIHelper.createButton('action-edit', TranslationService.instant('SB_ACTIONS_BUTTON_UPDATE'), 'raised')
                    .on('click', () => {
                        $('#sb-events').trigger('_openContext', {entity: this.entity, type: this.type, name: 'default', domain: this.domain, mode: 'edit', purpose: 'update'});
                    })
                );
                break;
            case 'edit':
                $actions_set
                .append( 
                    UIHelper.createButton('action-save', TranslationService.instant('SB_ACTIONS_BUTTON_SAVE'), 'raised')
                    .on('click', async () => {
                        let objects;
                        if(this.purpose == 'create') {
                            // get the full collection, whatever the changes made by user
                            objects = await this.model.get();
                        }
                        else {
                            // get changed objects only 
                            objects = this.model.getChanges();
                        }                         
                        if(!objects.length) {
                            // no change : close context
                            $('#sb-events').trigger('_closeContext');
                        }
                        else {
                            // we're in edit mode for single object (form)
                            let object = objects[0];
                            try {                                
                                const response = await ApiService.update(this.entity, [object['id']], this.model.export(object));
                                $('#sb-events').trigger('_closeContext');    
                            }
                            catch(response) {
                                console.log('catched response', response);
                                this.displayErrorFeedback(response, object, false);
                            }
                        }
                    })
                )
                .append( 
                    UIHelper.createButton('action-cancel', TranslationService.instant('SB_ACTIONS_BUTTON_CANCEL'), 'outlined')
                    .on('click', async () => {
                        let validation = true;
                        if(this.hasChanged()) {
                            validation = confirm(TranslationService.instant('SB_ACTIONS_MESSAGE_ABANDON_CHANGE'));
                        }
                        if(!validation) return;
                        $('#sb-events').trigger('_closeContext');
                    })
                );
                break;
        }
    
        // attach elements to header toolbar
        this.$headerContainer.append( $elem );
    }


    private async layoutRefresh(full: boolean = false) {
        await this.layout.refresh(full);
        if(['list', 'kanban'].indexOf(this.type) >= 0) {
            this.layoutListRefresh();
        }
    }
    

    private decorateCustomFilterDialog($dialog: JQuery) {
        let $elem = $('<div />');

        let selected_field:string = '';
        let selected_operator:string = '';
        let selected_value:string = '';

        let fields:any = {};
        for(let item of this.view_schema.layout.items ) {
// #todo : translate fields names            
            let label = (item.hasOwnProperty('label'))?item.label:item.value.charAt(0).toUpperCase() + item.value.slice(1);
            fields[item.value] = label;
        }        

        let $select_field = UIHelper.createSelect('custom_filter_select_field', TranslationService.instant('SB_FILTERS_DIALOG_FIELD'), fields, Object.keys(fields)[0]).appendTo($elem);
        // setup handler for relaying value update to parent layout
        $select_field.find('input')
        .on('change', (event) => {
            let $this = $(event.currentTarget);
            selected_field = <string> $this.val();

            $elem.find('#custom_filter_select_operator').remove();
            $elem.find('#custom_filter_select_value').remove();
            
            let field_type = this.model.getFinalType(selected_field);
            let operators:[] = this.model.getOperators(field_type);
            let $select_operator = UIHelper.createSelect('custom_filter_select_operator', TranslationService.instant('SB_FILTERS_DIALOG_OPERATOR'), operators);
            // setup handler for relaying value update to parent layout
            $select_operator.find('input').on('change', (event) => {
                let $this = $(event.currentTarget);
                selected_operator = <string> $this.val();
            });

            let $select_value = $();
            
            switch(field_type) {
                case 'boolean':
                    $select_value = UIHelper.createSelect('custom_filter_select_value', TranslationService.instant('SB_FILTERS_DIALOG_VALUE'), ['true', 'false']);
                    break;
                case 'many2one':
                    break;
                default:
                    $select_value = UIHelper.createInput('custom_filter_select_value', TranslationService.instant('SB_FILTERS_DIALOG_VALUE'), '');
            }
            
            // setup handler for relaying value update to parent layout
            $select_value.find('input').on('change', (event) => {
                let $this = $(event.currentTarget);
                selected_value = <string> $this.val();
            });


            $elem.append($select_operator);
            $elem.append($select_value);
        })
        // init
        .trigger('change');


        $dialog.find('.mdc-dialog__content').append($elem);

        $dialog.on('_accept', () => {
            console.log(selected_field, selected_operator, selected_value);
            if(selected_operator == 'like') {
                selected_operator = 'ilike';
                selected_value = '%'+selected_value+'%';
            }
            if(selected_operator == 'in' || selected_operator == 'not in') {
                selected_value = '['+selected_value+']';
            }
            let filter = {
                "id": "custom_filter_"+(Math.random()+1).toString(36).substr(2, 7),
                "label": "custom filter",
                "description": selected_field + ' ' + selected_operator + ' ' + selected_value,
                "clause": [selected_field, selected_operator, selected_value]
            };
            // add filter to View available filters
            this.filters[filter.id] = filter;
            this.applyFilter(filter.id);
        });

    }
  
    /**
     * Callback for requesting a Model update.
     * Requested from layout when a change occured in the widgets.
     * 
     * @param ids       array   one or more objecft identifiers
     * @param values    object   map of fields names and their related values
     */
    public async onchangeViewModel(ids: Array<any>, values: object, refresh: boolean = true) {
        this.model.change(ids, values);
        // model has changed : forms need to re-check the visibility attributes
        if(refresh) {
            await this.onchangeModel();
        }        
    }
    
    /**
     * Callback for requesting a Layout update: the widgets in the layout need to be refreshed.
     * Requested from Model when a change occured in the Collection (as consequence of domain or params update)
     * If `full`is set to true, then the layout is re-generated
     * @param full  boolean
     */
    public async onchangeModel(full: boolean = false) {
        console.log('View::onchangeModel', full);
        await this.layoutRefresh(full);
    }
    
    /**
     * Callback for requesting a Model update.
     * Requested either from view: domain has been updated,
     * or from layout: context has been updated (sort column, sorting order, limit, page, ...)
     */
    public async onchangeView() {
        // reset selection
        this.onchangeSelection([]);
        await this.model.refresh();
    }

    /**
     * Callback for list selection update.
     * 
     * @param selection 
     */
    public onchangeSelection(selection: Array<any>) {
        console.log('View::onchangeSelection', selection);
        this.selected_ids = selection;
        this.layoutListRefresh();
    }

    /**
     * Generate an object mapping fields of current entity with default values, based on current domain.
     * 
     * @returns Object  A map of fields with their related default values
     */
    private getCreationDefaults() {
        // create a new object as draft (for asynchronous creation)
        let fields:any = {state: 'draft'};
        // use View domain for setting default values  
        let tmpDomain = new Domain(this.domain);
        for(let clause of tmpDomain.getClauses()) {
            for(let condition of clause.getConditions()) {
                let field  = condition.getOperand();
                if(field == 'id') continue;
                if(['ilike', 'like', '=', 'is'].includes(condition.getOperator()) && this.model_fields.hasOwnProperty(field)) {
                    fields[field] = condition.getValue();
                }
            }
        }
        return fields;
    }

    /** 
     * Apply a filter on the current view, and reload the Collection with the new resulting domain.
     * 
     * Expected structure for `filter`: 
     *       "id": "lang.french",
     *       "label": "français",
     *       "description": "Utilisateurs parlant français",
     *       "clause": ["language", "=", "fr"] 
     */
    private async applyFilter(filter_id:string) {
        let filter = this.filters[filter_id];
        let $filters_set = this.$headerContainer.find('.sb-view-header-list-filters-set');
        $filters_set.append(
            UIHelper.createChip(filter.description)
            .attr('id', filter.id)
            .on('click', (event) => {
                // unapply filter
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
        this.applied_filters_ids.push(filter.id);
        this.setStart(0);
        this.onchangeView();        
    }

    private async actionListInlineEdit(event:any, selection: any) {

        if(selection.length) {
            let $action_set = this.$container.find('.sb-view-header-list-actions-set');
            let $button_save = UIHelper.createButton('action-selected-edit-save', TranslationService.instant('SB_ACTIONS_BUTTON_SAVE'), 'raised')
            let $button_cancel = UIHelper.createButton('action-selected-edit-cancel', TranslationService.instant('SB_ACTIONS_BUTTON_CANCEL'), 'outlined')
            
            $action_set.append($button_save);
            $action_set.append($button_cancel);

            $button_save.on('click', () => {
                // handle changed objects
                let objects = this.model.getChanges(selection);
                let original_selection = [...selection];

                for(let object_id of original_selection) {
                    let object = objects.find( o => o.id == object_id );
                    this.$layoutContainer.find('tr[data-id="'+object_id+'"]').each( async (i: number, tr: any) => {
                        let $tr = $(tr);
                        if(!object) {
                            $tr.find('.sb-widget-cell').each( (i: number, cell: any):any => $(cell).trigger('_toggle_mode', 'view') );
                            $tr.attr('data-edit', '0');
                            selection.splice(selection.indexOf(object_id), 1);
                        }
                        else {
                            try {
                                await ApiService.update(this.entity, [object_id], this.model.export(object));
                                $tr.find('.sb-widget-cell').each( (i: number, cell: any):any => $(cell).trigger('_toggle_mode', 'view') );
                                $tr.attr('data-edit', '0');
                                selection.splice(selection.indexOf(object_id), 1);
                                if(selection.length == 0) {
                                    $button_save.remove();
                                    $button_cancel.remove();
                                }
                            }
                            catch(response) {
                                this.displayErrorFeedback(response, object, true);
                            }    
                        }
                    });
                }
                if(selection.length == 0) {
                    $button_save.remove();
                    $button_cancel.remove();
                }
                return false;                
            });

            $button_cancel.on('click', () => {
                // restore original values for changed objects
                let objects = this.model.getChanges(selection);
                for(let object of objects) {
                    let object_id = object.id;
                    this.$layoutContainer.find('tr[data-id="'+object_id+'"]').each( async (i: number, tr: any) => {
                        let $tr = $(tr);
                        let original = $tr.data('original');
                        for(let field of Object.keys(original)) {
                            this.layout.updateFieldValue(object_id, field, original[field]);
                        }
                    });
                }
                this.$layoutContainer.find('tr.sb-view-layout-list-row').each( async (i: number, tr: any) => {
                    let $tr = $(tr);
                    $tr.find('.sb-widget-cell').each( (i: number, cell: any):any => $(cell).trigger('_toggle_mode', 'view') );
                    $tr.attr('data-edit', '0');    
                });
                $button_save.remove();
                $button_cancel.remove();
                return false;
            });
        }

        for(let object_id of selection ) {

            this.$layoutContainer.find('tr[data-id="'+object_id+'"]').each( async (i: number, tr: any) => {
                let $tr = $(tr);
                $tr.addClass('sb-widget');
                // not already in edit mode
                if($tr.attr('data-edit') != '1') {
                    let $td = $tr.children().first();

                    let collection = await this.model.get([object_id]);
                    let object = collection[0];
                    // save original object in the row
                    $tr.data('original', this.deepCopy(object));

                    // mark row as being edited (prevent click handling)
                    $tr.attr('data-edit', '1');
                    // for each widget of the row, switch to edit mode
                    $tr.find('.sb-widget-cell').each( (i: number, cell: any) => {
                        $(cell).trigger('_toggle_mode', 'edit');
                    });
                }                
            });
        }
    }

    private async displayErrorFeedback(response:any, object:any = null, snack:boolean = true) {
        if(response && response.hasOwnProperty('errors')) {
            let errors = response['errors'];

            if(errors.hasOwnProperty('INVALID_PARAM')) {
                let delay = 4000;
                let i = 0, count = Object.keys(errors['INVALID_PARAM']).length;
                // stack snackbars (LIFO: decreasing timeout)
                for(let field in errors['INVALID_PARAM']) {
                    // for each field, we handle one error at a time (the first one)
                    let error_id:string = <string>(Object.keys(errors['INVALID_PARAM'][field]))[0];
                    let msg:string = <string>(Object.values(errors['INVALID_PARAM'][field]))[0];
                    // translate error message
                    msg = TranslationService.resolve(this.translation, 'error', field, msg, error_id);
                    this.layout.markFieldAsInvalid(object['id'], field, msg);
                    if(snack) {
                        let title = TranslationService.resolve(this.translation, 'model', field, field, 'label');
                        let $snack = UIHelper.createSnackbar(title+': '+msg, '', '', delay * (count-i));
                        this.$container.append($snack);
                    }
                    ++i;
                }
            }
            else if(errors.hasOwnProperty('NOT_ALLOWED')) {
                let msg = TranslationService.instant('SB_ERROR_NOT_ALLOWED');
                let $snack = UIHelper.createSnackbar(msg, '', '', 4000);
                this.$container.append($snack);
            }
            else if(errors.hasOwnProperty('CONFLICT_OBJECT')) {
                // one or more fields violate a unique constraint
                if(typeof errors['CONFLICT_OBJECT'] == 'object') {
                    let delay = 4000;
                    let i = 0, count = Object.keys(errors['CONFLICT_OBJECT']).length;    
                    for(let field in errors['CONFLICT_OBJECT']) {
                        let msg = TranslationService.instant('SB_ERROR_DUPLICATE_VALUE');
                        this.layout.markFieldAsInvalid(object['id'], field, msg);
                        if(snack) {
                            let title = TranslationService.resolve(this.translation, 'model', field, field, 'label');
                            let $snack = UIHelper.createSnackbar(title+': '+msg, '', '', delay * (count-i));
                            this.$container.append($snack);
                        }
                        ++i;    
                    }
                }
                // object has been modified in the meanwhile
                else {
                    let validation = false;
                    validation = confirm(TranslationService.instant('SB_ACTIONS_MESSAGE_ERASE_CONUCRRENT_CHANGES'));
                    if(validation) {
                        try {
                            const response = await ApiService.update(this.entity, [object['id']], this.model.export(object), true);
                            $('#sb-events').trigger('_closeContext');                            
                        }
                        catch(response) {
                            await this.displayErrorFeedback(response, object, snack);
                        }
                    }
                }
            }
        }    
    }

}

export default View;