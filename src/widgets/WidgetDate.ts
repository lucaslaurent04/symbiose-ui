import Widget from "./Widget";
import { UIHelper } from '../material-lib';

import { $, locale } from "../jquery-lib";
import { environment } from "../environment";

export default class WidgetDate extends Widget {
    
    
    constructor(label: string, value: any, config: {}) {
        super('date', label, value, config);
    }

    public render(): JQuery {
        console.log('WidgetDate::render', this.value);
        let $elem: JQuery = $();
        let value:string = this.value?(new Date(this.value)).toLocaleDateString():'';
        
        switch(this.mode) {
            case 'edit':
                $elem = UIHelper.createInput('', this.label, value);
                // setup handler for relaying value update to parent layout
                $elem.find('input')
                .datepicker( locale[environment.locale] )
                .on('change', (event:any) => {
                    console.log('WidgetDate : received change event');
                    let $this = $(event.currentTarget);
                    let date = $this.datepicker('getDate');
                    console.log(date);
                    $elem.trigger('_updatedWidget', date.toISOString());
                });            

                break;
            case 'view':
            default:
                $elem = UIHelper.createInputView('', this.label, value);
                break;
        }
        $elem.attr('id', this.getId());

        return $elem;
    }
    
}