import WidgetString from "./WidgetString";
import Layout from "../Layout";

import { UIHelper } from '../material-lib';

export default class WidgetInteger extends WidgetString {
    

    constructor(layout: Layout, label: string, value: any, config: any) {
        super(layout, label, value, config);
    }
    
    public render():JQuery {
        this.$elem = super.render();
        this.$elem.find('input').attr( "type", "number" );
        return this.$elem;
    }
}