import { $ } from "jquery-lib";
import { ApiService } from "equal-services";

import View from "View";
import Model from "Model";

/*
    There are two main branches of Layouts depending on what is to be displayed:
        - 1 single object : Form 
        - several objects : List (grid, kanban, graph)
        
    Forms can be displayed in two modes : 'view' or 'edit'
    Lists can be editable on a Cell basis (using Widgets)
*/

export class Layout {

    private schema: object;

    private view: View;             // parent view the layout belongs to
    
    private $layout: object;
    
    // reference to the parent View fields Map
    private fields: Map;
    
    /**
     *
     * @param view  View    Parent View object
     * @param shema object  The view schema (obtained by parent View object)
     */
    constructor(view:View, schema: object, fields: Map) {
        this.view = view;
        this.schema = schema;
        this.fields = fields;
        this.$layout = $('<div />').addClass('sb-layout');
        this.view.$layoutContainer.append(this.$layout);
        this.init();
    }

    public async init() {
        console.log('Layout::init');        
        try {
            // initialize the layout
            this.layout();
            this.decorate();
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
        else {
            this.undecorate();
        }

        // feed layout with updated Model
        this.feed(this.view.getModel().get());
        
        // request a refresh from UI library (material-design-lite)
        this.decorate();        

    }
    
    private undecorate() {
        console.log('Layout::undecorate');
        switch(this.view.type) {
            case 'form':
                
                break;
            case 'list':
                 // downgrade the table element (upgrade is mad on the whole table and cannot be limited to tbody)
                let $table = this.$layout.find("table").removeAttr('data-upgraded').removeClass('is-upgraded');
                // remove first colum header (selection)
                $table.find('th').first().remove();
                break;
        }         
        
    }
    
    private decorate() {
        console.log('Layout::decorate');
        switch(this.view.type) {
            case 'form':
                
                break;
            case 'list':
                // componentHandler.upgradeElement(this.$layout.find("table")[0]);
                componentHandler.upgradeDom();
                break;
        }         
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
    }
    
    private layoutList() {
        // create table
        let $table = $('<table/>').css({"width": "100%"}).addClass('mdl-data-table mdl-js-data-table mdl-data-table--selectable');
        let $thead = $('<thead/>');

        
        let $button = $('<button/>').attr('id', 'menu1').addClass('sb-fields-toggle').addClass('mdl-button mdl-js-button mdl-button--icon').append($('<i/>').addClass('material-icons').text('more_vert'));

        

        let $menu = $('<ul/>').attr('for', 'menu1').addClass('mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect');


            
        // instanciate header row and the first column which contains the 'select-all' checkbox
        let $hrow = $('<tr/>');


        // create other columns, based on the col_model given in the configuration
        $.each(this.schema.layout.items, (i, item) => {
            
            let align = (item.hasOwnProperty('align'))?item.align:'left';
            let label = (item.hasOwnProperty('label'))?item.label:item.value.charAt(0).toUpperCase() + item.value.slice(1);
            let sortable = (item.hasOwnProperty('sortable') && item.sortable);
            let width = (item.hasOwnProperty('width'))?parseInt(item.width, 10):-1;

            let $menu_item = $('<li/>').addClass('mdl-menu__item');                
            let $checkbox = $('<input type="checkbox"/>').attr('id', 'sb-fields-toggle-checkbox-'+item.value).addClass('mdl-checkbox__input');
            $menu_item.append($('<label/>').attr('for', 'sb-fields-toggle-checkbox-'+item.value).addClass('mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect').append($checkbox).append($('<span/>').addClass('mdl-checkbox__label').text(label)));
            
            
            $checkbox.on('change', (event) => {
                let $this = $(event.currentTarget);
                let def = this.fields.get(item.value);
                if($this.is(":checked")) {
                    def.width = "10%";
                }
                else {
                    def.width = "0%";
                }                
                this.fields.set(item.value, def);
                this.view.onchangeModel(true);
            });
            
            if(width != 0) {
  
                $checkbox.attr('checked', 'checked');
                
                let $cell = $('<th/>').attr('name', item.value).append(label)
                .hover(
                    function() {
                        // set hover and sort order indicator
                        let $this = $(this);
                        $this.addClass('hover');
                        if($this.hasClass('sortable')) {
                            if($this.hasClass('sorted')) {
                                if($this.hasClass('asc')) {
                                    $this.removeClass('asc').addClass('desc');
                                }
                                else {
                                    $this.removeClass('desc').addClass('asc');
                                }
                            }
                            else {
                                $this.addClass('asc');
                            }
                        }
                    }, 
                    function() {
                        // unset hover and sort order indicator
                        let $this = $(this);
                        $this.removeClass('hover');
                        if($this.hasClass('sortable')) {
                            if($this.hasClass('sorted')) {
                                if($this.hasClass('asc')) {
                                    $this.removeClass('asc').addClass('desc');
                                }
                                else {
                                    $this.removeClass('desc').addClass('asc');
                                }
                            }
                            else {
                                $this.removeClass('asc');
                            }
                        }
                    }
                )
                .click(
                    (event) => {
                        let $this = $(event.currentTarget);
                        // change sortname and/or sortorder
                        if($this.hasClass('sortable')) {
                            // set order according to column field
                            if(!$this.hasClass('sorted')) {
                                $thead.find('.sorted').removeClass('sorted').removeClass('asc').removeClass('desc');
                                $this.addClass('sorted');
                                this.view.order = $this.attr('name');
                                this.view.onchangeView();
                            }
                            // toggle sorting order
                            else {
                                let sort = $this.attr('data-sort');
                                if(sort == 'asc') {
                                    $this.removeClass('asc').addClass('desc');
                                    sort = 'desc';
                                }
                                else {
                                    $this.removeClass('desc').addClass('asc');
                                    sort = 'asc';
                                }
                                $this.attr('data-sort', sort);
                                this.view.sort = sort;
                                this.view.onchangeView();
                            }
                        }
                    }
                );

                if(sortable) {
                    $cell.addClass('sortable').attr('data-sort', 'asc');
                }
                $hrow.append($cell);
            }
            $menu.append($menu_item);
        });

        this.$layout.append($button);
        this.$layout.append($menu);
        // componentHandler.upgradeElement($button[0]);            
        // componentHandler.upgradeElement($menu[0]);
        
        this.$layout.append($table.append($thead.append($hrow)));        
    }
    
    private feed(objects: array) {
        // flush 
        
        
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
    
    private feedList(objects: array) {
        console.log('Layout::feed', objects);
        
        let $tbody = $('<tbody/>');       

        $.each(objects, (i, object) => {
            let $row = $('<tr/>');
            for(let field of Object.keys(object)) {
                let def = this.fields.get(field);
                // field is not part of the view, skip it
                if(def == undefined) continue;
                let width = (def.hasOwnProperty('width'))?parseInt(def.width, 10):-1;
                // do not show fields with no width
                if(width == 0) continue;
                let $cell = $('<td/>').text(object[field]);
                $row.append($cell);
            }
            $tbody.append($row);
        });
        
        this.$layout.find("table").append($tbody);        
    }
    
    private feedForm(objects: array) {
    }
    
}

module.exports = Layout;