import { $ } from "./jquery-lib";
import { ApiService } from "./equal-services";
import { Widget, WidgetFactory } from "./equal-widgets";
import { UIHelper } from './material-lib';

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

        
    /**
     *
     * @param view  View    Parent View object
     */
    constructor(view:View) {
        this.view = view;
        this.$layout = $('<div />').addClass('sb-layout');
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
                     
                     
        if(full) {
            this.$layout.empty();
            this.layout();
        }

        // feed layout with updated Model
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
    
    private layoutForm() {
        console.log('Layout::layoutForm');
        let $elem = $('<div/>').css({"width": "100%"});

        let view_schema = this.view.getViewSchema();
        console.log(view_schema);

        view_schema.layout
        $.each(view_schema.layout.groups, (i, group) => {
            let $group = $('<div />').addClass('').appendTo($elem);
            $.each(group.sections, (i, section) => {
                let $section = $('<div />').addClass('').appendTo($group);
                $.each(section.rows, (i, row) => {
                    let $row = $('<div />').addClass('mdc-layout-grid').appendTo($section);
                    $.each(row.columns, (i, column) => {
                        let $column = $('<div />').addClass('mdc-layout-grid__inner').appendTo($row);
                        $.each(column.items, (i, item) => {
                            let $cell = $('<div />').addClass('mdc-layout-grid__cell').appendTo($column);
                            if(item.type == 'field') {
                                let widget:Widget = WidgetFactory.getWidget('input', 'ok');
                                $cell.append(widget.render());                
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
        let $hrow = $('<tr/>').append( UIHelper.createUITableCellCheckbox(true) );

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
    
    private feedList(objects: []) {
        console.log('Layout::feed', objects);

        let $elem = this.$layout.children().first();
        $elem.find('tbody').remove();

        let $tbody = $('<tbody/>');       

        $.each(objects, (i, object:any) => {
            let $row = $('<tr/>');

            UIHelper.createUITableCellCheckbox().appendTo($row).find('input').attr('data-id', object.id);
           
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

                let widget:Widget = WidgetFactory.getWidget(type, object[field]);

                let $cell = $('<td/>').append(widget.render());
                $row.append($cell);
            }
            $tbody.append($row);
        });
        
        
        $elem.find('table').append($tbody);

        UIHelper.decorateTable($elem);

    }
    
    private feedForm(objects: []) {

    }
    
}

export default Layout;