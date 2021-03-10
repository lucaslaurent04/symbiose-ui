import { $ } from "./jquery-lib";

import { Widget, WidgetFactory } from "./equal-widgets";
import { UIHelper } from './material-lib';

import { ApiService, TranslationService } from "./equal-services";

import Domain from "./Domain";

import Context from "./Context";
import View from "./View";
import Model from "./Model";

/*
    There are two main branches of Layouts depending on what is to be displayed:
        - 1 single object : Form 
        - several objects : List (grid, kanban, graph)
        
    Forms can be displayed in two modes : 'view' or 'edit'
    Lists can be editable on a Cell basis (using Widgets)
*/

export class Layout {

    private view: View;             // parent view the layout belongs to
    
    private $layout: any;

    private model_widgets: any;


    /**
     *
     * @param view  View    Parent View object
     */
    constructor(view:View) {
        this.view = view;
        this.$layout = $('<div />').addClass('sb-layout');
        this.model_widgets = {};
        this.view.$layoutContainer.append(this.$layout);
    }

    public async init() {
        console.log('Layout::init');        
        try {
            // initialize the layout
            this.layout();
        }
        catch(err) {
            console.log('Something went wrong ', err);
        }        
    }

    /**
     * 
     * @param field 
     * @param message 
     */
    public markFieldAsInvalid(object_id: number, field: string, message: string) {
        console.log('Layout::markFieldAsInvalid', object_id, field);
        if(this.view.getType() == 'form') {
            // by convention, form widgets are strored in first index
            object_id = 0;
        }
        let widget = this.model_widgets[object_id][field];
        let $elem = this.$layout.find('#'+widget.getId())
        $elem.addClass('mdc-text-field--invalid');
        $elem.find('.mdc-text-field-helper-text').addClass('mdc-text-field-helper-text--persistent mdc-text-field-helper-text--validation-msg').text(message).attr('title', message);

    }


    // refresh layout
    // this method is called in response to parent View `onchangeModel` method 
    public async refresh(full: boolean) {
        console.log('Layout::refresh');
                     
        // also re-generate the layout                     
        if(full) {
            this.$layout.empty();
            this.layout();
        }

        // feed layout with current Model
        let objects = await this.view.getModel().get();
        this.feed(objects);
    }       
    
    public getSelected() {
        var selection = <any>[];
        let $tbody = this.$layout.find("tbody");
        $tbody.find("input:checked").each( (i:number, elem:any) => {
            selection.push( parseInt(<string>$(elem).attr('data-id'), 10) );
        });
        return selection;
    }
    
    private layout() {
        console.log('Layout::layout');
                
        switch(this.view.getType()) {
            case 'form':
                this.layoutForm();
                break;
            case 'list':
                this.layoutList();
                break;
        }
    }

    private  feed(objects: []) {
        console.log('Layout::feed');
        
        switch(this.view.getType()) {
            case 'form':
                this.feedForm(objects);
                break;
            case 'list':
                this.$layout.find("tbody").remove();
                this.feedList(objects);
                break;
        }
    }

    /**
     * 
     * This method also stores the list of instanciated widgets to allow switching from view mode to edit mode  (for a form or a cell)
     * 
     */
    private layoutForm() {
        console.log('Layout::layoutForm');
        let $elem = $('<div/>').css({"width": "100%"});

        let view_schema = this.view.getViewSchema();
        let model_fields = this.view.getModelFields();
        let translation = this.view.getTranslation();

        $.each(view_schema.layout.groups, (i:number, group) => {
            let $group = $('<div />').addClass('sb-view-form-group').appendTo($elem);

            // try to resolve the group title
            let group_title = (group.hasOwnProperty('label'))?group.label:'';
            if(group.hasOwnProperty('id')) {
                group_title = TranslationService.resolve(translation, 'view', group.id, group_title);
            }
            // append the group title, if any
            if(group_title.length) {
                $group.append($('<div/>').addClass('sb-view-form-group-title').text(group_title));
            }

            let $tabs = UIHelper.createTabBar('test', '', '').addClass('sb-view-form-sections-tabbar');

            if(group.sections.length > 1) {
                $group.append($tabs);    
            }
            
            $.each(group.sections, (i:number, section) => {
                let section_id = 'section-'+i;
                let $section = $('<div />').attr('id', section_id).addClass('sb-view-form-section mdc-layout-grid').appendTo($group);
                if(i > 0) {
                    $section.hide();
                }

                if(group.sections.length > 1) {
                    // try to resolve the section title
                    let section_title = (section.hasOwnProperty('label'))?section.label:'';
                    if(section.hasOwnProperty('id')) {
                        section_title = TranslationService.resolve(translation, 'view', section.id, section_title);
                    }

                    let $tab = UIHelper.createTabButton('', section_title, (i == 0))
                    .on('click', () => {
                        $group.find('.sb-view-form-section').hide();
                        $group.find('#'+section_id).show();
                    });
    
                    $tabs.find('.sb-view-form-sections').append($tab);                    
                }
                

                $.each(section.rows, (i, row) => {
                    let $row = $('<div />').addClass('mdc-layout-grid__inner').appendTo($section);
                    $.each(row.columns, (i, column) => {
                        let $column = $('<div />').addClass('mdc-layout-grid__cell').appendTo($row);

                        if(column.hasOwnProperty('width')) {
                            $column.addClass('mdc-layout-grid__cell--span-' + Math.round((parseInt(column.width, 10) / 100) * 12));
                        }

                        let $inner_cell = $('<div />').addClass('mdc-layout-grid__cell').appendTo($column);
                        $column = $('<div />').addClass('mdc-layout-grid__inner').appendTo($inner_cell);

                        $.each(column.items, (i, item) => {
                            let $cell = $('<div />').addClass('mdc-layout-grid__cell').appendTo($column);
                            // compute the width (on a 12 columns grid basis), from 1 to 12
                            let width = (item.hasOwnProperty('width'))?Math.round((parseInt(item.width, 10) / 100) * 12): 12;
                            
                            $cell.addClass('mdc-layout-grid__cell--span-' + width);

                            if(item.hasOwnProperty('value')) {
                                if(item.type == 'field') {
                                    let config:any = {};
                                    let field = item.value;
                                    let def = model_fields[field];
                                    let type = def.type;
                                    let label = (item.hasOwnProperty('label'))?item.label:field;
                                    let helper = (item.hasOwnProperty('help'))?item.help:'';
                                    
                                    let field_title = TranslationService.resolve(translation, 'model', field, label);
                                    let field_helper = TranslationService.resolve(translation, 'model', field, helper, 'help');
                                
                                    let readonly = (item.hasOwnProperty('readonly'))?item.readonly:false;
    
                                    config['helper'] = field_helper;

                                    if(item.hasOwnProperty('visible')) {
                                        let visible_domain = item.visible;
                                        if(!Array.isArray(visible_domain)) {
                                            visible_domain = eval(visible_domain);
                                        }
                                        config['visible'] = visible_domain;
                                    }                                
    
                                    if(item.hasOwnProperty('widget')) {
                                        config = {...config, ...item.widget};
                                        if(item.widget.hasOwnProperty('type')) {
                                            type = item.widget.type;
                                        }
                                    }

                                    let widget:Widget = WidgetFactory.getWidget(type, field_title, '', config);
                                    widget.setReadonly(readonly);
                                    // store widget in widgets Map, using field name as key
                                    if(typeof this.model_widgets[0] == 'undefined') {
                                        this.model_widgets[0] = {};
                                    }
                                    this.model_widgets[0][field] = widget;
                                    $cell.append(widget.attach());                
                                }
                                else if(item.type == 'label') {
    
                                }    
                            }
                        });
                    });
                });                
            });
            UIHelper.decorateTabBar($tabs);
        });

        
        this.$layout.append($elem);
    }
    
    private layoutList() {
        // create table

        // we define a tree structure according to MDC pattern
        let $elem = $('<div/>').css({"width": "100%"})
        let $container = $('<div/>').css({"width": "100%"}).appendTo($elem);

        let $table = $('<table/>').css({"width": "100%"}).appendTo($container);
        let $thead = $('<thead/>').appendTo($table);
        let $tbody = $('<tbody/>').appendTo($table);
            
        // instanciate header row and the first column which contains the 'select-all' checkbox
        let $hrow = $('<tr/>');

        if(this.view.getPurpose() != 'widget' || this.view.getMode() == 'edit') {
            UIHelper.createTableCellCheckbox(true)
            .appendTo($hrow)
            .find('input')
            .on('click', () => setTimeout( () => this.view.onchangeSelection(this.getSelected()) ) );    
        }

        // create other columns, based on the col_model given in the configuration
        let schema = this.view.getViewSchema();

        for(let item of schema.layout.items) {            
            let align = (item.hasOwnProperty('align'))?item.align:'left';
            let label = (item.hasOwnProperty('label'))?item.label:item.value.charAt(0).toUpperCase() + item.value.slice(1);
            let sortable = (item.hasOwnProperty('sortable') && item.sortable);
            let visible = (item.hasOwnProperty('visible'))?item.visible:true;

            let $menu_item = $('<li/>').addClass('mdc-list-item').attr('role', 'menuitem');
            
            if(visible) {
                let $cell = $('<th/>').attr('name', item.value).append(label)
                .on('click', (event:any) => {
                    let $this = $(event.currentTarget);
                    if($this.hasClass('sortable')) {
                        // wait for handling of sort toggle
                        setTimeout( () => {
                            // change sortname and/or sortorder
                            this.view.setOrder(<string>$this.attr('name'));
                            this.view.setSort(<string>$this.attr('data-sort'));
                            this.view.onchangeView();
                            // unselect all lines
                            this.$layout.find('input[type="checkbox"]').each( (i:number, elem:any) => {
                                $(elem).prop('checked', false).prop('indeterminate', false);
                            });
                    
                        }, 100);
                    }
                });

                if(sortable) {
                    $cell.addClass('sortable').attr('data-sort', 'asc');
                }
                $hrow.append($cell);
            }

        }

        $thead.append($hrow);

        this.$layout.append($elem);

        UIHelper.decorateTable($elem);
    }
    

    
    private feedList(objects: any) {
        console.log('Layout::feed', objects);

        let schema = this.view.getViewSchema();

        let $elem = this.$layout.children().first();
        $elem.find('tbody').remove();

        let $tbody = $('<tbody/>');       

        for (let object of objects) {

            let $row = $('<tr/>')
            .attr('data-id', object.id)
            .attr('data-edit', '0')
            .on('click', (event:any) => {
                let $this = $(event.currentTarget);
                // discard click when row is being edited
                if($this.attr('data-edit') == '0') {
                    $('#sb-events').trigger('_openContext', {entity: this.view.getEntity(), type: 'form', domain: ['id', '=', object.id]});
                }                
            });

            if(this.view.getPurpose() != 'widget' || this.view.getMode() == 'edit') {
                UIHelper.createTableCellCheckbox()
                .addClass('sb-checkbox-cell')
                .appendTo($row)
                .find('input')
                .attr('data-id', object.id)
                .on('click', (event:any) => {
                    // wait for widget to update and notify about change
                    setTimeout( () => this.view.onchangeSelection(this.getSelected()) );
                    // prevent handling of click on parent `tr` element
                    event.stopPropagation();
                });
            }

            for(let item of schema.layout.items) {

                let field = item.value;

                let view_def = this.view.getField(field);
                // field is not part of the view, skip it
                if(view_def == undefined) continue;
                let visible = (view_def.hasOwnProperty('visible'))?view_def.visible:true;
                // do not show fields with no width
                if(!visible) continue;
               
                let model_schema = this.view.getModelFields();
                let view_schema = this.view.getViewFields();

                let model_def = model_schema[field];

                let type = model_def['type'];

                // handle `alias` type
                while(type == 'alias') {
                    let target = model_def['alias'];
                    model_def = model_schema[target];
                    type = model_def['type'];
                }

                if(view_def.hasOwnProperty('widget')) {
                    type = view_def.widget.type;
                }
                
                let value = object[field];

                if(['one2many', 'many2one', 'many2many'].indexOf(type) > -1) {
                    // by convention, `name` subfield is always loaded for relational fields
                    if(type == 'many2one') {
                        value = object[field]['name'];
                    }
                    else {
                        value = object[field].map( (o:any) => o.name).join(', ');
                        value = (value.length > 35)? value.substring(0, 35) + "..." : value;
                    }                    
                }

                let widget:Widget = WidgetFactory.getWidget(type, '', value);

                // store widget in widgets Map, using widget id as key (there are several rows for each field)
                if(typeof this.model_widgets[object.id] == 'undefined') {
                    this.model_widgets[object.id] = {};
                }
                this.model_widgets[object.id][field] = widget;


                let $cell = $('<td/>').addClass('sb-widget-cell').append(widget.render())
                .on( '_toggle_mode', (event:any) => {
                    console.log('toggleing mode');
                    let $this = $(event.currentTarget);
                    let mode = (widget.getMode() == 'edit')?'view':'edit';
                    widget.setMode( mode );
                    let $widget = widget.render();

                    if(mode == 'edit') {
                        $this.addClass('sb-widget-cell--edit');
                        $widget.on('_updatedWidget', (event:any) => {
                            let value:any = {};
                            value[field] = widget.getValue();
                            // propagate model change, without requesting a layout refresh
                            this.view.onchangeViewModel([object.id], value, false);
                        });    
                    }
                    else {
                        $this.removeClass('sb-widget-cell--edit');
                    }
                    $this.empty().append($widget);
                } );

                $row.append($cell);
            }
            $tbody.append($row);
        }
        
        
        $elem.find('table').append($tbody);

        UIHelper.decorateTable($elem);

    }
    
    private feedForm(objects: any) {
        console.log('Layout::feedForm');
        // display the first object from the collection

        let fields = Object.keys(this.view.getViewFields());
        let model_schema = this.view.getModelFields();


        if(objects.length > 0) {
            let object:any = objects[0];
            for(let field of fields) {
                let widget = this.model_widgets[0][field];
                let $parent = this.$layout.find('#'+widget.getId()).parent().empty();

                let model_def = model_schema[field];
                let type = model_def['type'];
        
                let value = object[field];

                // for relational fields, we need to check if the Model has been fetched al
                if(['one2many', 'many2one', 'many2many'].indexOf(type) > -1) {
                    let config = widget.getConfig();
                    // by convention, `name` subfield is always loaded for relational fields
                    if(type == 'many2one') {
// todo : need to maintain field structure with dedicated widget
                        value = object[field]['name'];
                    }
/*
                    else {
                        value = object[field].map( (o:any) => o.name).join(', ');
                        value = (value.length > 35)? value.substring(0, 35) + "..." : value;
                    }
*/

                    if(type == 'many2many') {
                        // for m2m fields, the value of the field is an array of objects `{id:, name:}`
                        // by convention, when a relation is to be removed, the id field is set to its negative value

                        // select ids to load by filtering targeted objects
                        let target_ids = object[field].map( (o:any) => o.id ).filter( (id:number) => id > 0 );
                        // defined config for Widget's view with a custom domain according to object values
                        config = {...config, 
                            entity: model_def['foreign_object'],
                            type: 'list',
                            name: (config.hasOwnProperty('view'))?config.view:'default',
                            domain: ['id','in',target_ids],
                            lang: this.view.getLang()
                        };
                    }

                    widget.setConfig(config);
                }

                widget.setMode(this.view.getMode()).setValue(value);

                let $widget = widget.render();

                /*
                    Handle Widget update
                */
                $widget.on('_updatedWidget', (event:any) => {
                    console.log('widget _updatedWidget');
                    // update object with new value
                    let value:any = {};
                    value[field] = widget.getValue();
                    this.view.onchangeViewModel([object.id], value);
                });


                let config = widget.getConfig();
                
                // handle visibility tests (domain)           
                if(config.hasOwnProperty('visible')) {
                    let domain = new Domain(config.visible);
                    if( domain.evaluate(object) ) {
                        // append rendered widget
                        $parent.append($widget);    
                    }
                    else {
                        // append an empty widget container (to allow further retrieval)
                        $parent.append(widget.attach());
                    }                    
                }
                else {
                    // append rendered widget
                    $parent.append($widget);
                }
                
            }    
        }
    }
    
}

export default Layout;