import WidgetString from "./WidgetString";
import { UIHelper } from '../material-lib';

export default class WidgetFloat extends WidgetString {
    

    constructor(label: string, value: any, config: any) {
        super(label, value, config);
    }

    public render():JQuery {
        let $elem: JQuery = super.render();
        $elem.find('input').attr( "type", "number" );
        return $elem;
    }

    
}