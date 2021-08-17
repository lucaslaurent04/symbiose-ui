import Widget from "./Widget";
import Layout from "../Layout";

import { UIHelper } from '../material-lib';

export default class WidgetSelect extends Widget {
        
    constructor(layout: Layout, label: string, value: any, config: any) {
        super(layout, 'select', label, value, config);
    }

    public render():JQuery {
        console.log('WidgetSelect::render', this.config, this.mode, this.value);
        let $elem: JQuery;
        let value:string = this.value?this.value:'';
        switch(this.mode) {
            case 'edit':
                $elem = UIHelper.createSelect('', this.label, this.config.values, value);
                // setup handler for relaying value update to parent layout
                $elem.find('input').on('change', (event) => {
                    console.log('WidgetSelect : received change event');
                    let $this = $(event.currentTarget);
                    this.value = $this.val();
                    $elem.trigger('_updatedWidget');
                });
                break;
            case 'view':
            default:
                let val:string = Array.isArray(this.config.values)?value:this.config.values[value];
                $elem = UIHelper.createInputView('', this.label, val);
                break;
        }
        $elem.addClass('sb-widget').addClass('sb-widget-mode-'+this.mode).attr('id', this.getId());

        return $elem;
    }
    
}