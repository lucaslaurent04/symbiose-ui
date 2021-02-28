import Widget from "./Widget";
import { UIHelper } from '../material-lib';

export default class WidgetText extends Widget {
    
    
    constructor(label: string, value: any, config: {}) {
        super('text', label, value, config);
    }

    public render():JQuery {
        let value:string = this.value?this.value:'';
        switch(this.mode) {
            case 'edit':
                return UIHelper.createInput('', this.label, value);
            case 'view':
            default:
                return $('<span/>').text(value);
        }
        
    }
    
}