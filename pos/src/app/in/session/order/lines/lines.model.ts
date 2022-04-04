export class Order {
    // index signature
    [key: string]: any;
    // model entity
    public static entity:string = 'lodging\\sale\\pos\\Order';
    // constructor with public properties
    constructor(
        public id: number = 0,
        public created: Date = new Date(),
        public name: string = '',
        public status: string = '',
        public total: number = 0,
        public price: number = 0,
        public customer_id: any = 0,
        public has_invoice: boolean = false,
        public order_lines_ids: any[] = []
    ) {}
}

export class OrderLine {
    // index signature
    [key: string]: any;
    // model entity
    public static entity:string = 'sale\\pos\\OrderLine';
    // constructor with public properties
    constructor(
        public id: number = 0,
        public order_id: number = 0,
        public created: Date = new Date(),
        public name: string = '',
        public unit_price: number = 0.0,
        public vat_rate: number = 0.0,
        public discount: number = 0.0,
        public qty: number = 0,
        public free_qty: number = 0,
        public total: number = 0,
        public price: number = 0
    ) {}
}