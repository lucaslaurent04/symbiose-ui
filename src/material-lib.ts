import {MDCFormField} from '@material/form-field';
import {MDCRipple} from '@material/ripple';
import {MDCCheckbox} from '@material/checkbox';
import {MDCTextField} from '@material/textfield';
import {MDCDataTable} from '@material/data-table';
import {MDCSelect} from '@material/select';
import {MDCMenu} from '@material/menu';

import { $ } from "./jquery-lib";

class UIHelper {

/*
 Helpers for element creation
*/
    public static createButton(id:string, label:string, type:string = '', icon:string = '')  {        
        let $button = $('<button/>').attr('id', id);

        if(['outlined', 'raised', 'text'].indexOf(type) >= 0) {
            $button.addClass('mdc-button mdc-button--touch')
            .append($('<span/>').addClass('mdc-button__ripple'));

            if(icon.length) {
                $button.append($('<i/>').addClass('material-icons mdc-button__icon').text(icon))
            }
            $button.append($('<span/>').attr('for', id).addClass('mdc-button__label').text(label));
    
            switch(type) {
                case 'outlined':
                    $button.addClass('mdc-button--outlined');
                    break;
                case 'raised':
                    $button.addClass('mdc-button--raised');
                    break;
                case 'text':
                default:
            }
            new MDCRipple($button[0]);
        }
        else if(['fab', 'mini-fab'].indexOf(type) >= 0) {
            $button.addClass('mdc-fab mdc-fab--touch')
            .append($('<div/>').addClass('mdc-fab__ripple'));
            if(type == 'mini-fab') {
                $button.addClass('mdc-fab--mini')
            }
            $button.append($('<span/>').addClass('material-icons mdc-fab__icon').text(icon))
            $button.append($('<div/>').addClass('mdc-fab__touch'));
            new MDCRipple($button[0]);
        }
        else if(['icon'].indexOf(type) >= 0) {
            $button.addClass('mdc-icon-button material-icons')
            .append( $('<span />').addClass('mdc-button__icon').text(icon) );
        }
        
        return $button;
    }

    public static createIcon(icon: string) {
        let $elem = $('<span class="material-icons">'+icon+'</span>');
        return $elem;
    }

    public static createInput(id:string, label:string, value:string, disabled: boolean = false) {
        let $elem = $('\
        <label class="mdc-text-field mdc-text-field--filled"> \
            <span class="mdc-text-field__ripple"></span> \
            <span class="mdc-floating-label" id="my-label-id">'+label+'</span> \
            <input '+( (disabled)?'disabled':'' )+' class="mdc-text-field__input" type="text" aria-labelledby="my-label-id" value="'+value+'"> \
            <span class="mdc-line-ripple"></span>\
        </label>');
        new MDCTextField($elem[0]);
        return $elem
    }

    public static createInputView(id:string, label:string, value:string) {
        let $elem = $('\
        <label class="sb-view-form-field-mode-view mdc-text-field mdc-text-field--filled"> \
            <span class="sb-view-form-field-label mdc-floating-label" id="my-label-id">'+label+'</span> \
            <input disabled class="mdc-text-field__input" type="text" aria-labelledby="my-label-id" value="'+value+'"> \
            <span class="mdc-line-ripple"></span>\
        </label>');
        new MDCTextField($elem[0]);
        return $elem
    }

    public static createDatePicker() {
        let $elem = $('<div />').datepicker();
        return $elem;
    }

    public static createCheckbox(id:string, label:string) {
        let $elem = $('\
        <div class="mdc-form-field"> \
            <div class="mdc-checkbox"> \
                <input type="checkbox" class="mdc-checkbox__native-control" id="'+id+'"/> \
                <div class="mdc-checkbox__background"> \
                    <svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24"> \
                        <path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59"/> \
                    </svg> \
                    <div class="mdc-checkbox__mixedmark"></div> \
                </div> \
                <div class="mdc-checkbox__ripple"></div> \
            </div> \
            <label for="'+id+'">'+label+'</label> \
        </div>');
      
        return $elem;
    }

    public static createListItem(label: string) {
        let $elem = $('\
        <li class="mdc-list-item"> \
            <span class="mdc-list-item__ripple"></span> \
            <span class="mdc-list-item__text">'+label+'</span> \
        </li>');

        new MDCRipple($elem[0]);
        return $elem;
    }

    public static createListItemCheckbox(id: string, label: string) {
        let $elem = $('\
        <li class="mdc-list-item"> \
            <div class="mdc-touch-target-wrapper"> \
                <div class="mdc-checkbox mdc-checkbox--touch"> \
                    <input type="checkbox" class="mdc-checkbox__native-control" id="'+id+'"/> \
                    <div class="mdc-checkbox__background"> \
                        <svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24"> \
                            <path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59"/> \
                        </svg> \
                        <div class="mdc-checkbox__mixedmark"></div> \
                    </div> \
                    <div class="mdc-checkbox__ripple"></div> \
                </div> \
            </div> \
            <span class="mdc-list-item__ripple"></span> \
            <span class="mdc-list-item__text">'+label+'</span> \
        </li>');
        
        new MDCRipple($elem[0]);
        return $elem;
    }    

    public static createTableCellCheckbox(is_header:boolean = false) {
        let elem = (is_header)?'th':'td';
        let suffix = (is_header)?'header-':'';
        let $elem = $('\
        <'+elem+' class="mdc-data-table__'+suffix+'cell mdc-data-table__'+suffix+'cell--checkbox"> \
            <div class="mdc-checkbox mdc-data-table__'+suffix+'row-checkbox"> \
            <input type="checkbox" class ="mdc-checkbox__native-control" /> \
            <div class="mdc-checkbox__background"> \
                <svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24"><path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59" /></svg> \
                <div class="mdc-checkbox__mixedmark"></div> \
            </div> \
            <div class="mdc-checkbox__ripple"></div> \
        </'+elem+'> \
        ');
        
        new MDCRipple($elem[0]);
        return $elem;
    }    

    public static createChip(label: string) {
        let $elem = $(' \
        <div class="mdc-chip" role="row"> \
            <div class="mdc-chip__ripple"></div> \
            <span role="gridcell"> \
                <span role="button" tabindex="0" class="mdc-chip__primary-action"> \
                <span class="mdc-chip__text">'+label+'</span> \
                </span> \
            </span> \
            <span role="gridcell"> \
                <i class="material-icons mdc-chip__icon mdc-chip__icon--trailing" tabindex="-1" role="button">cancel</i> \
            </span> \
        </div>');
        return $elem;        
    }

    public static createSelect(id: string, label: string, values: any, selected: any='') {
        let $elem = $('\
        <div class="mdc-select mdc-select--filled '+( (label.length)?'':'mdc-select--no-label' )+' "> \
            <div class="mdc-select__anchor" role="button" tabindex="0"> \
                <span class="mdc-select__ripple"></span> \
                '+ ( (label.length)?'<span class="mdc-floating-label">'+label+'</span>':'' ) +'\
                <span class="mdc-select__selected-text-container"> \
                    <span class="mdc-select__selected-text">'+selected+'</span> \
                </span> \
                <span class="mdc-select__dropdown-icon"> \
                    <svg class="mdc-select__dropdown-icon-graphic" viewBox="7 10 10 5"> \
                        <polygon class="mdc-select__dropdown-icon-inactive" stroke="none" fill-rule="evenodd" points="7 10 12 15 17 10"></polygon> \
                        <polygon class="mdc-select__dropdown-icon-active" stroke="none" fill-rule="evenodd" points="7 15 12 10 17 15"></polygon> \
                    </svg> \
                </span> \
                <span class="mdc-line-ripple"></span> \
            </div> \
            <div class="mdc-select__menu mdc-menu mdc-menu-surface mdc-menu-surface--fullwidth" role="listbox"> \
                <input type="text" style="display: none" /> \
                <ul class="mdc-list"> \
                </ul> \
            </div> \
        </div>');

        // we recevied an object as param
        let $list = $elem.find('ul.mdc-list');
        if( (!!values) && (values.constructor === Object)) {
            for(let key in values) {
                let $line = $(' \
                <li class="mdc-list-item" role="option" data-value="'+key+'"> \
                    <span class="mdc-list-item__ripple"></span> \
                    <span class="mdc-list-item__text">'+values[key]+'</span> \
                </li>');
                if(key == selected) {
                    $line.addClass('mdc-list-item--selected').attr('aria-selected', 'true');
                }
                $list.append($line);
            }        
        }
        // we received an array
        else {
            for(let value of values) {
                let $line = $(' \
                <li class="mdc-list-item" role="option" data-value="'+value+'"> \
                    <span class="mdc-list-item__ripple"></span> \
                    <span class="mdc-list-item__text">'+value+'</span> \
                </li>');
                if(value == selected) {
                    $line.addClass('mdc-list-item--selected').attr('aria-selected', 'true');
                }
                $list.append($line);
            }
        }

        const select = new MDCSelect($elem[0]);

        // make the element behave like an `input` element
        select.listen('MDCSelect:change', () => {
            $elem.find('input').val(select.value).trigger('change');
        });

      return $elem;
    }


    public static createPagination() {
        let $elem = $(' \
        <div class="mdc-data-table__pagination"> \
            <div class="mdc-data-table__pagination-trailing"> \
                <div class="pagination-rows-per-page mdc-data-table__pagination-rows-per-page"></div> \
                <div class="pagination-navigation mdc-data-table__pagination-navigation"> \
                    <div class="pagination-total mdc-data-table__pagination-total"></div> \
                </div> \
            </div> \
        </div>');
        return $elem;
    }


    public static createPaginationSelect(id: string, label: string, values: any, selected: any='') {
        let $elem  = UIHelper.createSelect(id, label, values, selected);
        $elem.addClass('mdc-data-table__pagination-rows-per-page-select');
        return $elem;
    }
 /*
  Decorators 
 */

    public static decorateTable($elem:any) {

        $elem.addClass('mdc-data-table').children().addClass('mdc-data-table__table-container');

        let $thead = $elem.find('thead');
        let $head_rows = $thead.find('tr').addClass('mdc-data-table__header-row');
        let $head_cells = $thead.find('th').addClass('mdc-data-table__header-cell').attr('role', 'columnheader').attr('scope', 'col');

        let $table = $elem.find('table').addClass('mdc-data-table__table');
        let $tbody = $table.find('tbody').addClass('mdc-data-table__content');
        let $rows = $tbody.find('tr').addClass('mdc-data-table__row');
        let $cells = $tbody.find('td').addClass('mdc-data-table__cell');

        /*
         handler for click on header checkbox
        */
        $thead.find('th:first-child')
        .find('input[type="checkbox"]:not([data-decorated])')
        .attr('data-decorated', '1')
        .on('change', (event:any) => {
            console.log('tr onchange');
            let $this = $(event.currentTarget);
            if($this.prop('checked')) {
                console.log('marking as checked');
                $table.find('tbody').find('td:first-child').find('input[type="checkbox"]').prop('checked', true);
                $table.find('tbody').find('tr').addClass('mdc-data-table__row--selected');
            }
            else {
                console.log('marking as unchecked');
                $table.find('tbody').find('td:first-child').find('input[type="checkbox"]').prop('checked', false);
                $table.find('tbody').find('tr').removeClass('mdc-data-table__row--selected');
            }
        });

        /*
         handler for click on rows checkboxes
        */
        $tbody.find('td:first-child')
        .find('input[type="checkbox"]:not([data-decorated]')
        .attr('data-decorated', '1')
        .on('change', (event:any) => {
            console.log('td onchange');
            let $this = $(event.currentTarget);
            let $row = $this.closest('tr');

            if($this.prop('checked')) {
                $row.addClass('mdc-data-table__row--selected');
                // all checkboxes checked ?
                if($tbody.find('input:checked').length == $rows.length) {
                    $thead.find('th:first-child').find('input').prop("indeterminate", false).prop("checked", true);
                }
                else {
                    $thead.find('th:first-child').find('input').prop("indeterminate", true).prop("checked", false);
                }
            }
            else {
                $row.removeClass('mdc-data-table__row--selected');
                // none checkboxes checked ?
                if($tbody.find('input:checked').length == 0) {
                    $thead.find('th:first-child').find('input').prop("indeterminate", false).prop("checked", false);
                }
                else {
                    $thead.find('th:first-child').find('input').prop("indeterminate", true).prop("checked", false);
                }
            }
            return true;
        });

        /*
         handlers for column sorting
        */
        $thead.find('th:not([data-decorated]')
        .attr('data-decorated', '1')
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
                        console.log('column is not sorted');
                        $thead.find('.sorted').removeClass('sorted').removeClass('asc').removeClass('desc');
                        $this.addClass('sorted').addClass(<string>$this.attr('data-sort'));
                    }
                    // toggle sorting order
                    else {
                        console.log('column is sorted');
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
                    }
                }
            }
        );

        // new MDCDataTable($elem);
    }
}

export { 
    MDCFormField, MDCRipple, MDCSelect, MDCCheckbox, MDCDataTable, MDCMenu, UIHelper
}