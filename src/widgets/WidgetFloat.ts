import Widget from "./Widget";
import Layout from "../Layout";

import WidgetString from "./WidgetString";

import { UIHelper } from '../material-lib';

export default class WidgetFloat extends WidgetString {
    

    constructor(layout: Layout, label: string, value: any, config: any) {
        super(layout, label, value, config);
    }

    public render():JQuery {
        let $elem: JQuery = super.render();
        $elem.find('input').attr( "type", "number" );
        return $elem;
    }

    
}