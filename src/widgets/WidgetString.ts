import Widget from "./Widget";
import Layout from "../Layout";

import { UIHelper } from '../material-lib';

export default class WidgetString extends Widget {
        
    constructor(layout: Layout, label: string, value: any, config: {}) {
        super(layout, 'string', label, value, config);
    }

    public setValue(value: any) {
        super.setValue(value);
        this.$elem.find('input').val(value).trigger('change');
        return this;
    }

    public render():JQuery {
        let value:string = this.value?this.value:'';
        switch(this.mode) {
            case 'edit':
                this.$elem = UIHelper.createInput('', this.label, value, this.config.helper, '', this.readonly);
                if(this.config.layout == 'list') {
                    this.$elem.css({"width": "calc(100% - 10px)"});
                }
                // setup handler for relaying value update to parent layout
                this.$elem.find('input').on('change', (event) => {
                    let $this = $(event.currentTarget);
                    this.value = $this.val();
                    this.$elem.trigger('_updatedWidget');
                });
                break;
            case 'view':
            default:
                this.$elem = UIHelper.createInputView('', this.label, value);
                break;
        }

        if(this.config.hasOwnProperty('header') && this.getLayout().getView().getType() == 'form') {
            this.$elem.addClass('title');
        }
                
        return this.$elem.addClass('sb-widget').addClass('sb-widget-mode-'+this.mode).addClass('sb-widget-mode-'+this.mode).attr('id', this.getId());
    }
    
}