import { $ } from "./jquery-lib";
import { ApiService } from "./equal-services";
import { WidgetInput } from "./equal-widgets";
import { UIHelper, MDCMenu, MDCDataTable } from './material-lib';

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

    private decorator: any;
        
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
                // let $table = this.$layout.find("table").removeAttr('data-upgraded').removeClass('is-upgraded');
                // remove first colum header (selection)
                // $table.find('th').first().remove();
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
                // componentHandler.upgradeDom();
                break;
        }         
    }

    
    public getSelected() {
        var selection = <any>[];
        let $tbody = this.$layout.find("tbody");
        $tbody.find("tr.is-selected").each( (i:number, elem:any) => {
            selection.push($(elem).attr('id'));
        });
        console.log('selection', selection);
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

        let $table = $('<table/>').css({"width": "100%"}).addClass('mdc-data-table__table');

        let $elem = $('<div/>').addClass('mdc-data-table').css({"width": "100%"})
        .append(
            $('<div/>').addClass('mdc-data-table__table-container').css({"width": "100%"})
            .append($table)
        );

        let $thead = $('<thead/>');
        let $tbody = $('<tbody/>').addClass('mdc-data-table__content');
        $table.append($thead).append($tbody);

       

            
        // instanciate header row and the first column which contains the 'select-all' checkbox
        let $hrow = $('<tr/>').addClass('mdc-data-table__header-row');

        $hrow.append(
            $('<th/>').addClass('mdc-data-table__header-cell mdc-data-table__header-cell--checkbox').attr('role', 'columnheader').attr('scope', 'col')
            .append(
                $('<div/>').addClass('mdc-checkbox mdc-data-table__header-row-checkbox mdc-checkbox--selected')
                .append($('<input/>').attr('type', 'checkbox').addClass('mdc-checkbox__native-control'))
                .append(
                    $('<div/>').addClass('mdc-checkbox__background')
                    .append($('<svg viewBox="0 0 24 24"><path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59" /></svg>').addClass('mdc-checkbox__checkmark'))
                    .append($('<div/>').addClass('mdc-checkbox__mixedmark'))
                )
                .append($('<div/>').addClass('mdc-checkbox__ripple'))
            )            
        );


        // create other columns, based on the col_model given in the configuration
        let schema = this.view.getViewSchema();
        $.each(schema.layout.items, (i, item) => {
            
            let align = (item.hasOwnProperty('align'))?item.align:'left';
            let label = (item.hasOwnProperty('label'))?item.label:item.value.charAt(0).toUpperCase() + item.value.slice(1);
            let sortable = (item.hasOwnProperty('sortable') && item.sortable);
            let visible = (item.hasOwnProperty('visible'))?item.visible:true;

            let $menu_item = $('<li/>').addClass('mdc-list-item').attr('role', 'menuitem');
            
            if(visible) {
                
                let $cell = $('<th/>').attr('name', item.value).addClass('mdc-data-table__header-cell').attr('role', 'columnheader').attr('scope', 'col').append(label)
                .hover(
                    (event:any) => {
                        // set hover and sort order indicator
                        let $this = $(event.currentTarget);
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
                    (event:any) => {
                        // unset hover and sort order indicator
                        let $this = $(event.currentTarget);
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
                .on('click',
                    (event:any) => {
                        let $this = $(event.currentTarget);
                        // change sortname and/or sortorder
                        if($this.hasClass('sortable')) {
                            // set order according to column field
                            if(!$this.hasClass('sorted')) {
                                $thead.find('.sorted').removeClass('sorted').removeClass('asc').removeClass('desc');
                                $this.addClass('sorted');
                                this.view.setOrder(<string>$this.attr('name'));
                                this.view.onchangeView();
                            }
                            // toggle sorting order
                            else {
                                let sort:string = <string>$this.attr('data-sort');
                                if(sort == 'asc') {
                                    $this.removeClass('asc').addClass('desc');
                                    sort = 'desc';
                                }
                                else {
                                    $this.removeClass('desc').addClass('asc');
                                    sort = 'asc';
                                }
                                $this.attr('data-sort', sort);
                                this.view.setSort(sort);
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

        });

        $thead.append($hrow);

        // this.$layout.append($menu);

        this.$layout.append($elem);

        // componentHandler.upgradeElement($button[0]);            
        // componentHandler.upgradeElement($menu[0]);

        console.log($elem[0]);



        this.$layout.append($('\
        <div class="mdc-data-table__pagination"> \
        <div class="mdc-data-table__pagination-trailing"> \
          <div class="mdc-data-table__pagination-rows-per-page"> \
            <div class="mdc-data-table__pagination-rows-per-page-label"> \
              Rows per page \
            </div> \
            <div class="mdc-select mdc-select--outlined mdc-select--no-label mdc-data-table__pagination-rows-per-page-select"> \
              <div class="mdc-select__anchor" role="button" aria-haspopup="listbox" aria-labelledby="demo-pagination-select" tabindex="0"> \
                <span class="mdc-select__selected-text-container"> \
                  <span id="demo-pagination-select" class="mdc-select__selected-text">10</span> \
                </span> \
                <span class="mdc-select__dropdown-icon"> \
                  <svg class="mdc-select__dropdown-icon-graphic" viewBox="7 10 10 5"> \
                    <polygon class="mdc-select__dropdown-icon-inactive" stroke="none" fill-rule="evenodd" points="7 10 12 15 17 10"></polygon> \
                    <polygon class="mdc-select__dropdown-icon-active" stroke="none" fill-rule="evenodd" points="7 15 12 10 17 15"> \
                    </polygon> \
                  </svg> \
                </span> \
                <span class="mdc-notched-outline mdc-notched-outline--notched"> \
                  <span class="mdc-notched-outline__leading"></span> \
                  <span class="mdc-notched-outline__trailing"></span> \
                </span> \
              </div> \
              <div class="mdc-select__menu mdc-menu mdc-menu-surface mdc-menu-surface--fullwidth" role="listbox"> \
                <ul class="mdc-list"> \
                  <li class="mdc-list-item mdc-list-item--selected" aria-selected="true" role="option" data-value="10"> \
                    <span class="mdc-list-item__text">10</span> \
                  </li> \
                  <li class="mdc-list-item" role="option" data-value="25"> \
                    <span class="mdc-list-item__text">25</span> \
                  </li> \
                  <li class="mdc-list-item" role="option" data-value="100"> \
                    <span class="mdc-list-item__text">100</span> \
                  </li> \
                </ul> \
              </div> \
            </div> \
          </div> \
          <div class="mdc-data-table__pagination-navigation"> \
            <div class="mdc-data-table__pagination-total"> \
              1-10 of 100 \
            </div> \
            <button class="mdc-icon-button material-icons mdc-data-table__pagination-button" data-first-page="true" disabled> \
              <div class="mdc-button__icon">first_page</div> \
            </button> \
            <button class="mdc-icon-button material-icons mdc-data-table__pagination-button" data-prev-page="true" disabled> \
              <div class="mdc-button__icon">chevron_left</div> \
            </button> \
            <button class="mdc-icon-button material-icons mdc-data-table__pagination-button" data-next-page="true"> \
              <div class="mdc-button__icon">chevron_right</div> \
            </button> \
            <button class="mdc-icon-button material-icons mdc-data-table__pagination-button" data-last-page="true"> \
              <div class="mdc-button__icon">last_page</div> \
            </button> \
          </div> \
        </div> \
    </div> \
        '));

        this.decorator = new MDCDataTable($elem[0]);
        this.decorator.layout();

    }
    
    private feed(objects: []) {
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
    
    private feedList(objects: []) {
        console.log('Layout::feed', objects);

        this.$layout.find('tbody').remove();

        let $tbody = $('<tbody/>');       

        $.each(objects, (i, object:any) => {
            let $row = $('<tr/>').addClass('mdc-data-table__row');



            if(object.hasOwnProperty('id')) {
                $row.attr('id', object.id).attr('data-row-id', object.id);
            }            
            
            $row.append(
                $('<td/>').addClass('mdc-data-table__cell mdc-data-table__cell--checkbox').attr('role', 'columnheader').attr('scope', 'col')
                .append(
                    $('<div/>').addClass('mdc-checkbox mdc-data-table__row-checkbox')
                    .append($('<input type="checkbox"/>').addClass('mdc-checkbox__native-control'))
                    .append(
                        $('<div/>').addClass('mdc-checkbox__background')
                        .append($('<svg viewBox="0 0 24 24"><path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59" /></svg>').addClass('mdc-checkbox__checkmark'))
                        .append($('<div/>').addClass('mdc-checkbox__mixedmark'))
                    )
                    .append($('<div/>').addClass('mdc-checkbox__ripple'))
                )            
            );

            $row.find('td:first-child').find('input').on('change', (event) => {
                let $this = $(event.currentTarget);

                if($this.prop("checked")) {
                    $row.addClass('mdc-data-table__row--selected');
                    this.$layout.find('thead').find('th:first-child').find('input').prop("indeterminate", true);
                }
                else {
                    $row.removeClass('mdc-data-table__row--selected');
                }
                return true;
            });

            for(let field of Object.keys(object)) {
                let view_def = this.view.getField(field);
                // field is not part of the view, skip it
                if(view_def == undefined) continue;
                let visible = (view_def.hasOwnProperty('visible'))?view_def.visible:true;
                // do not show fields with no width
                if(!visible) continue;


                
                let schema = this.view.getModelFields();

                let model_def = schema[field];
                let $widget:any = $({});

                switch(model_def['type']) {
                    case 'datetime':
                        $widget = $('<span/>').text(new Date(object[field]).toLocaleDateString());
                        break;
                    default:
                        $widget = $('<span/>').text(object[field]);
                }
/*
// todo
                pour chaque objet

                afficher la valeur en fonction 
                1) du type de la colonnes corresondante
                2) du widget, si spécifié
*/

                let $cell = $('<td/>').addClass('mdc-data-table__cell').append($widget);
                $row.append($cell);
            }
            $tbody.append($row);
        });
        
        
        this.$layout.find('table').append($tbody);
        this.decorator.layout();
    }
    
    private feedForm(objects: []) {
    }
    
}

export default Layout;