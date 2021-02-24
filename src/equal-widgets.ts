import Widget from "./widgets/Widget";
import WidgetInput from "./widgets/WidgetInput";
import WidgetDate from "./widgets/WidgetDate";
import WidgetText from "./widgets/WidgetText";
import WidgetLink from "./widgets/WidgetLink";


class WidgetFactory {
// todo : add 'id' and 'label'
    public static getWidget(type: string, value: any):Widget {
        switch(type) {
            case 'datetime':
                return new WidgetDate(value);
            case 'link':
                return new WidgetLink(value);
            case 'input':
                return new WidgetInput(value);    
            default:
                return new WidgetText(value);
        }
    }

}

export { WidgetFactory, Widget }