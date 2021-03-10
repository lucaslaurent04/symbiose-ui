
export default class Widget {
    
    protected value: any;
    protected label: string;    
    protected type: string;
    
    protected mode: string = ''; 
    protected id: string = ''; 
    
    protected readonly: boolean = false;

    protected config: any;
    
    constructor(type: string, label: string, value: any, config: any) {
        console.log('Widget constructor', type, label, value, config);
        this.value = value;
        this.label = label;
        this.type = type;
        this.config = config;
        // assign default mode
        this.mode = 'view';

        this.init();
    }

    private init() {
        var S4 = () => (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        // generate a random guid
        this.id = (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }

    public getId() {
        return this.id;
    }

    public getValue() {
        return this.value;
    }

    public getLabel() {
        return this.label;
    }

    public getType() {
        return this.type;
    }

    public getMode() {
        return this.mode;
    }

    public getConfig() {
        return this.config;
    }


    public setValue(value: any) {
        console.log('Widget::setValue', value);
        this.value = value;
        return this;
    }

    public setLabel(label: string) {
        this.label = label;
        return this;
    }

    public setType(type: string) {
        this.type = type;
        return this;
    }

    public setMode(mode: string) {
        this.mode = mode;
        return this;
    }

    public setReadonly(readonly: boolean) {
        this.readonly = readonly;
        return this;
    }

    public setConfig(config:any) {
        this.config = config;
        return this;
    }

    /**
     * @return always returns a JQuery object
     */
    public render(): JQuery {
        return $();
    }

    public attach(): JQuery {
        let $elem = $('<div/>');
        $elem.addClass('sb-widget').attr('id', this.getId());
        return $elem;
    }
    
}