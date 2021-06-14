import Widget from "./Widget";
import { UIHelper } from '../material-lib';
import View from "../View";
import { ApiService, TranslationService } from "../equal-services";

export default class WidgetMany2Many extends Widget {
    
    protected rel_type: string;

    constructor(label: string, value: any, config: any) {
        super('many2many', label, value, config);
        this.rel_type = 'many2many';
    }

    public render():JQuery {
        console.log('WidgetOne2Many::render', this.config);
        let $elem: JQuery;

        $elem = $('<div />');

        // make sure view is not instanciated during 'layout' phase (while config is still incomplete)
        if(this.config.hasOwnProperty('entity') && this.config.hasOwnProperty('type') && this.config.hasOwnProperty('name')) {

            let view_config = {
                show_actions: false,
                // update the actions of the "current selection" button
                selection_actions: [
                    {
                        title: 'SB_ACTIONS_BUTTON_REMOVE',
                        icon:  'delete',
                        handler: (event:any, selection:any) => {
                            let ids = this.value.map( (o:any) => o.id);
                            for(let id of selection) {
                                let index = ids.indexOf(id);
                                if( index > -1) {
                                    ids[index] = -ids[index];
                                }
                            }
                            this.value = ids.map( (id:number) => ({id: id}) );
                            $elem.trigger('_updatedWidget');
                        }
                    }
                ]
            };

            let view = new View(this.config.entity, 'list', this.config.name, this.config.domain, this.mode, 'widget', this.config.lang, view_config);
    
            view.isReady().then( () => {
                let $container = view.getContainer();


                if(this.mode == 'edit') {

                    $container.find('.sb-view-header-list-actions-set')
                    .append( 
                        UIHelper.createButton('action-edit', TranslationService.instant('SB_ACTIONS_BUTTON_ADD'), 'raised')
                        .on('click', async () => {
                            let purpose = (this.rel_type == 'many2many')?'add':'select';
    
                            // request a new Context for selecting an existing object to add to current selection
                            $('#sb-events').trigger('_openContext', {
                                entity: this.config.entity, 
                                type: 'list', 
                                name: 'default', 
                                domain: [], 
                                mode: 'view', 
                                purpose: purpose,
                                callback: (data:any) => {
                                    if(data && data.selection) {
                                        let ids = this.value.map( (o:any) => o.id);
                                        // 1) remove from current selection items (+ or -) that are in returned selection
                                        for(let i = ids.length-1; i >= 0; --i) {
                                            let item = Math.abs(ids[i]);
                                            if(data.selection.indexOf(item) > -1) {
                                                ids.splice(i, 1);
                                            }
                                        }
                                        // 2) append returned selection to current selection
                                        ids = ids.concat(data.selection);
                                        this.value = ids.map( (id:number) => ({id: id}) );
                                        $elem.trigger('_updatedWidget');
                                    }
                                }
                            });
                        })
                    )
                }
    
                // inject View in parent Context object
                $elem.append($container); 
            });
   
        }

        $elem.addClass('sb-widget').attr('id', this.getId());

        return $elem;
    }
    
}