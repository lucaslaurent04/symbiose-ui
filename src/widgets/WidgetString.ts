import Widget from "./Widget";
import { UIHelper } from '../material-lib';

export default class WidgetString extends Widget {
        
    constructor(label: string, value: any, config: {}) {
        super('string', label, value, config);
    }

    public render():JQuery {
        let $elem: JQuery;
        let value:string = this.value?this.value:'';
        switch(this.mode) {
            case 'edit':
                $elem = UIHelper.createInput('', this.label, value, this.config.helper, '', this.readonly);
                // setup handler for relaying value update to parent layout
                $elem.find('input').on('change', (event) => {
                    let $this = $(event.currentTarget);
                    this.value = $this.val();
                    $elem.trigger('_updatedWidget');
                });
                break;
            case 'view':
            default:
                $elem = UIHelper.createInputView('', this.label, value);                
                break;
        }
        $elem.addClass('sb-widget').attr('id', this.getId());


        return $elem;
    }
    
}