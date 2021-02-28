import Widget from "./Widget";

export default class WidgetLink extends Widget {
    
    
    constructor(label: string, value: any, config: {}) {
        super('link', label, value, config);
    }

    public render():JQuery {
        return $('<a href/>').text(this.getValue());
    }
    
}