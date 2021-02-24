import Widget from "./Widget";

export default class WidgetDate extends Widget {
    
    
    constructor(value: any) {
        super(value);
    }

    public render(): JQuery {
        return $('<span/>').text(new Date(this.getValue()).toLocaleDateString());
    }
    
}