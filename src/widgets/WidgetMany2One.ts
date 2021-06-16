import Widget from "./Widget";
import { UIHelper } from '../material-lib';
import { ApiService, TranslationService } from "../equal-services";

export default class WidgetMany2One extends Widget {
    

    constructor(label: string, value: any, config: any) {
        super('many2one', label, value, config);
    }

    public render():JQuery {
        console.log('WidgetMany2One::render', this.config, this.mode, this.value);
        let $elem: JQuery;

        let value:string = this.value?this.value:'';
        let domain:any = [];
        if(this.config.hasOwnProperty('domain')) {
            domain = this.config.domain;
        }
// todo : fetch 5 first objects from config.foreign_object (use config.domain) + add an extra line ("advanced search...")
// on right side of widget, add an icon to open the target object (current selection) into a new context

        switch(this.mode) {
            case 'edit':
                $elem = $('<div />');                
                ApiService.collect(this.config.foreign_object, domain, ['id', 'name'], 'id', 'asc', 0, 5, this.config.lang)
                .then( (objects:any) => {
                    let values:any = {};
                    for(let object of objects) {
                        values[object.id] = object.name;
                    }
                    let $select = UIHelper.createSelect('', this.label, values, value).css({"width": "calc(100% - 48px)"});
                    let $list = $select.find('.mdc-list');
                    UIHelper.createListDivider().appendTo($list);

                    let $sublist = $('<ul>').addClass('mdc-list').appendTo($select.find('.mdc-menu'))
                    let $link = UIHelper.createListItem('<a href="#">'+TranslationService.instant('SB_WIDGETS_MANY2ONE_ADVANCED_SEARCH')+'</a>').appendTo($sublist);        
                    let $button = UIHelper.createButton('m2o-actions', '', 'icon', 'open_in_new');

                    $elem.append($select); 
                    $elem.append($button); 
                    
                    // setup events handlers

                    // upon value change, relay updated value to parent layout
                    $select.find('input').on('change', (event) => {
                        console.log('WidgetMany2One : received change event');
                        let $this = $(event.currentTarget);
                        let value = $this.val();
                        this.value = {id: value};
                        $elem.trigger('_updatedWidget');
                    });

                    // upon 'advanced search' click, request a new Context for selecting an existing object to add to current selection
                    $link.on('click', async () => {
                        $('#sb-events').trigger('_openContext', {
                            entity: this.config.foreign_object, 
                            type: 'list', 
                            name: 'default', 
                            domain: domain, 
                            mode: 'view', 
                            purpose: 'select',
                            callback: (data:any) => {
                                console.log(data);
                                if(data && data.selection) {
                                    this.value = {id: data.selection[0]};
                                    $elem.trigger('_updatedWidget');
                                }
                            }
                        });
                        return false;
                    });                   
                });                            
                break;
            case 'view':
            default:                
                $elem = $('<span/>').text(value);
                $elem = UIHelper.createInputView('', this.label, value);                
                break;
        }


        $elem.addClass('sb-widget').attr('id', this.getId());

        return $elem;
    }    
}