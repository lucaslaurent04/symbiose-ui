import WidgetMany2Many from "./WidgetMany2Many";
import { UIHelper } from '../material-lib';
import View from "../View";
import { ApiService, TranslationService } from "../equal-services";

export default class WidgetOne2Many extends WidgetMany2Many {
    

    constructor(label: string, value: any, config: any) {
        super(label, value, config);
        this.rel_type = 'one2many';
    }
    
}