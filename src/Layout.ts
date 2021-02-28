import { $ } from "./jquery-lib";
import { ApiService } from "./equal-services";
import { Widget, WidgetFactory } from "./equal-widgets";
import { UIHelper } from './material-lib';

import Domain from "./Domain";

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
            console.log('something went wrong ', err);
        }        
    }


    // refresh layout
    // this method is called in response to parent View `onchangeModel` method 
    public refresh(full: boolean) {
        console.log('Layout::refresh');
                     
        // also re-generate the layout                     
        if(full) {
            this.$layout.empty();
            this.layout();
        }

        // feed layout with current Model
        this.feed(this.view.getModel().get());
    }       

    
    public getSelected() {
        var selection = <any>[];
        let $tbody = this.$layout.find("tbody");
        $tbody.find("input:checked").each( (i:number, elem:any) => {
            selection.push($(elem).attr('data-id'));
        });
        console.log('selection', selection);
        return selection;
    }
    
    private layout() {
        console.log('Layout::layout');
                
        switch(this.view.type) {
            case 'form':
                this.layoutForm();
                break;
            case 'list':
                this.layoutList();
                break;
        }        
              
    }
// todo : garder la liste des widgets instanciés pour permettre de passer en mode d'édition (pour un formulaire ou une celulle)    
    private layoutForm() {
        console.log('Layout::layoutForm');
        let $elem = $('<div/>').css({"width": "100%"});

        let view_schema = this.view.getViewSchema();
        let model_fields = this.view.getModelFields();

        $.each(view_schema.layout.groups, (i, group) => {
            let $group = $('<div />').addClass('').appendTo($elem);
            $.each(group.sections, (i, section) => {
                let $section = $('<div />').addClass('mdc-layout-grid').appendTo($group);
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

                            if(item.hasOwnProperty('width')) {
                                $cell.addClass('mdc-layout-grid__cell--span-' + Math.round((parseInt(item.width, 10) / 100) * 12));
                            }

                            if(item.type == 'field') {
                                console.log(item);
                                let config:any = {};
                                let field_name = item.value;
                                let def = model_fields[field_name];
                                let type = def.type;
                                let label = (item.hasOwnProperty('label'))?item.label:field_name.charAt(0).toUpperCase() + field_name.slice(1);
                                let readonly = (item.hasOwnProperty('readonly'))?item.readonly:false;

                                if(item.hasOwnProperty('visible')) {
                                    let visible_domain = item.visible;
                                    if(!Array.isArray(visible_domain)) {
                                        visible_domain = eval(visible_domain);
                                    }
                                    config['visible'] = visible_domain;
                                }                                

                                if(item.hasOwnProperty('widget')) {
                                    config = {...config, ...item.widget};
                                    console.log(item.widget, config);
                                    type = item.widget.type;
                                }
                                
                                let widget:Widget = WidgetFactory.getWidget(type, label, '', config);
                                widget.setReadonly(readonly);
                                this.model_widgets[field_name] = widget;
                                $cell.append(widget.attach());                
                            }
                            else if(item.type == 'label') {

                            }
                        });
                    });
                });                
            });
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
        let $hrow = $('<tr/>').append( UIHelper.createTableCellCheckbox(true) );

        // create other columns, based on the col_model given in the configuration
        let schema = this.view.getViewSchema();
        $.each(schema.layout.items, (i, item) => {
            
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
                        }, 100);
                    }
                });

                if(sortable) {
                    $cell.addClass('sortable').attr('data-sort', 'asc');
                }
                $hrow.append($cell);
            }

        });

        $thead.append($hrow);

        this.$layout.append($elem)


        UIHelper.decorateTable($elem);

    }
    
    private feed(objects: []) {
        console.log('Layout::feed');
        
        switch(this.view.type) {
            case 'form':
                this.feedForm(objects);
                break;
            case 'list':
                this.$layout.find("tbody").remove();
                this.feedList(objects);
                break;
        }
    }
    
    private feedList(objects: any) {
        console.log('Layout::feed', objects);

        let $elem = this.$layout.children().first();
        $elem.find('tbody').remove();

        let $tbody = $('<tbody/>');       

        for (let id of Object.keys(objects)) {
            let object = objects[id];
            let $row = $('<tr/>');

            UIHelper.createTableCellCheckbox().appendTo($row).find('input').attr('data-id', object.id);
           
            for(let field of Object.keys(object)) {
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

                if(view_def.hasOwnProperty('widget')) {
                    type = view_def.widget.type;
                }

                let widget:Widget = WidgetFactory.getWidget(type, '', object[field]);

                let $cell = $('<td/>').append(widget.render());
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
        let ids = Object.keys(objects);
        if(ids.length > 0) {
            let object_id = ids[0];
            let object:any = objects[object_id];
            for(let field of Object.keys(object)) {
                let widget = this.model_widgets[field];
                let $parent = this.$layout.find('#'+widget.getId()).parent().empty();

                widget.setMode(this.view.getMode()).setValue(object[field]);

                let $widget = widget.render();

                $widget.on('_updatedWidget', (event:any, new_value: any) => {
                    console.log('Layout : received widget change event for field '+field, new_value);
                    object[field] = new_value;
// todo : use fields only (not full object)                    
                    this.view.onchangeViewModel([object_id], object);
                                        
                    console.log(this.view.getModel().get())
                });
                console.log('config', widget.getConfig());
                let config = widget.getConfig();
// todo handle visibility tests (domain)                
                if(config.hasOwnProperty('visible')) {

                    let domain = new Domain(config.visible);
                    if( domain.evaluate(object) ) {
                        $parent.append($widget);    
                    }
                    else {
                        $parent.append(widget.attach());
                    }                    
                }
                else {
                    $parent.append($widget);
                }
                
            }    
        }
    }
    
}

export default Layout;