import Widget from "./Widget";

export default class WidgetText extends Widget {
    
    
    constructor(value: any) {
        super(value);
    }

    public render():JQuery {
        return $('<span/>').text(this.getValue());
    }
    
}