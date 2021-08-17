import WidgetString from "./WidgetString";
import Layout from "../Layout";

import { UIHelper } from '../material-lib';

export default class WidgetInteger extends WidgetString {
    

    constructor(layout: Layout, label: string, value: any, config: any) {
        super(layout, label, value, config);
    }
    
    public render():JQuery {
        let $elem: JQuery = super.render();
        $elem.find('input').attr( "type", "number" );
        return $elem;
    }
}