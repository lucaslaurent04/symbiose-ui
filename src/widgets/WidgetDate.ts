import Widget from "./Widget";
import { UIHelper } from '../material-lib';
import moment from 'moment/moment.js';
import { $, jqlocale } from "../jquery-lib";
import { environment } from "../environment";

export default class WidgetDate extends Widget {
    
    
    constructor(label: string, value: any, config: {}) {
        super('date', label, value, config);
    }

    public render(): JQuery {
        console.log('WidgetDate::render', this.value, this.config);
        let $elem: JQuery = $();
        let date = new Date(this.value);
        let value:any;

        switch(this.mode) {
            case 'edit':
                value = moment(date).format('L');
                $elem = UIHelper.createInput('', this.label, value, this.config.helper, 'calendar_today');
                // setup handler for relaying value update to parent layout
                $elem.find('input')
                .datepicker( {
                    showOn: "button", 
                    ...jqlocale[environment.locale], 
                    onClose: () => {
                        // give the focus back once the widget will have been refreshed
                        setTimeout( () => {
                            $('#'+this.getId()).find('input').first().trigger('focus');
                        }, 250);
                    }
                } )
                .on('change', (event:any) => {
                    // update widget value using jQuery `getDate`
                    let $this = $(event.currentTarget);
                    let date = $this.datepicker('getDate');
                    this.value = date.toISOString();
                    $elem.trigger('_updatedWidget');
                });
                break;
            case 'view':
            default:
                value = moment(date).format('LL');
                $elem = UIHelper.createInputView('', this.label, value);
                break;
        }
        $elem.addClass('sb-widget').attr('id', this.getId());

        return $elem;
    }
    
}