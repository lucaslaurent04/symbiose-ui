import Widget from "./Widget";

export default class WidgetLink extends Widget {
    
    
    constructor(value: any) {
        super(value);
    }

    public render():JQuery {
        return $('<a href/>').text(this.getValue());
    }
    
}