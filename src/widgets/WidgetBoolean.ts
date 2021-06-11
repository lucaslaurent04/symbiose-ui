import Widget from "./Widget";
import { UIHelper } from '../material-lib';

export default class WidgetBoolean extends Widget {
        
    constructor(label: string, value: any, config: {}) {
        super('boolean', label, value, config);
    }

    public render():JQuery {
        let $elem: JQuery;

        switch(this.mode) {
            case 'edit':
                $elem = UIHelper.createSwitch('', this.label, this.value, this.config.helper, '', this.readonly);
                // setup handler for relaying value update to parent layout
                $elem.find('input')
                .on('change', (event:any) => {
                    console.log('WidgetBoolean onchange');
                    let $this = $(event.currentTarget);
                    this.value = $this.prop( "checked" )
                    $elem.trigger('_updatedWidget');
                });
                break;
            case 'view':
            default:
                /*
                let value:string = (this.value)?'true':'false';
                $elem = UIHelper.createInputView('', this.label, value);
                */
                $elem = UIHelper.createSwitch('', this.label, this.value, this.config.helper, '', true);
                break;
        }
        return $elem.addClass('sb-widget').attr('id', this.getId());
    }
    
}