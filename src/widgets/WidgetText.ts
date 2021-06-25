import Widget from "./Widget";
import { UIHelper } from '../material-lib';

export default class WidgetText extends Widget {
    
    
    constructor(label: string, value: any, config: {}) {
        super('text', label, value, config);
    }

    public render():JQuery {
        let $elem: JQuery;
        let value:string = this.value?this.value:'';
        switch(this.mode) {
            case 'edit':
                $elem = UIHelper.createTextArea('', this.label, value);
                // setup handler for relaying value update to parent layout
                $elem.find('textarea').on('change', (event) => {
                    let $this = $(event.currentTarget);
                    this.value = $this.val();
                    $elem.trigger('_updatedWidget');
                });
                break;
            case 'view':
            default:
                $elem = $('<span/>').text(value);
                break;
        }

        $elem.addClass('sb-widget').addClass('sb-widget-mode-'+this.mode).attr('id', this.getId());
        return $elem;
        
    }
    
}