import { $ } from "jquery-lib";
import { ApiService } from "equal-services";

import View from "View";
import Model from "Model";

/*
    There are two main braches of Layouts depending on what is to be displayed:
        - 1 single object : Form 
        - several objects : List (grid, kanban, graph)
        
    Forms can be displayed in two modes : 'view' or 'edit'
    Lists can be editable on a Cell basis (using Widgets)
*/

export class Layout {

    private schema: object;

    private view: View;             // parent view the layout belongs to
    
    private $layout: object;
    
    /**
     *
     * @param view  View    Parent View object
     * @param shema object  The view schema (obtained by parent View object)
     */
    constructor(view:View, schema: object) {
        this.view = view;
        this.schema = schema;
        this.$layout = $('<div />');
        this.init();
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
    public refresh() {
        console.log('Layout::refresh');
        
        // feed layout with updated Model
        
        this.$layout.detach();
        
        this.feed(this.view.getModel().get());
        
        this.view.$layoutContainer.append(this.$layout);
        
        // request a refresh from material-design-lite
        componentHandler.upgradeDom();
    }
    
    
    private layout() {
        console.log('Layout::layout');
        
        
        switch(this.view.type) {
            case 'form':
                break;
            case 'list':
                break;
        }        
        
        
        // create table
        let $table = $('<table/>').css({"width": "100%"}).addClass('mdl-data-table mdl-js-data-table mdl-data-table--selectable mdl-shadow');
        let $thead = $('<thead/>');

        
        // instanciate header row and the first column which contains the 'select-all' checkbox
        let $hrow = $('<tr/>');


        // create other columns, based on the col_model given in the configuration
        $.each(this.schema.layout.items, function(i, item) {
            
            let align = (item.hasOwnProperty('align'))?item.align:'left';
            let label = (item.hasOwnProperty('label'))?item.label:item.value.charAt(0).toUpperCase() + item.value.slice(1);
            
            let $cell = $('<th/>').attr('name', item.value).append(label)
                .hover(
                    // The div style attr 'asc' or 'desc' is for the display of the arrow
                    // the th style attr 'asc' or 'desc' is to memorize the current order
                    // so, when present, both attributes should always be inverted                       
                    function() {
                        // set hover and sort order indicator
                        let $this = $(this);
                        let $div = $('div', $this);
                        let $sorted = $thead.find('.sorted');
                        $this.addClass('thOver');                        
                        if($sorted.attr('name') == $this.attr('name') && $div.hasClass('asc')) {
                            $div.removeClass('asc').addClass('desc');
                        }
                        else {
                            $div.removeClass('desc').addClass('asc');
                        }
                    }, 
                    function() {
                        // unset hover and sort order indicator
                        let $this = $(this);
                        let $div = $('div', $this);
                        let $sorted = $thead.find('.sorted');
                        $this.removeClass('thOver');
                        $div.removeClass('asc').removeClass('desc');						
                        if($sorted.attr('name') == $this.attr('name')) {
                            if($this.hasClass('asc')) $div.addClass('asc');
                            else $div.addClass('desc');
                        }
                    })
            
            /**
                .click(
                    function() {
                        // change sortname and/or sortorder
                        $this = $(this);
                        $sorted = $thead.find('.sorted');
                        $div = $('div', $this);
                        if($sorted.attr('name') == $this.attr('name')) {
                            if($div.hasClass('asc')) {
                                $div.removeClass('asc').addClass('desc');
                                $this.removeClass('desc').addClass('asc');
                                conf.sortorder = 'asc';
                            }								
                            else {
                                $div.removeClass('desc').addClass('asc');
                                $this.removeClass('asc').addClass('desc');
                                conf.sortorder = 'desc';									
                            }
                        }
                        else {
                            $this.addClass('sorted').addClass('asc');
                            $div.removeClass('asc').addClass('desc');
                            $sorted.removeClass('sorted').removeClass('asc').removeClass('desc');
                            $('div', $sorted).removeClass('asc').removeClass('desc');
                            conf.sortorder = 'asc';
                        }
                        conf.sortname = $this.attr('name');
                        // uncheck selection box
                        if(conf.selectable)
                            $("input:checkbox", $thead)[0].checked = false;
                        self.feed($grid, conf);
                    }
                );
            if(col.name == conf.sortname) {
                $cell.addClass('sorted').addClass(conf.sortorder);
                $('div', $cell).addClass(conf.sortorder);
            }
            */
            $hrow.append($cell);
        });
        
        this.$layout.append($table.append($thead.append($hrow)));
    }
    
    private feed(objects: array) {
        let $tbody = $('<tbody/>');
       
        console.log('Layout::feed', objects);
        $.each(objects, function(i, object) {
            let $row = $('<tr/>');
            for(let field of Object.keys(object)) {               
                let $cell = $('<td/>').text(object[field]);
                $row.append($cell);
            }
            $tbody.append($row);
        });
        
        this.$layout.find("table").append($tbody);
    }
    
}

module.exports = Layout;