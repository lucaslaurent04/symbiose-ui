import Widget from "./Widget";
import { UIHelper } from '../material-lib';

export default class WidgetInput extends Widget {
    
    
    constructor(value: any) {
        super(value);
    }

    public render() :JQuery {
        let $elem = UIHelper.createUIInput('', this.getValue());
        return $elem;
    }
    
}