import Widget from "./Widget";
import Layout from "../Layout";

import { UIHelper } from '../material-lib';

export default class WidgetText extends Widget {
    
    
    constructor(layout: Layout, label: string, value: any, config: {}) {
        super(layout, 'text', label, value, config);
    }

    public change(value: any) {
        this.$elem.find('textarea').val(value).trigger('change');
    }

    public render():JQuery {
        let value:string = this.value?this.value:'';
        switch(this.mode) {
            case 'edit':
                this.$elem = UIHelper.createTextArea('', this.label, value, this.config.description);
                // setup handler for relaying value update to parent layout
                this.$elem.find('textarea').on('change', (event) => {
                    let $this = $(event.currentTarget);
                    this.value = $this.val();
                    this.$elem.trigger('_updatedWidget');
                });
                break;
            case 'view':
            default:
                this.$elem = UIHelper.createTextArea('', this.label, value, '', '', true);
                break;
        }

        this.$elem.addClass('sb-widget').addClass('sb-widget-mode-'+this.mode).attr('id', this.getId());
        return this.$elem;
        
    }
    
}