
export default class Widget {
    
    private value: string;
    
    constructor(value: any) {
        this.value = value;
    }
    
    public getValue() {
        return this.value;
    }
    
    /**
     * @return always returns a JQuery object
     */
    public render(): JQuery {
        return $();
    }
}