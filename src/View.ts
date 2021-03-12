import { $ } from "./jquery-lib";
import { UIHelper, MDCMenu } from './material-lib';
import { environment } from "./environment";

import { ApiService, TranslationService } from "./equal-services";

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
                    handler: (event:any, selection:any) => this.actionListInlineUpdate(event, selection)
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
                    title: 'SB_ACTIONS_BUTTON_DELETE',
                    icon:  'delete',
                    handler: (event:any, selection:any) => {
                        let selected_id = this.selected_ids[0];

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

        // apend header structure
        this.$headerContainer.append(' \
            <div class="sb-view-header-list"> \
                <div class="sb-view-header-list-actions"> \
                    <div class="sb-view-header-list-actions-set"></div> \
                </div> \
                <div class="sb-view-header-list-navigation"></div> \
            </div>'
        );

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
                            // create a new object
                            let object = await ApiService.create(this.entity);
                            // request a new Context for editing the new object
                            $('#sb-events').trigger('_openContext', {entity: this.entity, type: 'form', name: 'default', domain: [['id', '=', object.id], ['state', '=', 'draft']], mode: 'edit', purpose: 'create'});
                        })
                    );
                    break;
                case 'select':
                    $actions_set
                    .append( 
                        UIHelper.createButton('action-select', TranslationService.instant('SB_ACTIONS_BUTTON_SELECT'), 'raised', 'check')
                        .on('click', () => {
                            // close context and relay selection, if any (mark the view as changed to force parent context update)
// todo : only one id should be relayed                            
                            $('#sb-events').trigger('_closeContext', {selection: this.selected_ids});
                        })
                    );
                    break;
                case 'add':
                    $actions_set
                    .append( 
                        UIHelper.createButton('action-add', TranslationService.instant('SB_ACTIONS_BUTTON_ADD'), 'raised', 'check')
                        .on('click', () => {
                            // close context and relay selection, if any (mark the view as changed to force parent context update)
                            $('#sb-events').trigger('_closeContext', {selection: this.selected_ids});
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
        .append( UIHelper.createButton('view-filters', 'filters', 'mini-fab', 'filter_list') );

        // create floating menu for filters selection
        let $filters_menu = UIHelper.createMenu('filters-menu').addClass('sb-view-header-list-filters-menu').css({"margin-top": '48px'}).appendTo($filters_button);        
        let $filters_list = UIHelper.createList('filters-list').appendTo($filters_menu);

        // generate filters list
        for(let filter_id in this.filters) {
            let filter = this.filters[filter_id];

            UIHelper.createListItem(filter.description)
            .appendTo($filters_list)
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

        UIHelper.decorateMenu($filters_menu);
        $filters_button.find('button').on('click', () => $filters_menu.trigger('_toggle') );


      

        // fields toggle menu : button for displaying the fields menu
        let $fields_toggle_button = 
        $('<div/>').addClass('sb-view-header-list-fields_toggle mdc-menu-surface--anchor')        
        .append( UIHelper.createButton('view-filters', 'fields', 'mini-fab', 'more_vert') );

        // create floating menu for fields selection
        let $fields_toggle_menu = UIHelper.createMenu('fields-menu').addClass('sb-view-header-list-fields_toggle-menu').appendTo($fields_toggle_button);
        let $fields_toggle_list = UIHelper.createList('fields-list').appendTo($fields_toggle_menu);

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

        // hide filter button if there are no filters available
        if(Object.keys(this.filters).length) {
            $level2.append( $filters_button );
        }
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
        console.log('View::layoutListRefresh#########################');
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
            let $menu = UIHelper.createMenu('fields-menu').addClass('sb-view-header-list-fields_toggle-menu').css({"margin-top": '48px', "width": "100%"});
            
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
                )
                .append( 
                    UIHelper.createButton('action-create', TranslationService.instant('SB_ACTIONS_BUTTON_CREATE'), 'text')
                    .on('click', async () => {
                        // create a new object
                        let object = await ApiService.create(this.entity);
                        // request a new Context for editing the new object
                        $('#sb-events').trigger('_openContext', {entity: this.entity, type: 'form', name: 'default', domain: [['id', '=', object.id], ['state', '=', 'draft']], mode: 'edit', purpose: 'create'});
                    })
                );
                break;
            case 'edit':
                $actions_set
                .append( 
                    UIHelper.createButton('action-save', TranslationService.instant('SB_ACTIONS_BUTTON_SAVE'), 'raised')
                    .on('click', async () => {
                        let objects = await this.model.get();
                        let object = objects[0];
                        const response = await ApiService.update(this.entity, [object['id']], object);
                        if(!response || !response.hasOwnProperty('errors')) {
                            $('#sb-events').trigger('_closeContext');
                        }
                        else {
                            let errors = response['errors'];
                            if(errors.hasOwnProperty('INVALID_PARAM')) {
                                for(let field in errors['INVALID_PARAM']) {
                                    // for each field, we handle one error at a time (the first one)
                                    let error_id:string = <string>(Object.keys(errors['INVALID_PARAM'][field]))[0];
                                    let msg:string = <string>(Object.values(errors['INVALID_PARAM'][field]))[0];
                                    // translate error message
                                    msg = TranslationService.resolve(this.translation, 'error', field, msg, error_id);
                                    this.layout.markFieldAsInvalid(object['id'], field, msg);
                                }
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



    private actionListInlineUpdate(event:any, selection: any) {
        for(let selected_id of selection ) {

            this.$layoutContainer.find('tr[data-id="'+selected_id+'"]').each( (i: number, tr: any) => {
                let $tr = $(tr);
                // not already in edit mode
                if($tr.attr('data-edit') != '1') {
                    let $td = $tr.children().first();
                    let $checkbox = $td.find('.sb-checkbox').hide();
                    let $save_button = UIHelper.createButton('view-save-row', '', 'mini-fab', 'save')
                    .appendTo($td)
                    .on('click', async (event:any) => {
                        event.stopPropagation();
    
                        let object_id = parseInt(<string>$tr.attr('data-id'), 10);
                        let objects = await this.model.get([object_id]);
                        let object = objects[0];
    
                        const response = await ApiService.update(this.entity, [object_id], object);
                        if(!response || !response.hasOwnProperty('errors')) {
                            $save_button.remove();
                            $tr.find('.sb-widget-cell').each( (i: number, cell: any) => {
                                $(cell).trigger('_toggle_mode', 'view');
                            });
                            $checkbox.show();
                            // restore click handling
                            $tr.attr('data-edit', '0');
                        }
                        else {
                            let errors = response['errors'];
                            if(errors.hasOwnProperty('INVALID_PARAM')) {
                                for(let field in errors['INVALID_PARAM']) {
                                    // for each field, we handle one error at a time (the first one)
                                    let error_id:string = <string>(Object.keys(errors['INVALID_PARAM'][field]))[0];
                                    let msg:string = <string>(Object.values(errors['INVALID_PARAM'][field]))[0];
                                    // translate error message
                                    msg = TranslationService.resolve(this.translation, 'error', field, msg, error_id);
                                    this.layout.markFieldAsInvalid(object['id'], field, msg);
                                }
                            }
                        }
    
                    });
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
}

export default View;