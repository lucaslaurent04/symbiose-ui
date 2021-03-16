import Widget from "./Widget";
import { UIHelper } from '../material-lib';

export default class WidgetSelect extends Widget {
        
    constructor(label: string, value: any, config: any) {
        super('select', label, value, config);
    }

    public render():JQuery {
        console.log('WidgetSelect::render', this.config, this.mode);
        let $elem: JQuery;
        let value:string = this.value?this.value:'';
        console.log(this.value, value);
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
                $elem = $('<span/>').text(value);
                $elem = UIHelper.createInputView('', this.label, value);                
                break;
        }
        $elem.addClass('sb-widget').attr('id', this.getId());


        return $elem;
    }
    
}