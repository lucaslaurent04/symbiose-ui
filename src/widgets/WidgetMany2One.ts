import Widget from "./Widget";
import { UIHelper } from '../material-lib';
import { ApiService, TranslationService } from "../equal-services";

import Domain from "../Domain";

export default class WidgetMany2One extends Widget {
    

    constructor(label: string, value: any, config: any) {
        super('many2one', label, value, config);
    }

    public render():JQuery {
        console.log('WidgetMany2One::render', this.config, this.mode, this.value);
        let $elem: JQuery;

        // in edit mide, we should have received an id, and in view mode, a name
        let value:string = this.value?this.value:'';
        let domain:any = [];
        if(this.config.hasOwnProperty('domain')) {
            domain = this.config.domain;
        }

// #todo : display many2one as sub-forms

        switch(this.mode) {
            case 'edit':
                let objects:Array<any> = [];
                $elem = $('<div />');

                let $select = UIHelper.createInput('', this.label, value).addClass('mdc-menu-surface--anchor').css({"width": "calc(100% - 48px)", "display": "inline-block"});
                let $menu = UIHelper.createMenu('').appendTo($select);        
                let $menu_list = UIHelper.createList('').appendTo($menu);
                let $link = UIHelper.createListItem('<a href="#">'+TranslationService.instant('SB_WIDGETS_MANY2ONE_ADVANCED_SEARCH')+'</a>');
                // on right side of widget, add an icon to open the target object (current selection) into a new context                    
                let $button = UIHelper.createButton('m2o-actions', '', 'icon', 'open_in_new');

                $elem.append($select); 
                $elem.append($button); 

                UIHelper.decorateMenu($menu);

                let feedObjects = () => {
                    let tmpDomain = new Domain(['name', 'ilike', '%'+$select.find('input').val()+'%']);
                    tmpDomain.merge(new Domain(domain));
                    // fetch 5 first objects from config.foreign_object (use config.domain) + add an extra line ("advanced search...")
                    ApiService.collect(this.config.foreign_object, tmpDomain.toArray(), ['id', 'name'], 'id', 'asc', 0, 5, this.config.lang)
                    .then( (response:any) => {
                        objects = response;
                        $menu_list.empty();
                        for(let object of objects) {
                            UIHelper.createListItem(object.name)
                            .appendTo($menu_list)
                            .attr('id', object.id)
                            .on('click', (event) => {
                                $select.find('input').val(object.name);
                                $select.trigger('change');
                            })
                        }
                        $menu_list.append(UIHelper.createListDivider());
                        $menu_list.append($link);
                    })
                    .catch( (response) => {
                        console.log(response);
                    });
                };

                // make the menu sync with its parent width (menu is 'fixed')
                $select.on('click', () => {                    
                    $select.find('.mdc-menu-surface').width(<number>$select.width());
                    $menu.trigger('_toggle');                    
                });

                let timeout:any = null;

                $select.find('input')
                .on('keyup', () => {                        
                    if(timeout) {
                        clearTimeout(timeout);
                    }
                    timeout = setTimeout(() => {
                        timeout = null;
                        feedObjects();
                    }, 300);

                });

                // upon value change, relay updated value to parent layout
                $select.on('change', (event) => {
                    console.log('WidgetMany2One : received change event');
                    // m2o relations are always loaded as an object with {id:, name:}
                    let value = $select.find('input').val();
                    let object = objects.find( o => o.name == value);
                    if(object) {
                        this.value = {id: object.id, name: value};
                        $elem.trigger('_updatedWidget');    
                    }
                });              

                $link.on('click', async () => {
                    $('#sb-events').trigger('_openContext', {
                        entity: this.config.foreign_object, 
                        type: (this.config.hasOwnProperty('view_type'))?this.config.view_type:'list',
                        name: (this.config.hasOwnProperty('view_name'))?this.config.view_name:'default',
                        domain: domain, 
                        mode: 'view', 
                        purpose: 'select',
                        callback: (data:any) => {
                            if(data && data.selection && data.objects) {
                                // m2o relations are always loaded as an object with {id:, name:}
                                let object = data.objects.find( (o:any) => o.id == data.selection[0] );
                                this.value = {id: object.id, name: object.name};
                                $elem.trigger('_updatedWidget');
                            }
                        }
                    });
                    return false;
                });

                $button.on('click', async () => {
                    let value = $select.find('input').val();
                    let object = objects.find( o => o.name == value);
                    if(object && object.hasOwnProperty('id')) {
                        let object = objects.find( o => o.name == value);
                        $('#sb-events').trigger('_openContext', {entity: this.config.foreign_object, type: 'form', domain: ['id', '=', object.id]});
                    }
                });

                // init list content
                feedObjects();                
                break;
            case 'view':
            default:                
                $elem = $('<span/>').text(value);
                $elem = UIHelper.createInputView('', this.label, value);                
                break;
        }


        $elem.addClass('sb-widget').addClass('sb-widget-mode-'+this.mode).attr('id', this.getId());

        return $elem;
    }    
}