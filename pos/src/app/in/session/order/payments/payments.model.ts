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
        public order_payments_ids: any[] = []
    ) {}
}

export class OrderPayment {
    // index signature
    [key: string]: any;
    // model entity
    public static entity:string = 'sale\\pos\\OrderPayment';
    // constructor with public properties
    constructor(
        public id: number = 0,
        public order_id: number = 0,                
        public name: string = '',
        public status: string = '',
        public total_due: number = 0.0,
        public total_paid: number = 0.0,            
        public order_payment_parts_ids: any[] = []
    ) {}
}

export class OrderPaymentPart {
    // index signature
    [key: string]: any;
    // model entity
    public static entity:string = 'sale\\pos\\OrderPaymentPart';
    // constructor with public properties
    constructor(
        public id: number = 0,
        public order_payment_id: number = 0,
        public amount: number = 0.0,
        public payment_method: string = '',
        public booking_id: number = 0.0,
        public voucher_ref: string = ''
    ) {}
}