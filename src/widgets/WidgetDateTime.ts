import Widget from "./Widget";
import { UIHelper } from '../material-lib';
import moment from 'moment/moment.js';
import { $, jqlocale } from "../jquery-lib";
import { environment } from "../environment";

export default class WidgetDateTime extends Widget {
    
    
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
                var format = moment.localeData().longDateFormat('L') + ' ' + moment.localeData().longDateFormat('LT');
                value = moment(date).format(format);
                $elem = UIHelper.createInput('', this.label, value, this.config.helper, 'calendar_today');
                // setup handler for relaying value update to parent layout

                $elem.find('input')
                .on('keypress', (event:any) => {
                    if (event.which == 9) {
// todo: force focus to the next input                        
                        console.log('#######tab press');
                       event.preventDefault();
                    }
                })
                .on('change', (event) => {
                    let $this = $(event.currentTarget);
                    this.value = $this.val();
                    let mdate = moment(this.value, format, true);
                    if(mdate.isValid()) {
                        date = mdate.toDate();
                        $datetimepicker.datepicker('setDateTime', date);    
                    }
                });

                let $datetimepicker = $('<input type="text" />')
                .addClass('sb-view-layout-form-input-decoy')
                .datepicker( {
                    datetime: true, 
                    twentyFour: true, 
                    showSeconds: false, 
                    ...jqlocale[environment.locale],
                    onClose: () => {
                        let date = $datetimepicker.datepicker('getDate');
                        this.value = date.toISOString();
                        $elem.trigger('_updatedWidget');
                        // give the focus back once the widget will have been refreshed
                        setTimeout( () => {
                            $('#'+this.getId()).find('input').first().trigger('focus');
                        }, 250);
                    }
                } )
                .on('change', (event:any) => {
                    // update widget value using jQuery `getDate`
                    let $this = $(event.currentTarget);
                    let new_date = $this.datepicker('getDate');
                    // $elem.trigger('_updatedWidget', date.toISOString());
                    $elem.find('input').val(moment(new_date).format(format));
                });
                $elem.append($datetimepicker);

                $elem.append(
                    $('<div />').addClass('sb-view-layout-form-input-button')
                    .one('click', () => {
                        $datetimepicker.datepicker('setDateTime', date);
                    })
                    .on('click', () => {
                        $datetimepicker.datepicker('show');
                    })
                );

                break;
            case 'view':
            default:
                value = moment(date).format('LLL');
                $elem = UIHelper.createInputView('', this.label, value);
                break;
        }
        $elem.addClass('sb-widget').attr('id', this.getId());

        return $elem;
    }
    
}