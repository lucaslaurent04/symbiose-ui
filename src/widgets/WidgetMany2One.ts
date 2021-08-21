import Widget from "./Widget";
import { UIHelper } from '../material-lib';
import { ApiService, TranslationService } from "../equal-services";

import Layout from "../Layout";
import Domain from "../Domain";

export default class WidgetMany2One extends Widget {


    constructor(layout: Layout, label: string, value: any, config: any) {
        super(layout, 'many2one', label, value, config);
    }

    public render():JQuery {
        console.log('WidgetMany2One::render', this.config, this.mode, this.value);
        let $elem: JQuery;

        // in edit mode, we should have received an id, and in view mode, a name
        let value:string = this.value?this.value:'';
        let domain:any = [];
        if(this.config.hasOwnProperty('domain')) {
            domain = this.config.domain;
        }

// #todo : display many2one as sub-forms

        // on right side of widget, add an icon to open the target object (current selection) into a new context
        let $button_open = UIHelper.createButton('m2o-actions-open', '', 'icon', 'open_in_new');
        let $button_create = UIHelper.createButton('m2o-actions-create', '', 'icon', 'add');

        switch(this.mode) {
            case 'edit':
                let objects:Array<any> = [];
                $elem = $('<div />');

                let $select = UIHelper.createInput('', this.label, value, this.config.helper, '', this.readonly).addClass('mdc-menu-surface--anchor').css({"width": "calc(100% - 48px)", "display": "inline-block"});

                let $menu = UIHelper.createMenu('').appendTo($select);
                let $menu_list = UIHelper.createList('').appendTo($menu);
                let $link = UIHelper.createListItem('<a style="text-decoration: underline;">'+TranslationService.instant('SB_WIDGETS_MANY2ONE_ADVANCED_SEARCH')+'</a>');

                if(value.length) {
                    $button_create.hide();
                }
                else {
                    $button_open.hide();
                }

                $elem.append($select);
                
                $elem.append($button_open);
                $elem.append($button_create);

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

                if(!this.readonly) {
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
                            $button_create.hide();
                            $button_open.show();
                            this.value = {id: object.id, name: value};
                            $elem.trigger('_updatedWidget');
                        }
                        else {
                            $button_create.show();
                            $button_open.hide();
                        }
                    });
                }

                // open targeted object in new context
                $button_open.on('click', async () => {
                    let value = $select.find('input').val();
                    let object = objects.find( o => o.name == value);
                    if(object && object.hasOwnProperty('id')) {
                        let object = objects.find( o => o.name == value);
                        this.getLayout().openContext({
                            entity: this.config.foreign_object,
                            type: 'form',
                            name: (this.config.hasOwnProperty('view_name'))?this.config.view_name:'default',
                            domain: ['id', '=', object.id]
                        });
                    }
                });

                // open creation form in new context
                $button_create.on('click', async () => {
                    console.log('########################################################', domain);
                    this.getLayout().openContext({
                        entity: this.config.foreign_object,
                        type: 'form',
                        mode: 'edit',
                        purpose: 'create',
                        domain: domain,
                        name: (this.config.hasOwnProperty('view_name'))?this.config.view_name:'default',
                        callback: (data:any) => {
                            if(data && data.selection && data.objects) {
                                if(data.selection.length) {
                                    $button_create.hide();
                                    $button_open.show();            
                                    // m2o relations are always loaded as an object with {id:, name:}
                                    let object = data.objects.find( (o:any) => o.id == data.selection[0] );
                                    this.value = {id: object.id, name: object.name};
                                    $elem.trigger('_updatedWidget');
                                }
                            }
                        }
                    });
                });

                // advanced search
                $link.on('click', async () => {
                    this.getLayout().openContext({
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


                // init list content
                feedObjects();
                break;
            case 'view':
            default:
                $elem = $('<div />');
                let $input = UIHelper.createInputView('', this.label, value.toString());

                switch(this.config.layout) {
                    case 'form':
                        $input.css({"width": "calc(100% - 48px)", "display": "inline-block"});

                        $elem.append($input);
                        $elem.append($button_open);

                        // open targeted object in new context
                        $button_open.on('click', async () => {
                            console.log(this.config);
                            if(this.config.hasOwnProperty('object_id') && this.config.object_id && this.config.object_id > 0) {
                                this.getLayout().openContext({
                                    entity: this.config.foreign_object,
                                    type: 'form',
                                    name: (this.config.hasOwnProperty('view_name'))?this.config.view_name:'default',
                                    domain: ['id', '=', this.config.object_id]
                                });
                            }
                        });
                        break;
                    case 'list':
                    default:
                        $elem.append($input);
                }
                break;
        }


        $elem.addClass('sb-widget').addClass('sb-widget-mode-'+this.mode).attr('id', this.getId());

        return $elem;
    }
}